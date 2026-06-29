export type NavigationItem = {
  label: string;
  href: string;
};

const clubShort = "Klubový web pro fotbal, areál a program TJ Baník Rynholec.";
const clubMedium = "Přehledné místo pro informace o klubu, týmech, areálu, článcích a obsazenosti hřiště.";
const clubLong =
  "Nový web má sloužit hráčům, rodičům, fanouškům i správcům areálu jako jednoduchý a rychlý přehled všeho důležitého kolem Baníku Rynholec.";

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
  category: "Klub" | "Areál" | "Týmy" | "Kalendář";
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
  status: "Informační přehled";
  requestExamples: readonly string[];
};

export const navigation = [
  { label: "Domů", href: "/" },
  { label: "Klub", href: "/klub" },
  { label: "Týmy", href: "/tymy" },
  { label: "Novinky", href: "/novinky" },
  { label: "Galerie", href: "/galerie" },
  { label: "Kalendář", href: "/kalendar" },
  { label: "Areál", href: "/areal" },
  { label: "Kontakt", href: "/kontakt" },
] as const satisfies readonly NavigationItem[];

export const club = {
  name: "TJ Baník Rynholec",
  tagline: clubShort,
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
    description: "První fotbalové kroky, pohybová průprava a radost ze hry.",
    ageGroup: "Nejmladší hráči",
    training: "Tréninky budou doplněné podle aktuální sezóny.",
    focus: "Základy pohybu, míčová technika a týmová hra",
    contactNote: "Kontakty a přesné časy budou doplněné podle podkladů klubu.",
  },
  {
    id: "zaci",
    name: "Žáci",
    description: "Mládežnická kategorie pro pravidelný trénink a zápasovou praxi.",
    ageGroup: "Žákovská kategorie",
    training: "Rozpis tréninků bude navázaný na klubový kalendář.",
    focus: "Rozvoj techniky, kondice a zápasových návyků",
    contactNote: "Kontaktní osoba bude doplněná podle aktuální domluvy.",
  },
  {
    id: "a-tym",
    name: "A tým",
    description: "Hlavní mužský tým Baníku Rynholec a program soutěžních zápasů.",
    ageGroup: "Muži",
    training: "Tréninky a zápasy budou viditelné v kalendáři.",
    focus: "Soutěžní fotbal a reprezentace klubu",
    contactNote: "Výsledky, články a tabulky půjde doplňovat v aktualitách.",
  },
  {
    id: "stara-garda",
    name: "Stará garda",
    description: "Parta bývalých hráčů a přátel klubu kolem společných akcí a zápasů.",
    ageGroup: "Veteráni a přátelé klubu",
    training: "Program bude doplněný podle domluvených akcí.",
    focus: "Klubová tradice, přátelské zápasy a komunita",
    contactNote: "Další informace se doplní podle podkladů od klubu.",
  },
] as const satisfies readonly Team[];

export const facilities = [
  {
    id: "football",
    name: "Fotbalové hřiště",
    description: "Hlavní plocha pro zápasy, tréninky a zimní rezervace hřiště.",
    capacity: "Fotbalové zápasy a tréninkové bloky",
    bookingLabel: "Hřiště",
    availability: "Obsazenost se bude zobrazovat v kalendáři jako informační přehled.",
    image: "/images/sportovni-areal-hero.jpg",
    details: ["Zápasy", "Tréninky", "Obsazenost", "Zimní bloky"],
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: "Doplňkový sportovní prostor v areálu pro další využití.",
    capacity: "Menší sportovní aktivity",
    bookingLabel: "Multifunkční hřiště",
    availability: "Dostupnost bude možné uvádět v kalendáři.",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Sport", "Volné bloky", "Areál", "Program"],
  },
  {
    id: "gym",
    name: "Posilovna",
    description: "Zázemí pro kondiční přípravu a doplňkový trénink.",
    capacity: "Dle provozních pravidel areálu",
    bookingLabel: "Posilovna",
    availability: "Informace o využití půjde doplnit podle pravidel klubu.",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Kondice", "Zázemí", "Provoz", "Správa"],
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: "Regenerační část areálu pro klubové i domluvené využití.",
    capacity: "Dle provozní kapacity",
    bookingLabel: "Sauna",
    availability: "Obsazenost lze vést v kalendáři stejně jako hřiště.",
    image: "/images/sportovni-areal-hero.jpg",
    details: ["Regenerace", "Obsazenost", "Správa", "Kontakt"],
  },
  {
    id: "clubhouse",
    name: "Klubovna a zázemí",
    description: "Klubové zázemí pro schůzky, akce a běžný provoz.",
    capacity: "Klubové akce a zázemí",
    bookingLabel: "Klubovna",
    availability: "Využití klubovny lze uvádět v kalendáři.",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Schůzky", "Akce", "Zázemí", "Klub"],
  },
] as const satisfies readonly Facility[];

export const schedulePreview = [
  {
    day: "SO",
    date: "27. 6.",
    time: "17:00",
    type: "Zápas",
    team: "A tým",
    opponent: "Ukázkový soupeř",
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
    opponent: "Tréninkový blok",
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
    opponent: "Mládežnický trénink",
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
    opponent: "Obsazenost sauny",
    venue: "Finská sauna",
    status: "Blokováno",
    preview: true,
  },
] as const satisfies readonly SchedulePreviewItem[];

export const calendarDays = [
  {
    label: "Tento týden",
    date: "27. 6. - 30. 6. 2026",
    note: clubMedium,
    events: schedulePreview.slice(0, 3),
  },
  {
    label: "Další blok",
    date: "2. 7. - 4. 7. 2026",
    note: clubMedium,
    events: [
      schedulePreview[3],
      {
        day: "SO",
        date: "4. 7.",
        time: "09:00",
        type: "Areál",
        team: "Areál",
        opponent: "Volný blok areálu",
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
    summary: clubLong,
    href: "/novinky#novy-web",
    image: "/images/sportovni-areal-hero.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Areál",
    title: "Sportovní areál na jednom místě",
    summary: clubLong,
    href: "/areal",
    image: "/images/sportovni-areal-secondary.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Kalendář",
    title: "Kalendář pro zápasy a obsazenost",
    summary: clubLong,
    href: "/kalendar",
    image: "/images/sportovni-areal-hero.jpg",
  },
] as const satisfies readonly NewsPreviewItem[];

export const reservationAreas = facilities.map((facility) => ({
  id: facility.id,
  name: facility.bookingLabel,
  description: facility.description,
  capacity: facility.capacity,
  status: "Informační přehled",
  requestExamples: [
    "zápas nebo trénink",
    "obsazený blok hřiště",
    "poznámka pro správce",
  ],
})) as readonly ReservationArea[];
