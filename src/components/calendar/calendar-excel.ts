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

const yearTemplateColumns = [
  "Datum",
  "Den",
  "Od",
  "Do",
  "Název",
  "Prostor",
  "Stav",
  "Kontakt jméno",
  "Kontakt",
  "Poznámka",
  "ID",
] as const;

const dayColumnCount = 2;
const daySlotCount = 4;
const daySlotFields = [
  { key: "start", label: "⏱ Od", fallback: "Od" },
  { key: "end", label: "⏱ Do", fallback: "Do" },
  { key: "title", label: "📝 Název", fallback: "Název" },
  { key: "resource", label: "📍 Prostor", fallback: "Prostor" },
  { key: "status", label: "✅ Stav", fallback: "Stav" },
  { key: "contactName", label: "👤 Jméno", fallback: "Kontakt jméno" },
  { key: "contactValue", label: "☎ Kontakt", fallback: "Kontakt" },
  { key: "note", label: "💬 Poznámka", fallback: "Poznámka" },
  { key: "id", label: "ID", fallback: "ID" },
] as const;

type WorkbookColumn = (typeof workbookColumns)[number];
type YearTemplateColumn = (typeof yearTemplateColumns)[number];
type DaySlotFieldKey = (typeof daySlotFields)[number]["key"];
type WorksheetDefinition = {
  autoFilter?: string;
  cols?: readonly number[];
  frozenColumns?: number;
  frozenRows?: number;
  heightForRow?: (rowIndex: number) => number | undefined;
  merges?: readonly string[];
  rows: readonly (readonly string[])[];
  sheetName: string;
  styleForCell?: (rowIndex: number, columnIndex: number, value: string, row: readonly string[]) => number;
  validations?: readonly string[];
};

export const calendarTemplateYear = 2026;

export const calendarTemplateMonthSheets = [
  { index: 0, label: "01 Leden", days: 31 },
  { index: 1, label: "02 Únor", days: 28 },
  { index: 2, label: "03 Březen", days: 31 },
  { index: 3, label: "04 Duben", days: 30 },
  { index: 4, label: "05 Květen", days: 31 },
  { index: 5, label: "06 Červen", days: 30 },
  { index: 6, label: "07 Červenec", days: 31 },
  { index: 7, label: "08 Srpen", days: 31 },
  { index: 8, label: "09 Září", days: 30 },
  { index: 9, label: "10 Říjen", days: 31 },
  { index: 10, label: "11 Listopad", days: 30 },
  { index: 11, label: "12 Prosinec", days: 31 },
] as const;

const daySlotDefaultTimes = [
  ["08:00", "10:00"],
  ["10:00", "12:00"],
  ["16:00", "18:00"],
  ["18:00", "20:00"],
] as const;

const weekdays = ["ne", "po", "út", "st", "čt", "pá", "so"] as const;
const resourceByLabel = new Map(
  calendarResources.flatMap((resource) => [
    [normalizeHeader(resource.label), resource],
    [normalizeHeader(resource.id), resource],
  ]),
);
const resourceById = new Map(calendarResources.map((resource) => [resource.id, resource]));

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

  return createWorkbook([
    {
      sheetName: "Kalendář",
      rows,
      frozenRows: 1,
      cols: workbookColumns.map((_, index) => (index === 1 || index === 9 ? 28 : 18)),
      autoFilter: `A1:J${rows.length}`,
    },
  ]);
}

export function exportCalendarTemplateToXlsx(): Uint8Array {
  return createWorkbook(createTemplateWorksheets());
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

function createTemplateWorksheets(): WorksheetDefinition[] {
  const resourceRows = calendarResources.map((resource) => [resource.label, resource.group]);
  const statusRows = calendarStatuses.map((status) => [status]);

  return [
    {
      sheetName: "Návod",
      cols: [28, 112],
      merges: ["A1:B1"],
      rows: [
        [`TJ Baník Rynholec - roční kalendář ${calendarTemplateYear}`, ""],
        ["Jak vyplnit", "Každý měsíc má vlastní list. Každý den je jeden řádek a vpravo jsou 4 připravené akce pro daný den."],
        ["Co stačí vyplnit", "U akce obvykle stačí Název, Prostor a Stav. Čas, kontakt, poznámka a ID jsou dobrovolné."],
        ["Prázdné akce", "Pokud je celý slot akce prázdný, web ho při importu přeskočí."],
        ["Časy", "Když Od/Do necháte prázdné, web použije připravený čas podle slotu: 08-10, 10-12, 16-18 nebo 18-20."],
        ["Prostor", "Používejte hodnoty z listu Číselníky: Hřiště, Sauna, Posilovna, Klubovna, A tým, Mládež."],
        ["Stav", "Používejte volno, obsazeno, trénink, zápas nebo čeká na schválení."],
        ["Import", "Po vyplnění soubor uložte jako .xlsx a nahrajte ho v administraci přes Import Excel."],
        ["Příklad", "1. 7. -> Akce 1: 17:00, 18:30, Trénink A tým, A tým, trénink. Zbytek může zůstat prázdný."],
      ],
    },
    {
      sheetName: "Číselníky",
      cols: [22, 22, 22],
      rows: [
        ["Prostor", "Skupina", "Stav"],
        ...Array.from({ length: Math.max(resourceRows.length, statusRows.length) }, (_, index) => [
          resourceRows[index]?.[0] ?? "",
          resourceRows[index]?.[1] ?? "",
          statusRows[index]?.[0] ?? "",
        ]),
      ],
      frozenRows: 1,
      autoFilter: "A1:C7",
    },
    ...calendarTemplateMonthSheets.map((month) => createMonthWorksheet(month.index, month.label, month.days)),
  ];
}

function createMonthWorksheet(monthIndex: number, sheetName: string, days: number): WorksheetDefinition {
  const totalColumns = dayColumnCount + daySlotCount * daySlotFields.length;
  const lastColumn = columnIndexToName(totalColumns - 1);
  const rows: string[][] = [
    fillRow(totalColumns, `${sheetName} ${calendarTemplateYear}`),
    fillRow(totalColumns, "Každý den je jeden řádek. Vyplňte jen akce, které se opravdu konají; prázdné sloty web přeskočí."),
    createMonthGroupHeader(),
    createMonthColumnHeader(),
  ];

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(calendarTemplateYear, monthIndex, day);
    const dateValue = toDateOnly(date);
    rows.push([dateValue, weekdays[date.getDay()], ...Array.from({ length: totalColumns - dayColumnCount }, () => "")]);
  }

  const dataStartRow = 5;
  const dataEndRow = rows.length;
  const validations = Array.from({ length: daySlotCount }, (_, slotIndex) => {
    const startColumnIndex = dayColumnCount + slotIndex * daySlotFields.length;
    const resourceColumn = columnIndexToName(startColumnIndex + 3);
    const statusColumn = columnIndexToName(startColumnIndex + 4);
    return [
      createListValidation(`${resourceColumn}${dataStartRow}:${resourceColumn}${dataEndRow}`, "'Číselníky'!$A$2:$A$7"),
      createListValidation(`${statusColumn}${dataStartRow}:${statusColumn}${dataEndRow}`, "'Číselníky'!$C$2:$C$6"),
    ];
  }).flat();

  return {
    sheetName,
    rows,
    frozenRows: 4,
    frozenColumns: 2,
    cols: [14, 9, ...Array.from({ length: daySlotCount }).flatMap(() => [9, 9, 28, 18, 20, 22, 24, 42, 16])],
    autoFilter: `A4:${lastColumn}${rows.length}`,
    merges: [
      `A1:${lastColumn}1`,
      `A2:${lastColumn}2`,
      "A3:B3",
      ...Array.from({ length: daySlotCount }, (_, slotIndex) => {
        const start = dayColumnCount + slotIndex * daySlotFields.length;
        const end = start + daySlotFields.length - 1;
        return `${columnIndexToName(start)}3:${columnIndexToName(end)}3`;
      }),
    ],
    heightForRow: (rowIndex) => (rowIndex === 0 ? 30 : rowIndex === 1 ? 36 : rowIndex === 2 || rowIndex === 3 ? 25 : 23),
    styleForCell: (rowIndex, columnIndex, _value, row) => {
      if (rowIndex === 0) return 3;
      if (rowIndex === 1) return 4;
      if (rowIndex === 2) return 5;
      if (rowIndex === 3) return 2;
      if (rowIndex >= 4 && (row[1] === "so" || row[1] === "ne")) return 6;
      if (rowIndex >= 4 && columnIndex < dayColumnCount) return 7;
      return 0;
    },
    validations,
  };
}

function fillRow(length: number, firstValue: string): string[] {
  return [firstValue, ...Array.from({ length: length - 1 }, () => "")];
}

function createMonthGroupHeader(): string[] {
  const row = fillRow(dayColumnCount + daySlotCount * daySlotFields.length, "Den");
  for (let slot = 1; slot <= daySlotCount; slot += 1) {
    row[dayColumnCount + (slot - 1) * daySlotFields.length] = `Akce ${slot}`;
  }
  return row;
}

function createMonthColumnHeader(): string[] {
  return [
    "Datum",
    "Den",
    ...Array.from({ length: daySlotCount }).flatMap((_, slotIndex) =>
      daySlotFields.map((field) => `${slotIndex + 1} ${field.label}`),
    ),
  ];
}

function importXlsx(bytes: Uint8Array): CalendarEvent[] {
  const workbook = unzipSync(bytes);
  const sheetPaths = Object.keys(workbook)
    .filter((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path))
    .sort((left, right) => sheetNumber(left) - sheetNumber(right));

  if (sheetPaths.length === 0) {
    throw new Error("V souboru nebyl nalezen žádný list.");
  }

  const sharedStrings = parseSharedStrings(workbook["xl/sharedStrings.xml"]);
  const events = sheetPaths.flatMap((sheetPath) => rowsToEvents(readWorksheetRows(workbook[sheetPath], sharedStrings), true));
  if (events.length > 0) {
    return events;
  }

  const hasRecognizedCalendarSheet = sheetPaths.some((sheetPath) =>
    hasRecognizedHeader(readWorksheetRows(workbook[sheetPath], sharedStrings)),
  );
  if (hasRecognizedCalendarSheet) {
    return [];
  }

  throw new Error("Soubor neobsahuje žádný rozpoznatelný kalendářový list.");
}

function readWorksheetRows(bytes: Uint8Array, sharedStrings: readonly string[]): string[][] {
  const xml = strFromU8(bytes);
  const document = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(document.querySelectorAll("sheetData row")).map((row) => {
    const values: string[] = [];
    for (const cell of Array.from(row.querySelectorAll("c"))) {
      const ref = cell.getAttribute("r") ?? "";
      const columnIndex = columnNameToIndex(ref.replace(/\d+/g, ""));
      values[columnIndex] = readCellValue(cell, sharedStrings);
    }
    return values;
  });
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

function rowsToEvents(rows: string[][], allowMissingHeader = false): CalendarEvent[] {
  const filledRows = rows.filter((row) => row.some((cell) => cell.trim().length > 0));
  const headerIndex = filledRows.findIndex((row) => isEventTableHeader(row) || isYearTemplateHeader(row) || isDaySlotTemplateHeader(row));

  if (headerIndex < 0) {
    if (allowMissingHeader) {
      return [];
    }
    throw new Error("Soubor neobsahuje žádná data.");
  }

  const headerRow = filledRows[headerIndex]!;
  const bodyRows = filledRows.slice(headerIndex + 1);
  const headerIndexes = new Map(headerRow.map((header, index) => [normalizeHeader(header), index]));

  if (isDaySlotTemplateHeader(headerRow)) {
    return daySlotRowsToEvents(bodyRows, headerRow);
  }

  if (isYearTemplateHeader(headerRow)) {
    return yearRowsToEvents(bodyRows, headerIndexes);
  }

  return eventTableRowsToEvents(bodyRows, headerIndexes);
}

function eventTableRowsToEvents(bodyRows: string[][], headerIndexes: Map<string, number>): CalendarEvent[] {
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
        contactName: read("Kontakt jméno") || "TJ Baník Rynholec",
        contactValue: read("Kontakt") || "info@banikrynholec.cz",
        note: read("Poznámka") || "Bez poznámky.",
      } satisfies CalendarEvent;
    })
    .filter((event) => event.start && event.end);
}

function yearRowsToEvents(bodyRows: string[][], headerIndexes: Map<string, number>): CalendarEvent[] {
  return bodyRows
    .filter((row) => hasYearTemplateContent(row, headerIndexes))
    .map((row, index) => {
      const read = (header: YearTemplateColumn) => row[headerIndexes.get(normalizeHeader(header)) ?? -1]?.trim() ?? "";
      const resource = resolveResource(read("Prostor"));
      const status = resolveStatus(read("Stav"));
      const date = read("Datum");
      const start = combineDateAndTime(date, read("Od"));
      const end = combineDateAndTime(date, read("Do"));
      const title = read("Název") || `${resource.label} ${status}`;

      return {
        id: read("ID") || `offline-${date}-${index + 1}`,
        title,
        resourceId: resource.id,
        resourceLabel: resource.label,
        resourceGroup: resource.group,
        status,
        start,
        end,
        contactName: read("Kontakt jméno") || "TJ Baník Rynholec",
        contactValue: read("Kontakt") || "info@banikrynholec.cz",
        note: read("Poznámka") || "Bez poznámky.",
      } satisfies CalendarEvent;
    })
    .filter((event) => event.start && event.end);
}

function daySlotRowsToEvents(bodyRows: string[][], headerRow: readonly string[]): CalendarEvent[] {
  const dateIndex = headerRow.findIndex((header) => normalizeHeader(header) === "datum");
  const slotIndexes = buildDaySlotIndexes(headerRow);
  const events: CalendarEvent[] = [];

  for (const [rowIndex, row] of bodyRows.entries()) {
    const date = row[dateIndex]?.trim() ?? "";
    if (!normalizeDateOnly(date)) {
      continue;
    }

    for (const [slotNumber, indexes] of slotIndexes.entries()) {
      if (!hasDaySlotContent(row, indexes)) {
        continue;
      }

      const read = (field: DaySlotFieldKey) => row[indexes[field] ?? -1]?.trim() ?? "";
      const defaultTimes = daySlotDefaultTimes[slotNumber - 1] ?? daySlotDefaultTimes[0];
      const resource = resolveResource(read("resource"));
      const status = resolveStatus(read("status"));
      const startTime = normalizeTime(read("start")) || defaultTimes[0];
      const endTime = normalizeTime(read("end")) || defaultTimes[1];
      const title = read("title") || `${resource.label} ${status}`;
      const start = combineDateAndTime(date, startTime);
      const end = combineDateAndTime(date, endTime);

      events.push({
        id: read("id") || `offline-${normalizeDateOnly(date)}-slot${slotNumber}-${rowIndex + 1}`,
        title,
        resourceId: resource.id,
        resourceLabel: resource.label,
        resourceGroup: resource.group,
        status,
        start,
        end,
        contactName: read("contactName") || "TJ Baník Rynholec",
        contactValue: read("contactValue") || "info@banikrynholec.cz",
        note: read("note") || "Bez poznámky.",
      });
    }
  }

  return events.filter((event) => event.start && event.end);
}

function buildDaySlotIndexes(headerRow: readonly string[]): Map<number, Partial<Record<DaySlotFieldKey, number>>> {
  const slots = new Map<number, Partial<Record<DaySlotFieldKey, number>>>();

  for (const [columnIndex, header] of headerRow.entries()) {
    const parsed = parseDaySlotHeader(header);
    if (!parsed) {
      continue;
    }
    const current = slots.get(parsed.slot) ?? {};
    current[parsed.field] = columnIndex;
    slots.set(parsed.slot, current);
  }

  return new Map([...slots.entries()].sort(([left], [right]) => left - right));
}

function parseDaySlotHeader(header: string): { field: DaySlotFieldKey; slot: number } | null {
  const normalized = normalizeLooseHeader(header);
  const match = /^(\d+)\s+(.+)$/.exec(normalized);
  if (!match) {
    return null;
  }

  const slot = Number(match[1]);
  const label = match[2] ?? "";
  const field = resolveDaySlotField(label);
  return field ? { field, slot } : null;
}

function resolveDaySlotField(label: string): DaySlotFieldKey | null {
  if (label === "od") return "start";
  if (label === "do") return "end";
  if (label.includes("nazev")) return "title";
  if (label.includes("prostor")) return "resource";
  if (label.includes("stav")) return "status";
  if (label.includes("jmeno")) return "contactName";
  if (label.includes("kontakt") || label.includes("telefon") || label.includes("email") || label.includes("mail")) return "contactValue";
  if (label.includes("poznamka")) return "note";
  if (label === "id") return "id";
  return null;
}

function hasDaySlotContent(row: string[], indexes: Partial<Record<DaySlotFieldKey, number>>): boolean {
  const contentFields: DaySlotFieldKey[] = ["title", "resource", "status", "contactName", "contactValue", "note", "id"];
  return contentFields.some((field) => (row[indexes[field] ?? -1] ?? "").trim().length > 0);
}

function hasYearTemplateContent(row: string[], headerIndexes: Map<string, number>): boolean {
  const contentHeaders: YearTemplateColumn[] = ["Název", "Prostor", "Stav", "Kontakt jméno", "Kontakt", "Poznámka", "ID"];
  return contentHeaders.some((header) => (row[headerIndexes.get(normalizeHeader(header)) ?? -1] ?? "").trim().length > 0);
}

function hasRecognizedHeader(rows: string[][]): boolean {
  return rows.some((row) => isEventTableHeader(row) || isYearTemplateHeader(row) || isDaySlotTemplateHeader(row));
}

function isEventTableHeader(row: readonly string[]): boolean {
  const headers = new Set(row.map(normalizeHeader));
  return ["nazev", "prostor", "stav", "zacatek", "konec"].every((header) => headers.has(header));
}

function isYearTemplateHeader(row: readonly string[]): boolean {
  const headers = new Set(row.map(normalizeHeader));
  return ["datum", "od", "do", "nazev", "prostor", "stav"].every((header) => headers.has(header));
}

function isDaySlotTemplateHeader(row: readonly string[]): boolean {
  const headers = new Set(row.map(normalizeHeader));
  const slotFields = buildDaySlotIndexes(row);
  return headers.has("datum") && headers.has("den") && [...slotFields.values()].some((slot) => slot.title && slot.resource && slot.status);
}

function resolveResource(value: string) {
  const normalized = normalizeHeader(value);
  return resourceById.get(value as CalendarResourceId) ?? resourceByLabel.get(normalized) ?? calendarResources[0];
}

function resolveStatus(value: string): CalendarStatus {
  const normalized = normalizeHeader(value);
  return calendarStatuses.find((status) => normalizeHeader(status) === normalized) ?? "čeká na schválení";
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

function combineDateAndTime(dateValue: string, timeValue: string): string {
  const date = normalizeDateOnly(dateValue);
  const time = normalizeTime(timeValue);
  return date && time ? `${date}T${time}` : "";
}

function normalizeDateOnly(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return toDateOnly(parsed);
  }
  return "";
}

function normalizeTime(value: string): string {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})/.exec(trimmed);
  if (!match) {
    return "";
  }
  return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

function toInputDateTime(date: Date): string {
  return `${toDateOnly(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
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

function normalizeLooseHeader(value: string): string {
  return normalizeHeader(value).replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function createWorkbook(worksheets: readonly WorksheetDefinition[]): Uint8Array {
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(createContentTypesXml(worksheets.length)),
    "_rels/.rels": strToU8(rootRelationshipsXml),
    "docProps/app.xml": strToU8(appXml),
    "docProps/core.xml": strToU8(coreXml),
    "xl/workbook.xml": strToU8(createWorkbookXml(worksheets)),
    "xl/_rels/workbook.xml.rels": strToU8(createWorkbookRelationshipsXml(worksheets.length)),
    "xl/styles.xml": strToU8(stylesXml),
  };

  worksheets.forEach((worksheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = strToU8(createWorksheetXml(worksheet));
  });

  return zipSync(files, { level: 6 });
}

function createWorksheetXml({
  autoFilter,
  cols,
  frozenColumns = 0,
  frozenRows = 0,
  heightForRow,
  merges = [],
  rows,
  styleForCell,
  validations = [],
}: WorksheetDefinition): string {
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnIndexToName(columnIndex)}${rowIndex + 1}`;
          const style = styleForCell?.(rowIndex, columnIndex, value, row) ?? defaultCellStyle(rowIndex, frozenRows);
          return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      const customHeight = heightForRow?.(rowIndex) ?? (rowIndex === 0 ? 28 : undefined);
      const height = customHeight ? ` ht="${customHeight}" customHeight="1"` : "";
      return `<row r="${rowIndex + 1}"${height}>${cells}</row>`;
    })
    .join("");
  const sheetViewXml = createSheetViewXml(frozenRows, frozenColumns);
  const columnXml =
    cols && cols.length > 0
      ? `<cols>${cols.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("")}</cols>`
      : "";
  const autoFilterXml = autoFilter ? `<autoFilter ref="${autoFilter}"/>` : "";
  const mergeXml = merges.length > 0 ? `<mergeCells count="${merges.length}">${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join("")}</mergeCells>` : "";
  const validationXml =
    validations.length > 0 ? `<dataValidations count="${validations.length}">${validations.join("")}</dataValidations>` : "";

  return xmlDeclaration(
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${sheetViewXml}${columnXml}<sheetData>${rowXml}</sheetData>${autoFilterXml}${mergeXml}${validationXml}</worksheet>`,
  );
}

function defaultCellStyle(rowIndex: number, frozenRows: number): number {
  return rowIndex === 0 ? 3 : rowIndex === frozenRows - 1 || rowIndex === 2 ? 2 : 0;
}

function createSheetViewXml(frozenRows: number, frozenColumns: number): string {
  if (frozenRows <= 0 && frozenColumns <= 0) {
    return `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;
  }

  const topLeftCell = `${columnIndexToName(frozenColumns)}${frozenRows + 1}`;
  const xSplit = frozenColumns > 0 ? ` xSplit="${frozenColumns}"` : "";
  const ySplit = frozenRows > 0 ? ` ySplit="${frozenRows}"` : "";
  const activePane = frozenRows > 0 && frozenColumns > 0 ? "bottomRight" : frozenRows > 0 ? "bottomLeft" : "topRight";
  return `<sheetViews><sheetView workbookViewId="0"><pane${xSplit}${ySplit} topLeftCell="${topLeftCell}" activePane="${activePane}" state="frozen"/></sheetView></sheetViews>`;
}

function createListValidation(range: string, formula: string): string {
  return `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${range}"><formula1>${escapeXml(formula)}</formula1></dataValidation>`;
}

function createWorkbookXml(worksheets: readonly WorksheetDefinition[]): string {
  const sheets = worksheets
    .map((worksheet, index) => `<sheet name="${escapeXml(worksheet.sheetName)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("");
  return xmlDeclaration(
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets}</sheets></workbook>`,
  );
}

function createWorkbookRelationshipsXml(sheetCount: number): string {
  const sheetRelationships = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join("");
  return xmlDeclaration(
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelationships}<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  );
}

function createContentTypesXml(sheetCount: number): string {
  const worksheetTypes = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join("");
  return xmlDeclaration(
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${worksheetTypes}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  );
}

function sheetNumber(path: string): number {
  return Number(path.match(/sheet(\d+)\.xml$/)?.[1] ?? 0);
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

const rootRelationshipsXml = xmlDeclaration(
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
);

const stylesXml = xmlDeclaration(
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Inter"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Inter"/></font><font><b/><sz val="11"/><color rgb="FF205F30"/><name val="Inter"/></font><font><b/><sz val="15"/><color rgb="FFFFFFFF"/><name val="Inter"/></font></fonts><fills count="8"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF090B09"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F873F"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4F5F3"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF15351D"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF4EC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF8FAF7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FFD5D9D4"/></left><right style="thin"><color rgb="FFD5D9D4"/></right><top style="thin"><color rgb="FFD5D9D4"/></top><bottom style="thin"><color rgb="FFD5D9D4"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs></styleSheet>`,
);

const appXml = xmlDeclaration(
  `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>TJ Baník Rynholec Calendar</Application></Properties>`,
);

const coreXml = xmlDeclaration(
  `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>TJ Baník Rynholec Kalendář</dc:title><dc:creator>Cingy.Tech</dc:creator><cp:lastModifiedBy>Cingy.Tech</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-23T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-23T00:00:00Z</dcterms:modified></cp:coreProperties>`,
);
