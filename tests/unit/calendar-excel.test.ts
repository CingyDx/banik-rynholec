import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { calendarSeedEvents } from "../../src/content/calendar";
import {
  calendarTemplateMonthSheets,
  calendarTemplateYear,
  exportCalendarEventsToXlsx,
  exportCalendarTemplateToXlsx,
  importCalendarEventsFromFile,
} from "../../src/components/calendar/calendar-excel";

function bytesToBlobPart(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe("calendar Excel import/export", () => {
  it("exports mock events into an importable xlsx workbook", async () => {
    const bytes = exportCalendarEventsToXlsx(calendarSeedEvents);
    const file = new File([bytesToBlobPart(bytes)], "banik-rynholec-kalendar.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const imported = await importCalendarEventsFromFile(file);

    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(imported).toHaveLength(calendarSeedEvents.length);
    expect(imported[0]).toMatchObject({
      id: "evt-001",
      title: "A tým vs. SK Lány",
      resourceId: "team-a",
      status: "zápas",
    });
  });

  it("imports semicolon CSV rows with Czech labels", async () => {
    const csv = [
      "ID;Název;Prostor;Skupina;Stav;Začátek;Konec;Kontakt jméno;Kontakt;Poznámka",
      "csv-1;Sauna večer;Sauna;Areál;čeká na schválení;2026-07-02T18:00;2026-07-02T20:00;Jan Novák;+420 777 000 111;Bez poznámky",
    ].join("\n");
    const file = new File([csv], "kalendar.csv", { type: "text/csv" });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toEqual([
      expect.objectContaining({
        id: "csv-1",
        title: "Sauna večer",
        resourceId: "sauna",
        status: "čeká na schválení",
        start: "2026-07-02T18:00",
        end: "2026-07-02T20:00",
      }),
    ]);
  });

  it("exports a prepared full-year offline Excel template", () => {
    const bytes = exportCalendarTemplateToXlsx();
    const workbook = unzipSync(bytes);
    const workbookXml = strFromU8(workbook["xl/workbook.xml"]);
    const firstMonthXml = strFromU8(workbook["xl/worksheets/sheet3.xml"]);
    const julyXml = strFromU8(workbook["xl/worksheets/sheet9.xml"]);

    expect(calendarTemplateYear).toBe(2026);
    expect(calendarTemplateMonthSheets).toHaveLength(12);
    expect(workbookXml).toContain('name="Návod"');
    expect(workbookXml).toContain('name="Číselníky"');
    expect(workbookXml).toContain('name="01 Leden"');
    expect(workbookXml).toContain('name="12 Prosinec"');
    expect(firstMonthXml).toContain("Akce 1");
    expect(firstMonthXml).toContain("Akce 4");
    expect(firstMonthXml).toContain('xSplit="2"');
    expect(firstMonthXml).toContain('ySplit="4"');
    expect(firstMonthXml).toContain("Datum");
    expect(firstMonthXml).toContain("Název");
    expect(firstMonthXml).toContain("Prostor");
    expect(firstMonthXml).toContain("Stav");
    expect(firstMonthXml).toContain("Poznámka");
    expect(julyXml).toContain("01.07.2026");
    expect(julyXml).toContain("31.07.2026");
  });

  it("keeps the blank full-year template import-safe until real rows are filled", async () => {
    const bytes = exportCalendarTemplateToXlsx();
    const file = new File([bytesToBlobPart(bytes)], "banik-rynholec-kalendar-sablona.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toEqual([]);
  });

  it("imports rows written into the day-per-row monthly template shape", async () => {
    const csv = [
      [
        "Datum",
        "Den",
        "1 ⏱ Od",
        "1 ⏱ Do",
        "1 📝 Název",
        "1 📍 Prostor",
        "1 ✅ Stav",
        "1 👤 Jméno",
        "1 ☎ Kontakt",
        "1 💬 Poznámka",
        "1 ID",
        "2 ⏱ Od",
        "2 ⏱ Do",
        "2 📝 Název",
        "2 📍 Prostor",
        "2 ✅ Stav",
        "2 👤 Jméno",
        "2 ☎ Kontakt",
        "2 💬 Poznámka",
        "2 ID",
      ].join(";"),
      [
        "01.07.2026",
        "st",
        "",
        "",
        "Trénink A tým",
        "A tým",
        "trénink",
        "TJ Baník Rynholec",
        "info@banikrynholec.cz",
        "Vyplněno offline",
        "offline-1",
        "17:00",
        "18:30",
        "A tým vs Slaný",
        "Hřiště",
        "zápas",
        "",
        "",
        "Druhý slot ve stejném dni",
        "offline-2",
      ].join(";"),
    ].join("\n");
    const file = new File([csv], "kalendar-rocni-sablona.csv", { type: "text/csv" });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toHaveLength(2);
    expect(imported[0]).toEqual(
      expect.objectContaining({
        id: "offline-1",
        title: "Trénink A tým",
        resourceId: "team-a",
        status: "trénink",
        start: "2026-07-01T08:00",
        end: "2026-07-01T10:00",
        note: "Vyplněno offline",
      }),
    );
    expect(imported[1]).toEqual(
      expect.objectContaining({
        id: "offline-2",
        title: "A tým vs Slaný",
        resourceId: "football",
        status: "zápas",
        start: "2026-07-01T17:00",
        end: "2026-07-01T18:30",
        note: "Druhý slot ve stejném dni",
      }),
    );
  });

  it("imports readable day-per-row CSV values even without Czech diacritics", async () => {
    const csv = [
      "Datum;Den;1 Od;1 Do;1 Nazev;1 Prostor;1 Stav;1 Jmeno;1 Kontakt;1 Poznamka;1 ID",
      "2026-07-03;pa;08:00;10:00;Rudla zapis;Hriste;zapas;Rudla;+420 777 123 456;Bez diakritiky;ascii-1",
    ].join("\n");
    const file = new File([csv], "kalendar-rudla.csv", { type: "text/csv" });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toEqual([
      expect.objectContaining({
        id: "ascii-1",
        title: "Rudla zapis",
        resourceId: "football",
        status: "zápas",
        start: "2026-07-03T08:00",
        end: "2026-07-03T10:00",
      }),
    ]);
  });

  it("imports Czech date values from flat table exports", async () => {
    const csv = [
      "ID;Název;Prostor;Skupina;Stav;Začátek;Konec;Kontakt jméno;Kontakt;Poznámka",
      "cz-1;Sauna večer;Sauna;Areál;obsazeno;07.08.2026 18:00;07.08.2026 20:00;Rudla;+420 777 123 456;Český zápis data",
    ].join("\n");
    const file = new File([csv], "kalendar-cesky-datum.csv", { type: "text/csv" });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toEqual([
      expect.objectContaining({
        id: "cz-1",
        title: "Sauna večer",
        resourceId: "sauna",
        status: "obsazeno",
        start: "2026-08-07T18:00",
        end: "2026-08-07T20:00",
      }),
    ]);
  });

  it("keeps the older narrow full-year template shape importable", async () => {
    const csv = [
      "Datum;Den;Od;Do;Název;Prostor;Stav;Kontakt jméno;Kontakt;Poznámka;ID",
      "2026-07-01;st;17:00;18:30;Trénink A tým;A tým;trénink;TJ Baník Rynholec;info@banikrynholec.cz;Vyplněno offline;offline-legacy",
    ].join("\n");
    const file = new File([csv], "kalendar-stara-sablona.csv", { type: "text/csv" });

    const imported = await importCalendarEventsFromFile(file);

    expect(imported).toEqual([
      expect.objectContaining({
        id: "offline-legacy",
        title: "Trénink A tým",
        resourceId: "team-a",
        status: "trénink",
        start: "2026-07-01T17:00",
        end: "2026-07-01T18:30",
      }),
    ]);
  });
});
