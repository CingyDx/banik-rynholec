export type NavigationItem = {
  label: string;
  href: string;
};

const loremShort = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const loremMedium = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus.";
const loremLong =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.";

export type Team = {
  id: "pripravka" | "zaci" | "a-tym" | "stara-garda";
  name: string;
  description: string;
  ageGroup: string;
  training: string;
  focus: string;
  contactNote: string;
};

export type Facility = {
  id: "football" | "multifunction" | "gym" | "sauna" | "clubhouse";
  name: string;
  description: string;
  capacity: string;
  bookingLabel: string;
  availability: string;
  image: string;
  details: readonly string[];
};

export type SchedulePreviewItem = {
  day: string;
  date: string;
  time: string;
  type: "Zápas" | "Trénink" | "Areál" | "Regenerace";
  team: Team["name"] | "Areál";
  opponent: string;
  venue: string;
  status: "Ukázka" | "Volno" | "Blokováno";
  preview: true;
};

export type CalendarDay = {
  label: string;
  date: string;
  note: string;
  events: readonly SchedulePreviewItem[];
};

export type NewsPreviewItem = {
  date: string;
  category: "Klub" | "Areál" | "Týmy" | "Rezervace";
  title: string;
  summary: string;
  href: string;
  image: string;
};

export type ReservationArea = {
  id: Facility["id"];
  name: string;
  description: string;
  capacity: string;
  status: "Read-only náhled";
  requestExamples: readonly string[];
};

export const navigation = [
  { label: "Domů", href: "/" },
  { label: "Klub", href: "/klub" },
  { label: "Týmy", href: "/tymy" },
  { label: "Novinky", href: "/novinky" },
  { label: "Kalendář", href: "/kalendar" },
  { label: "Areál", href: "/areal" },
  { label: "Kontakt", href: "/kontakt" },
] as const satisfies readonly NavigationItem[];

export const club = {
  name: "TJ Baník Rynholec",
  tagline: loremShort,
  address: "U hřiště, Rynholec",
  coordinates: {
    latitude: 50.1349364,
    longitude: 13.92615,
  },
} as const;

export const teams = [
  {
    id: "pripravka",
    name: "Přípravka",
    description: loremShort,
    ageGroup: "Lorem ipsum",
    training: loremShort,
    focus: "Lorem ipsum dolor sit amet",
    contactNote: loremMedium,
  },
  {
    id: "zaci",
    name: "Žáci",
    description: loremShort,
    ageGroup: "Dolor sit amet",
    training: loremShort,
    focus: "Consectetur adipiscing elit",
    contactNote: loremMedium,
  },
  {
    id: "a-tym",
    name: "A tým",
    description: loremShort,
    ageGroup: "Integer posuere",
    training: loremShort,
    focus: "Aenean lacinia bibendum nulla",
    contactNote: loremMedium,
  },
  {
    id: "stara-garda",
    name: "Stará garda",
    description: loremShort,
    ageGroup: "Praesent commodo",
    training: loremShort,
    focus: "Cras mattis consectetur purus",
    contactNote: loremMedium,
  },
] as const satisfies readonly Team[];

export const facilities = [
  {
    id: "football",
    name: "Fotbalové hřiště",
    description: loremShort,
    capacity: "Lorem ipsum dolor sit amet",
    bookingLabel: "Hřiště",
    availability: loremMedium,
    image: "/images/sportovni-areal-hero.jpg",
    details: ["Lorem ipsum", "Dolor sit", "Amet elit", "Sed tempor"],
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: loremShort,
    capacity: "Consectetur adipiscing elit",
    bookingLabel: "Multifunkční hřiště",
    availability: loremMedium,
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Lorem ipsum", "Dolor sit", "Amet elit", "Sed tempor"],
  },
  {
    id: "gym",
    name: "Posilovna",
    description: loremShort,
    capacity: "Integer posuere erat",
    bookingLabel: "Posilovna",
    availability: loremMedium,
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Lorem ipsum", "Dolor sit", "Amet elit", "Sed tempor"],
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: loremShort,
    capacity: "Aenean lacinia bibendum",
    bookingLabel: "Sauna",
    availability: loremMedium,
    image: "/images/sportovni-areal-hero.jpg",
    details: ["Lorem ipsum", "Dolor sit", "Amet elit", "Sed tempor"],
  },
  {
    id: "clubhouse",
    name: "Klubovna a zázemí",
    description: loremShort,
    capacity: "Praesent commodo cursus",
    bookingLabel: "Klubovna",
    availability: loremMedium,
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Lorem ipsum", "Dolor sit", "Amet elit", "Sed tempor"],
  },
] as const satisfies readonly Facility[];

export const schedulePreview = [
  {
    day: "SO",
    date: "27. 6.",
    time: "17:00",
    type: "Zápas",
    team: "A tým",
    opponent: "Lorem ipsum dolor sit amet",
    venue: "Fotbalové hřiště",
    status: "Ukázka",
    preview: true,
  },
  {
    day: "NE",
    date: "28. 6.",
    time: "10:00",
    type: "Trénink",
    team: "Žáci",
    opponent: "Consectetur adipiscing elit",
    venue: "Areál Rynholec",
    status: "Ukázka",
    preview: true,
  },
  {
    day: "ÚT",
    date: "30. 6.",
    time: "16:30",
    type: "Trénink",
    team: "Přípravka",
    opponent: "Integer posuere erat a ante",
    venue: "Fotbalové hřiště",
    status: "Ukázka",
    preview: true,
  },
  {
    day: "ČT",
    date: "2. 7.",
    time: "18:00",
    type: "Regenerace",
    team: "Areál",
    opponent: "Aenean lacinia bibendum nulla",
    venue: "Finská sauna",
    status: "Blokováno",
    preview: true,
  },
] as const satisfies readonly SchedulePreviewItem[];

export const calendarDays = [
  {
    label: "Tento týden",
    date: "27. 6. - 30. 6. 2026",
    note: loremMedium,
    events: schedulePreview.slice(0, 3),
  },
  {
    label: "Další blok",
    date: "2. 7. - 4. 7. 2026",
    note: loremMedium,
    events: [
      schedulePreview[3],
      {
        day: "SO",
        date: "4. 7.",
        time: "09:00",
        type: "Areál",
        team: "Areál",
        opponent: "Cras mattis consectetur purus",
        venue: "Multifunkční hřiště",
        status: "Volno",
        preview: true,
      },
    ],
  },
] as const satisfies readonly CalendarDay[];

export const newsPreview = [
  {
    date: "23. 6. 2026",
    category: "Klub",
    title: "Nové místo pro Baník Rynholec vzniká",
    summary: loremLong,
    href: "/novinky#novy-web",
    image: "/images/sportovni-areal-hero.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Areál",
    title: "Sportovní areál na jednom místě",
    summary: loremLong,
    href: "/areal",
    image: "/images/sportovni-areal-secondary.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Rezervace",
    title: "Read-only náhled budoucích rezervací",
    summary: loremLong,
    href: "/rezervace",
    image: "/images/sportovni-areal-hero.jpg",
  },
] as const satisfies readonly NewsPreviewItem[];

export const reservationAreas = facilities.map((facility) => ({
  id: facility.id,
  name: facility.bookingLabel,
  description: facility.description,
  capacity: facility.capacity,
  status: "Read-only náhled",
  requestExamples: [
    "lorem ipsum dolor",
    "consectetur adipiscing",
    "integer posuere erat",
  ],
})) as readonly ReservationArea[];
