import { describe, expect, it } from "vitest";

import { normalizeCalendarEventsForStorage } from "../../netlify/functions/_shared/calendar-data";

describe("calendar data normalization", () => {
  it("keeps valid imported events and derives trusted resource labels", () => {
    const events = normalizeCalendarEventsForStorage([
      {
        id: "excel-1",
        title: "Trénink žáci",
        resourceId: "team-youth",
        resourceLabel: "Nesprávný label",
        resourceGroup: "Nesprávná skupina",
        status: "trénink",
        start: "2026-07-09T17:00",
        end: "2026-07-09T18:30",
        contactName: "Rudla",
        contactValue: "xls",
        note: "Zapsáno offline.",
      },
    ]);

    expect(events).toEqual([
      expect.objectContaining({
        id: "excel-1",
        title: "Trénink žáci",
        resourceId: "team-youth",
        resourceLabel: "Mládež",
        resourceGroup: "Týmy",
        status: "trénink",
      }),
    ]);
  });

  it("drops malformed rows so a broken spreadsheet cannot wipe the calendar", () => {
    const events = normalizeCalendarEventsForStorage([
      {
        id: "broken",
        title: "Rozbitý řádek",
        resourceId: "football",
        status: "zápas",
        start: "",
        end: "2026-07-09T18:30",
      },
      {
        id: "valid",
        title: "Zápas A tým",
        resourceId: "team-a",
        status: "zápas",
        start: "2026-07-10T17:00",
        end: "2026-07-10T19:00",
      },
    ]);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ id: "valid", resourceLabel: "A tým" });
  });
});
