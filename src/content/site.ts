export type NavigationItem = {
  label: string;
  href: string;
};

export type Team = {
  id: "pripravka" | "zaci" | "a-tym" | "stara-garda";
  name: string;
  description: string;
};

export type Facility = {
  id: "football" | "multifunction" | "gym" | "sauna";
  name: string;
  description: string;
};

export type SchedulePreviewItem = {
  day: string;
  date: string;
  time: string;
  team: Team["name"];
  opponent: string;
  venue: string;
  preview: true;
};

export type NewsPreviewItem = {
  date: string;
  category: "Klub" | "Areál" | "Týmy";
  title: string;
  href: string;
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
  },
  {
    id: "zaci",
    name: "Žáci",
    description: "Rozvoj talentu, pohybu a týmového ducha.",
  },
  {
    id: "a-tym",
    name: "A tým",
    description: "Srdce klubu a soutěžní fotbal za Rynholec.",
  },
  {
    id: "stara-garda",
    name: "Stará garda",
    description: "Zkušenost, tradice a radost ze hry.",
  },
] as const satisfies readonly Team[];

export const facilities = [
  {
    id: "football",
    name: "Fotbalové hřiště",
    description: "Hřiště s umělým trávníkem a osvětlením hrací plochy.",
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: "Pro volejbal, nohejbal, tenis, malou kopanou a další sporty.",
  },
  {
    id: "gym",
    name: "Posilovna",
    description: "Vybavené zázemí pro sílu, kondici a pravidelný trénink.",
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: "Regenerace v areálu s kapacitou až 12 osob.",
  },
] as const satisfies readonly Facility[];

export const schedulePreview = [
  {
    day: "SO",
    date: "27. 6.",
    time: "17:00",
    team: "A tým",
    opponent: "Program doplníme z klubového kalendáře",
    venue: "Areál Rynholec",
    preview: true,
  },
  {
    day: "NE",
    date: "28. 6.",
    time: "10:00",
    team: "Žáci",
    opponent: "Program doplníme z klubového kalendáře",
    venue: "Areál Rynholec",
    preview: true,
  },
  {
    day: "ÚT",
    date: "30. 6.",
    time: "16:30",
    team: "Přípravka",
    opponent: "Program doplníme z klubového kalendáře",
    venue: "Areál Rynholec",
    preview: true,
  },
] as const satisfies readonly SchedulePreviewItem[];

export const newsPreview = [
  {
    date: "23. 6. 2026",
    category: "Klub",
    title: "Nové místo pro Baník Rynholec vzniká",
    href: "/novinky#novy-web",
  },
  {
    date: "23. 6. 2026",
    category: "Areál",
    title: "Sportovní areál na jednom místě",
    href: "/areal",
  },
  {
    date: "23. 6. 2026",
    category: "Týmy",
    title: "Od přípravky po starou gardu",
    href: "/tymy",
  },
] as const satisfies readonly NewsPreviewItem[];
