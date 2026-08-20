export type NavigationItem = {
  label: string;
  href: string;
};

export type Team = {
  id: "pripravka" | "zaci" | "a-tym" | "stara-garda";
  name: string;
  description: string;
  about?: string;
  ageGroup: string;
  training: string;
  focus: string;
  contactNote: string;
  image?: string;
  imageAlt?: string;
  coach?: string;
  phone?: string;
  instagram?: string;
};

export type Facility = {
  id: "football" | "multifunction" | "gym" | "sauna" | "clubhouse";
  name: string;
  description: string;
  capacity: string;
  bookingLabel: string;
  availability: string;
  image?: string;
  details: readonly string[];
};

export type GalleryCategory = "mladez" | "a-tym" | "areal";

export type GallerySection = {
  id: GalleryCategory;
  label: string;
  title: string;
  description: string;
  href: string;
  hrefLabel: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  category: GalleryCategory;
  note: string;
  position?: string;
};

export type NewsPreviewItem = {
  date: string;
  category: "Klub" | "Areál" | "Týmy" | "Kalendář";
  title: string;
  summary: string;
  href: string;
  image: string;
  external?: boolean;
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
  { label: "Areál", href: "/areal" },
  { label: "Kontakt", href: "/kontakt" },
] as const satisfies readonly NavigationItem[];

export const club = {
  name: "TJ Baník Rynholec",
  tagline: "Fotbal, sport a areál pro celý Rynholec.",
  address: "U hřiště, Rynholec",
  coordinates: {
    latitude: 50.1349364,
    longitude: 13.92615,
  },
} as const;

export const teams: readonly Team[] = [
  {
    id: "pripravka",
    name: "Přípravka",
    description: "První fotbalové kroky, pohybová průprava a radost ze hry.",
    ageGroup: "Nejmladší hráči",
    training: "Aktuální program najdete v klubovém kalendáři.",
    focus: "Základy pohybu, míčová technika a týmová hra",
    contactNote: "Informace o náboru poskytne vedení klubu.",
  },
  {
    id: "zaci",
    name: "Starší žáci",
    description: "Skvělá parta kluků, která chce makat a zlepšovat se zápas od zápasu.",
    about:
      "Starší žáci TJ Baník Rynholec jsou skvělá parta kluků, kteří chtějí makat a zlepšovat se zápas od zápasu. Zaměřujeme se na rozvoj fotbalových dovedností, fyzické kondice a především na týmového ducha. Naším cílem je, aby kluky fotbal bavil, naučili se zdravé soutěživosti a postupně se připravovali na přechod do dorostenecké kategorie. Rádi mezi námi přivítáme nové tváře.",
    ageGroup: "Mládež",
    training: "Úterý a čtvrtek od 17:00 do 18:30.",
    focus: "Fotbalové dovednosti, kondice a týmový duch",
    contactNote: "Trenér Miroslav Chvaščák, tel. +420 739 572 608.",
    coach: "Miroslav Chvaščák",
    phone: "+420 739 572 608",
    instagram: "https://www.instagram.com/banikrynholeczaci/",
  },
  {
    id: "a-tym",
    name: "A tým",
    description: "Hlavní mužský tým Baníku Rynholec a jeho soutěžní program.",
    ageGroup: "Muži",
    training: "Aktuální časy tréninků a zápasů najdete v klubovém kalendáři.",
    focus: "Soutěžní fotbal a reprezentace klubu",
    contactNote: "Program mužstva najdete v klubovém kalendáři.",
    image: "/images/teams/a-tym/a-tym-sezona-2025-2026.webp",
    imageAlt: "A tým TJ Baník Rynholec v sezoně 2025/2026",
  },
  {
    id: "stara-garda",
    name: "Stará garda",
    description: "Bývalí hráči a přátelé klubu kolem společných akcí a zápasů.",
    ageGroup: "Veteráni a přátelé klubu",
    training: "Program podle domluvených akcí a přátelských zápasů.",
    focus: "Klubová tradice, přátelské zápasy a komunita",
    contactNote: "Program kategorie najdete v klubovém kalendáři.",
  },
];

export const facilities: readonly Facility[] = [
  {
    id: "football",
    name: "Fotbalové hřiště",
    description: "Hlavní plocha pro zápasy, tréninky a rezervované bloky hřiště.",
    capacity: "Fotbalové zápasy a tréninkové bloky",
    bookingLabel: "Hřiště",
    availability: "Program a obsazenost hřiště se zobrazují v klubovém kalendáři.",
    image: "/images/sportovni-areal-hero.jpg",
    details: ["Zápasy", "Tréninky", "Obsazenost", "Klubový program"],
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: "Doplňkový sportovní prostor v areálu pro další pohybové aktivity.",
    capacity: "Menší sportovní aktivity",
    bookingLabel: "Multifunkční hřiště",
    availability: "Aktuální využití lze vést společně s ostatním programem areálu.",
    image: "/images/sportovni-areal-secondary.jpg",
    details: ["Sport", "Volné bloky", "Areál", "Program"],
  },
  {
    id: "gym",
    name: "Posilovna",
    description: "Zázemí pro kondiční přípravu a doplňkový trénink.",
    capacity: "Dle provozních pravidel areálu",
    bookingLabel: "Posilovna",
    availability: "Využití se řídí provozními pravidly klubu a rozpisem v kalendáři.",
    details: ["Kondice", "Zázemí", "Provoz", "Správa"],
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: "Regenerační část areálu pro klubové i předem domluvené využití.",
    capacity: "Dle provozní kapacity",
    bookingLabel: "Sauna",
    availability: "Obsazenost lze sledovat ve společném kalendáři areálu.",
    details: ["Regenerace", "Obsazenost", "Správa", "Kontakt"],
  },
  {
    id: "clubhouse",
    name: "Klubovna a zázemí",
    description: "Klubové zázemí pro schůzky, akce a běžný provoz.",
    capacity: "Klubové akce a zázemí",
    bookingLabel: "Klubovna",
    availability: "Plánované využití klubovny lze uvádět v kalendáři.",
    details: ["Schůzky", "Akce", "Zázemí", "Klub"],
  },
];

export const gallerySections: readonly GallerySection[] = [
  {
    id: "mladez",
    label: "Mládež",
    title: "Mládež",
    description: "Týmové fotografie, tréninky a zápasové momenty mládeže Baníku Rynholec.",
    href: "/tymy#zaci",
    hrefLabel: "Informace o mládeži",
  },
  {
    id: "a-tym",
    label: "Muži",
    title: "A tým",
    description: "Společná fotografie mužstva dospělých v sezoně 2025/2026.",
    href: "/tymy#a-tym",
    hrefLabel: "Detail týmu",
  },
  {
    id: "areal",
    label: "Zázemí",
    title: "Sportovní areál",
    description: "Fotbalové a multifunkční hřiště TJ Baník Rynholec.",
    href: "/areal",
    hrefLabel: "Detail areálu",
  },
];

export const galleryItems: readonly GalleryItem[] = [
  {
    src: "/images/teams/mladez/mladez-tym.webp",
    alt: "Mládež TJ Baník Rynholec se svými trenéry",
    title: "Mládež Baníku",
    category: "mladez",
    note: "Společná týmová fotografie.",
  },
  {
    src: "/images/teams/mladez/mladez-soustredeni.webp",
    alt: "Mládež TJ Baník Rynholec na společném soustředění",
    title: "Společný týmový den",
    category: "mladez",
    note: "Mládež Baníku Rynholec pohromadě.",
  },
  {
    src: "/images/teams/mladez/mladez-pokyny.webp",
    alt: "Trenér předává pokyny mládeži TJ Baník Rynholec",
    title: "Pokyny před hrou",
    category: "mladez",
    note: "Týmová příprava přímo na hřišti.",
  },
  {
    src: "/images/teams/mladez/mladez-zapas-01.webp",
    alt: "Mládež TJ Baník Rynholec během utkání",
    title: "V zápasovém tempu",
    category: "mladez",
    note: "Moment z mládežnického utkání.",
  },
  {
    src: "/images/teams/mladez/mladez-zapas-02.webp",
    alt: "Zápas mládeže TJ Baník Rynholec u branky",
    title: "Souboj u branky",
    category: "mladez",
    note: "Zápasový moment mládeže.",
  },
  {
    src: "/images/teams/mladez/mladez-zapas-03.webp",
    alt: "Mládežnické mužstvo TJ Baník Rynholec na hřišti",
    title: "Mládež na hřišti",
    category: "mladez",
    note: "Fotbalové odpoledne s Baníkem.",
  },
  {
    src: "/images/teams/mladez/mladez-zapas-04.webp",
    alt: "Mládež TJ Baník Rynholec při týmové poradě",
    title: "Týmová porada",
    category: "mladez",
    note: "Společná příprava během zápasu.",
  },
  {
    src: "/images/teams/mladez/mladez-zapas-05.webp",
    alt: "Mládež TJ Baník Rynholec při utkání",
    title: "Zápasový den",
    category: "mladez",
    note: "Další moment z programu mládeže.",
  },
  {
    src: "/images/teams/mladez/mladez-trenink.webp",
    alt: "Fotbalové míče a trénink mládeže TJ Baník Rynholec",
    title: "Tréninková příprava",
    category: "mladez",
    note: "Pravidelná práce s míčem a kondicí.",
  },
  {
    src: "/images/teams/a-tym/a-tym-sezona-2025-2026.webp",
    alt: "A tým TJ Baník Rynholec v sezoně 2025/2026",
    title: "A tým 2025/2026",
    category: "a-tym",
    note: "Mužstvo dospělých TJ Baník Rynholec.",
  },
  {
    src: "/images/sportovni-areal-hero.jpg",
    alt: "Fotbalové hřiště TJ Baník Rynholec",
    title: "Fotbalové hřiště",
    category: "areal",
    note: "Hlavní plocha pro zápasy a tréninky.",
  },
  {
    src: "/images/sportovni-areal-secondary.jpg",
    alt: "Multifunkční hřiště sportovního areálu v Rynholci",
    title: "Multifunkční hřiště",
    category: "areal",
    note: "Doplňková sportovní plocha v areálu.",
  },
];

export const newsPreview: readonly NewsPreviewItem[] = [
  {
    date: "20. 8. 2026",
    category: "Týmy",
    title: "Starší žáci: tréninky a kontakt na jednom místě",
    summary:
      "Starší žáci trénují každé úterý a čtvrtek od 17:00 do 18:30. Tým vede Miroslav Chvaščák a rád mezi hráči přivítá nové tváře.",
    href: "/tymy#zaci",
    image: "/images/teams/mladez/mladez-trenink.webp",
  },
  {
    date: "19. 8. 2026",
    category: "Týmy",
    title: "Mládež Baníku najdete také na Instagramu",
    summary: "Fotky, zápasové momenty a další dění kolem žákovského týmu najdete na klubovém profilu mládeže.",
    href: "https://www.instagram.com/banikrynholeczaci/",
    image: "/images/teams/mladez/mladez-pokyny.webp",
    external: true,
  },
  {
    date: "10. 8. 2026",
    category: "Týmy",
    title: "A tým Baníku v sezoně 2025/2026",
    summary: "Představujeme společnou fotografii mužstva dospělých TJ Baník Rynholec ze sezony 2025/2026.",
    href: "/tymy#a-tym",
    image: "/images/teams/a-tym/a-tym-sezona-2025-2026.webp",
  },
  {
    date: "8. 8. 2026",
    category: "Kalendář",
    title: "Program klubu najdete v online kalendáři",
    summary: "Kalendář přehledně ukazuje zápasy, tréninky a obsazenost areálu. Program lze zobrazit po měsících, týdnech i jako seznam.",
    href: "/kalendar",
    image: "/images/sportovni-areal-hero.jpg",
  },
];

export const reservationAreas = facilities.map((facility) => ({
  id: facility.id,
  name: facility.bookingLabel,
  description: facility.description,
  capacity: facility.capacity,
  status: "Informační přehled",
  requestExamples: ["zápas nebo trénink", "obsazený blok hřiště", "provozní informace"],
})) as readonly ReservationArea[];
