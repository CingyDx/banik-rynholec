import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import {
  calendarResources,
  calendarStatuses,
  type CalendarEvent,
  type CalendarResourceId,
  type CalendarStatus,
} from "../../content/calendar";

const workbookColumns = [
  "ID",
  "Název",
  "Prostor",
  "Skupina",
  "Stav",
  "Začátek",
  "Konec",
  "Kontakt jméno",
  "Kontakt",
  "Poznámka",
] as const;

type WorkbookColumn = (typeof workbookColumns)[number];

const resourceByLabel = new Map(calendarResources.map((resource) => [resource.label.toLowerCase(), resource]));
const resourceById = new Map(calendarResources.map((resource) => [resource.id, resource]));
const statusSet = new Set<CalendarStatus>(calendarStatuses);

export function exportCalendarEventsToXlsx(events: readonly CalendarEvent[]): Uint8Array {
  const rows = [
    workbookColumns,
    ...events.map((event) => [
      event.id,
      event.title,
      event.resourceLabel,
      event.resourceGroup,
      event.status,
      event.start,
      event.end,
      event.contactName,
      event.contactValue,
      event.note,
    ]),
  ];

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(contentTypesXml),
    "_rels/.rels": strToU8(rootRelationshipsXml),
    "docProps/app.xml": strToU8(appXml),
    "docProps/core.xml": strToU8(coreXml),
    "xl/workbook.xml": strToU8(workbookXml),
    "xl/_rels/workbook.xml.rels": strToU8(workbookRelationshipsXml),
    "xl/styles.xml": strToU8(stylesXml),
    "xl/worksheets/sheet1.xml": strToU8(createWorksheetXml(rows)),
  };

  return zipSync(files, { level: 6 });
}

export async function importCalendarEventsFromFile(file: File): Promise<CalendarEvent[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (extension === "csv") {
    return rowsToEvents(parseCsv(strFromU8(bytes)));
  }

  if (extension === "xlsx") {
    return importXlsx(bytes);
  }

  if (extension === "xls") {
    const text = strFromU8(bytes);
    if (text.trim().startsWith("<")) {
      return rowsToEvents(parseHtmlTable(text));
    }
    return rowsToEvents(parseCsv(text));
  }

  throw new Error("Soubor musí být ve formátu .xlsx, .xls nebo .csv.");
}

function importXlsx(bytes: Uint8Array): CalendarEvent[] {
  const workbook = unzipSync(bytes);
  const sheetPath = Object.keys(workbook).find((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path));

  if (!sheetPath) {
    throw new Error("V souboru nebyl nalezen žádný list.");
  }

  const sharedStrings = parseSharedStrings(workbook["xl/sharedStrings.xml"]);
  const xml = strFromU8(workbook[sheetPath]);
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const rows = Array.from(document.querySelectorAll("sheetData row")).map((row) => {
    const values: string[] = [];
    for (const cell of Array.from(row.querySelectorAll("c"))) {
      const ref = cell.getAttribute("r") ?? "";
      const columnIndex = columnNameToIndex(ref.replace(/\d+/g, ""));
      values[columnIndex] = readCellValue(cell, sharedStrings);
    }
    return values;
  });

  return rowsToEvents(rows);
}

function parseSharedStrings(bytes?: Uint8Array): string[] {
  if (!bytes) {
    return [];
  }

  const xml = strFromU8(bytes);
  const document = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(document.querySelectorAll("si")).map((item) =>
    Array.from(item.querySelectorAll("t"))
      .map((text) => text.textContent ?? "")
      .join(""),
  );
}

function readCellValue(cell: Element, sharedStrings: readonly string[]): string {
  const type = cell.getAttribute("t");

  if (type === "inlineStr") {
    return Array.from(cell.querySelectorAll("is t"))
      .map((text) => text.textContent ?? "")
      .join("");
  }

  const raw = cell.querySelector("v")?.textContent ?? "";
  if (type === "s") {
    return sharedStrings[Number(raw)] ?? "";
  }
  return raw;
}

function rowsToEvents(rows: string[][]): CalendarEvent[] {
  const [headerRow, ...bodyRows] = rows.filter((row) => row.some((cell) => cell.trim().length > 0));

  if (!headerRow) {
    throw new Error("Soubor neobsahuje žádná data.");
  }

  const headerIndexes = new Map(headerRow.map((header, index) => [normalizeHeader(header), index]));

  return bodyRows
    .map((row, index) => {
      const read = (header: WorkbookColumn) => row[headerIndexes.get(normalizeHeader(header)) ?? -1]?.trim() ?? "";
      const resource = resolveResource(read("Prostor"));
      const status = resolveStatus(read("Stav"));
      const title = read("Název") || `${resource.label} ${status}`;

      return {
        id: read("ID") || `import-${Date.now()}-${index}`,
        title,
        resourceId: resource.id,
        resourceLabel: resource.label,
        resourceGroup: resource.group,
        status,
        start: normalizeDateTime(read("Začátek")),
        end: normalizeDateTime(read("Konec")),
        contactName: read("Kontakt jméno") || "Lorem ipsum",
        contactValue: read("Kontakt") || "info@banikrynholec.cz",
        note: read("Poznámka") || "Lorem ipsum dolor sit amet.",
      } satisfies CalendarEvent;
    })
    .filter((event) => event.start && event.end);
}

function resolveResource(value: string) {
  const normalized = value.toLowerCase();
  return resourceById.get(value as CalendarResourceId) ?? resourceByLabel.get(normalized) ?? calendarResources[0];
}

function resolveStatus(value: string): CalendarStatus {
  const normalized = value.toLowerCase() as CalendarStatus;
  return statusSet.has(normalized) ? normalized : "čeká na schválení";
}

function normalizeDateTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return toInputDateTime(parsed);
  }

  return trimmed;
}

function toInputDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseCsv(text: string): string[][] {
  const delimiter = text.includes(";") && !text.includes(",") ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function parseHtmlTable(text: string): string[][] {
  const document = new DOMParser().parseFromString(text, "text/html");
  return Array.from(document.querySelectorAll("tr")).map((row) =>
    Array.from(row.querySelectorAll("th,td")).map((cell) => cell.textContent?.trim() ?? ""),
  );
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createWorksheetXml(rows: readonly (readonly string[])[]): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnIndexToName(columnIndex)}${rowIndex + 1}`;
          return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return xmlDeclaration(`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${workbookColumns
    .map((_, index) => `<col min="${index + 1}" max="${index + 1}" width="${index === 1 || index === 9 ? 28 : 18}" customWidth="1"/>`)
    .join("")}</cols><sheetData>${rowXml}</sheetData><autoFilter ref="A1:J${rows.length}"/></worksheet>`);
}

function columnIndexToName(index: number): string {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function columnNameToIndex(name: string): number {
  return name.split("").reduce((index, char) => index * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function xmlDeclaration(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${content}`;
}

const contentTypesXml = xmlDeclaration(
  `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
);

const rootRelationshipsXml = xmlDeclaration(
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
);

const workbookXml = xmlDeclaration(
  `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Kalendář" sheetId="1" r:id="rId1"/></sheets></workbook>`,
);

const workbookRelationshipsXml = xmlDeclaration(
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
);

const stylesXml = xmlDeclaration(
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Inter"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`,
);

const appXml = xmlDeclaration(
  `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>TJ Baník Rynholec Calendar</Application></Properties>`,
);

const coreXml = xmlDeclaration(
  `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>TJ Baník Rynholec Kalendář</dc:title><dc:creator>Cingy.Tech</dc:creator><cp:lastModifiedBy>Cingy.Tech</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-23T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-23T00:00:00Z</dcterms:modified></cp:coreProperties>`,
);
