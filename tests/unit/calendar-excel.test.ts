import { describe, expect, it } from "vitest";

import { calendarSeedEvents } from "../../src/content/calendar";
import { exportCalendarEventsToXlsx, importCalendarEventsFromFile } from "../../src/components/calendar/calendar-excel";

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
      title: "A tým vs. Lorem FC",
      resourceId: "team-a",
      status: "zápas",
    });
  });

  it("imports semicolon CSV rows with Czech labels", async () => {
    const csv = [
      "ID;Název;Prostor;Skupina;Stav;Začátek;Konec;Kontakt jméno;Kontakt;Poznámka",
      "csv-1;Sauna večer;Sauna;Areál;čeká na schválení;2026-07-02T18:00;2026-07-02T20:00;Jan Novák;+420 777 000 111;Lorem ipsum",
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
});
