import { describe, expect, it } from "vitest";

import {
  normalizeCalendarEventsForStorage,
  sanitizeCalendarEventsForPublic,
} from "../../netlify/functions/_shared/calendar-data";

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

  it("keeps empty optional fields empty instead of inserting prototype data", () => {
    const [event] = normalizeCalendarEventsForStorage([
      {
        id: "empty-optional-fields",
        title: "Sauna obsazena",
        resourceId: "sauna",
        status: "obsazeno",
        start: "2026-08-10T18:00",
        end: "2026-08-10T20:00",
      },
    ]);

    expect(event).toMatchObject({ contactName: "", contactValue: "", note: "" });
  });

  it("removes private booking details from the public calendar response", () => {
    const events = normalizeCalendarEventsForStorage([
      {
        id: "private-sauna",
        title: "Sauna – Novák",
        resourceId: "sauna",
        status: "obsazeno",
        start: "2026-08-10T18:00",
        end: "2026-08-10T20:00",
        contactName: "Jan Novák",
        contactValue: "+420 777 000 000",
        note: "Soukromá poznámka",
      },
      {
        id: "public-match",
        title: "Baník – Hředle",
        resourceId: "team-a",
        status: "zápas",
        start: "2026-08-11T17:00",
        end: "2026-08-11T19:00",
        contactName: "Správce",
        contactValue: "+420 777 111 111",
        note: "Interní poznámka",
      },
    ]);

    expect(sanitizeCalendarEventsForPublic(events)).toEqual([
      expect.objectContaining({
        id: "private-sauna",
        title: "Sauna obsazena",
        contactName: "",
        contactValue: "",
        note: "",
      }),
      expect.objectContaining({
        id: "public-match",
        title: "Baník – Hředle",
        contactName: "",
        contactValue: "",
        note: "",
      }),
    ]);
  });
});
