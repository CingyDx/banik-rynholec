export type NavigationItem = {
  label: string;
  href: string;
};

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
  tagline: "Fotbal, sport a areál pro celý Rynholec",
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
    description: "Radost ze hry a první fotbalové krůčky.",
    ageGroup: "nejmladší fotbalisté",
    training: "tréninky doplníme po potvrzení rozpisu",
    focus: "pohyb, míčová technika, týmové návyky",
    contactNote: "kontakt na trenéra zveřejníme po schválení klubem",
  },
  {
    id: "zaci",
    name: "Žáci",
    description: "Rozvoj talentu, pohybu a týmového ducha.",
    ageGroup: "mládežnická kategorie",
    training: "tréninkový plán bude navázaný na klubový kalendář",
    focus: "technika, herní rozhodování, zápasová praxe",
    contactNote: "kontaktní osoba bude doplněná před ostrým spuštěním",
  },
  {
    id: "a-tym",
    name: "A tým",
    description: "Srdce klubu a soutěžní fotbal za Rynholec.",
    ageGroup: "dospělí",
    training: "program bude přebíraný ze schváleného rozpisu",
    focus: "mistrovská utkání, trénink, reprezentace obce",
    contactNote: "výsledky a soupiska budou doplněné z klubových podkladů",
  },
  {
    id: "stara-garda",
    name: "Stará garda",
    description: "Zkušenost, tradice a radost ze hry.",
    ageGroup: "veteráni a přátelé klubu",
    training: "termíny budou vedené jako klubové akce",
    focus: "komunita, tradice, společná setkání",
    contactNote: "detaily zveřejníme po potvrzení správcem obsahu",
  },
] as const satisfies readonly Team[];

export const facilities = [
  {
    id: "football",
    name: "Fotbalové hřiště",
    description: "Hřiště s umělým trávníkem a osvětlením hrací plochy.",
    capacity: "tréninky, zápasy, pronájmy po domluvě",
    bookingLabel: "Hřiště",
    availability: "rezervace bude schvalovat správce areálu",
    image: "/images/sportovni-areal-hero.jpg",
    details: ["umělý trávník", "osvětlení", "zázemí šaten", "sprchy v areálu"],
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: "Pro volejbal, nohejbal, tenis, malou kopanou a další sporty.",
    capacity: "sportovní bloky pro menší skupiny",
    bookingLabel: "Multifunkční hřiště",
    availability: "v kalendáři se bude zobrazovat obsazenost",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["míčové sporty", "komunitní akce", "volnější provoz", "rezervace po blocích"],
  },
  {
    id: "gym",
    name: "Posilovna",
    description: "Vybavené zázemí pro sílu, kondici a pravidelný trénink.",
    capacity: "režim vstupu doplníme podle pravidel klubu",
    bookingLabel: "Posilovna",
    availability: "později půjde spravovat jako pravidelný provoz",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["silový trénink", "kondiční příprava", "klubové zázemí", "provozní pravidla doplníme"],
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: "Regenerace v areálu s kapacitou až 12 osob.",
    capacity: "až 12 osob",
    bookingLabel: "Sauna",
    availability: "žádost půjde poslat na konkrétní datum a čas",
    image: "/images/sportovni-areal-hero.jpg",
    details: ["regenerace", "časové bloky", "ruční potvrzení", "kapacita až 12 osob"],
  },
  {
    id: "clubhouse",
    name: "Klubovna a zázemí",
    description: "Pro setkání, organizační akce a klubový provoz.",
    capacity: "dle domluvy se správcem",
    bookingLabel: "Klubovna",
    availability: "v první ostré verzi půjde žádat ručně přes formulář",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["klubová setkání", "zázemí areálu", "akce po domluvě", "správa přes admin panel"],
  },
] as const satisfies readonly Facility[];

export const schedulePreview = [
  {
    day: "SO",
    date: "27. 6.",
    time: "17:00",
    type: "Zápas",
    team: "A tým",
    opponent: "Ukázkový soupeř doplníme z rozpisu soutěže",
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
    opponent: "Tréninkový blok podle klubového kalendáře",
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
    opponent: "Mládežnický trénink, data ověří správce",
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
    opponent: "Sauna - ukázkový rezervační blok",
    venue: "Finská sauna",
    status: "Blokováno",
    preview: true,
  },
] as const satisfies readonly SchedulePreviewItem[];

export const calendarDays = [
  {
    label: "Tento týden",
    date: "27. 6. - 30. 6. 2026",
    note: "Ukázkový read-only pohled. Ostrá data přijdou z adminu nebo Excel importu.",
    events: schedulePreview.slice(0, 3),
  },
  {
    label: "Další blok",
    date: "2. 7. - 4. 7. 2026",
    note: "Rezervační bloky ukazují budoucí princip obsazenosti areálu.",
    events: [
      schedulePreview[3],
      {
        day: "SO",
        date: "4. 7.",
        time: "09:00",
        type: "Areál",
        team: "Areál",
        opponent: "Multifunkční hřiště - ukázkový volný blok",
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
    summary: "Samostatný web spojí klub, areál, kalendář, novinky a později i správu rezervací.",
    href: "/novinky#novy-web",
    image: "/images/sportovni-areal-hero.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Areál",
    title: "Sportovní areál na jednom místě",
    summary: "Hřiště, posilovna, sauna i klubovna budou popsané přehledně pro návštěvníky i správce.",
    href: "/areal",
    image: "/images/sportovni-areal-secondary.jpg",
  },
  {
    date: "23. 6. 2026",
    category: "Rezervace",
    title: "Read-only náhled budoucích rezervací",
    summary: "První prototyp ukazuje budoucí cestu žádosti, schválení správcem a zápis do kalendáře.",
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
    "datum a časový blok",
    "jméno a kontakt žadatele",
    "poznámka pro správce areálu",
  ],
})) as readonly ReservationArea[];
