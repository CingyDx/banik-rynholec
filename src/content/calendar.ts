export type CalendarResourceId = "football" | "sauna" | "gym" | "clubhouse" | "team-a" | "team-youth";
export type CalendarResourceGroup = "Areál" | "Týmy";
export type CalendarStatus = "volno" | "obsazeno" | "trénink" | "zápas" | "čeká na schválení";

export type CalendarResource = {
  id: CalendarResourceId;
  label: string;
  group: CalendarResourceGroup;
};

export type CalendarEvent = {
  id: string;
  title: string;
  resourceId: CalendarResourceId;
  resourceLabel: string;
  resourceGroup: CalendarResourceGroup;
  status: CalendarStatus;
  start: string;
  end: string;
  contactName: string;
  contactValue: string;
  note: string;
};

export const calendarResources = [
  { id: "football", label: "Hřiště", group: "Areál" },
  { id: "sauna", label: "Sauna", group: "Areál" },
  { id: "gym", label: "Posilovna", group: "Areál" },
  { id: "clubhouse", label: "Klubovna", group: "Areál" },
  { id: "team-a", label: "A tým", group: "Týmy" },
  { id: "team-youth", label: "Mládež", group: "Týmy" },
] as const satisfies readonly CalendarResource[];

export const calendarStatuses = [
  "volno",
  "obsazeno",
  "trénink",
  "zápas",
  "čeká na schválení",
] as const satisfies readonly CalendarStatus[];

export const calendarSeedEvents = [
  {
    id: "evt-001",
    title: "A tým vs. Lorem FC",
    resourceId: "team-a",
    resourceLabel: "A tým",
    resourceGroup: "Týmy",
    status: "zápas",
    start: "2026-06-24T17:00",
    end: "2026-06-24T19:00",
    contactName: "Jan Novák",
    contactValue: "+420 777 123 456",
    note: "Ukázkový zápas v kalendáři.",
  },
  {
    id: "evt-002",
    title: "Trénink mládeže",
    resourceId: "team-youth",
    resourceLabel: "Mládež",
    resourceGroup: "Týmy",
    status: "trénink",
    start: "2026-06-25T16:30",
    end: "2026-06-25T18:00",
    contactName: "Petr Svoboda",
    contactValue: "mladez@banikrynholec.cz",
    note: "Integer posuere erat a ante.",
  },
  {
    id: "evt-003",
    title: "Obsazenost sauny",
    resourceId: "sauna",
    resourceLabel: "Sauna",
    resourceGroup: "Areál",
    status: "obsazeno",
    start: "2026-06-26T18:00",
    end: "2026-06-26T20:00",
    contactName: "Klára Veselá",
    contactValue: "+420 777 654 321",
    note: "Consectetur adipiscing elit.",
  },
  {
    id: "evt-004",
    title: "Volný blok hřiště",
    resourceId: "football",
    resourceLabel: "Hřiště",
    resourceGroup: "Areál",
    status: "volno",
    start: "2026-06-27T09:00",
    end: "2026-06-27T12:00",
    contactName: "TJ Baník Rynholec",
    contactValue: "info@banikrynholec.cz",
    note: "Praesent commodo cursus magna.",
  },
  {
    id: "evt-005",
    title: "Klubovna blok",
    resourceId: "clubhouse",
    resourceLabel: "Klubovna",
    resourceGroup: "Areál",
    status: "čeká na schválení",
    start: "2026-06-28T15:00",
    end: "2026-06-28T18:00",
    contactName: "Martin Dvořák",
    contactValue: "martin@example.com",
    note: "Aenean lacinia bibendum nulla sed consectetur.",
  },
  {
    id: "evt-006",
    title: "Posilovna blok",
    resourceId: "gym",
    resourceLabel: "Posilovna",
    resourceGroup: "Areál",
    status: "obsazeno",
    start: "2026-06-30T17:00",
    end: "2026-06-30T19:00",
    contactName: "Lucie Horáková",
    contactValue: "+420 777 987 654",
    note: "Donec ullamcorper nulla non metus auctor.",
  },
  {
    id: "evt-007",
    title: "Přátelské utkání",
    resourceId: "team-a",
    resourceLabel: "A tým",
    resourceGroup: "Týmy",
    status: "zápas",
    start: "2026-07-04T10:00",
    end: "2026-07-04T12:00",
    contactName: "TJ Baník Rynholec",
    contactValue: "info@banikrynholec.cz",
    note: "Cras mattis consectetur purus sit amet.",
  },
] as const satisfies readonly CalendarEvent[];
