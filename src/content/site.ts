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
  status: "Potvrzeno" | "Volno" | "Blokováno";
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

export type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  category: Facility["name"];
  note: string;
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
    training: "Tréninky podle aktuálního rozpisu v klubovém kalendáři.",
    focus: "Základy pohybu, míčová technika a týmová hra",
    contactNote: "Aktuální informace poskytne hlavní kontakt klubu.",
  },
  {
    id: "zaci",
    name: "Žáci",
    description: "Mládežnická kategorie pro pravidelný trénink a zápasovou praxi.",
    ageGroup: "Žákovská kategorie",
    training: "Rozpis tréninků bude navázaný na klubový kalendář.",
    focus: "Rozvoj techniky, kondice a zápasových návyků",
    contactNote: "Kontakt na trenéra a správce kategorie: tymy@banikrynholec.cz.",
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
    training: "Program podle domluvených akcí a přátelských zápasů.",
    focus: "Klubová tradice, přátelské zápasy a komunita",
    contactNote: "Program kategorie najdete v klubovém kalendáři.",
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
    image: "/images/placeholders/football-1.svg?v=2",
    details: ["Zápasy", "Tréninky", "Obsazenost", "Zimní bloky"],
  },
  {
    id: "multifunction",
    name: "Multifunkční hřiště",
    description: "Doplňkový sportovní prostor v areálu pro další využití.",
    capacity: "Menší sportovní aktivity",
    bookingLabel: "Multifunkční hřiště",
    availability: "Dostupnost bude možné uvádět v kalendáři.",
    image: "/images/placeholders/multifunction-1.svg?v=2",
    details: ["Sport", "Volné bloky", "Areál", "Program"],
  },
  {
    id: "gym",
    name: "Posilovna",
    description: "Zázemí pro kondiční přípravu a doplňkový trénink.",
    capacity: "Dle provozních pravidel areálu",
    bookingLabel: "Posilovna",
    availability: "Využití se zobrazuje podle provozních pravidel klubu.",
    image: "/images/placeholders/gym-1.svg?v=2",
    details: ["Kondice", "Zázemí", "Provoz", "Správa"],
  },
  {
    id: "sauna",
    name: "Finská sauna",
    description: "Regenerační část areálu pro klubové i domluvené využití.",
    capacity: "Dle provozní kapacity",
    bookingLabel: "Sauna",
    availability: "Obsazenost lze vést v kalendáři stejně jako hřiště.",
    image: "/images/placeholders/sauna-1.svg?v=2",
    details: ["Regenerace", "Obsazenost", "Správa", "Kontakt"],
  },
  {
    id: "clubhouse",
    name: "Klubovna a zázemí",
    description: "Klubové zázemí pro schůzky, akce a běžný provoz.",
    capacity: "Klubové akce a zázemí",
    bookingLabel: "Klubovna",
    availability: "Využití klubovny lze uvádět v kalendáři.",
    image: "/images/placeholders/clubhouse-1.svg?v=2",
    details: ["Schůzky", "Akce", "Zázemí", "Klub"],
  },
] as const satisfies readonly Facility[];

export const galleryItems = [
  {
    src: "/images/placeholders/football-1.svg?v=2",
    alt: "Fotbalové hřiště TJ Baník Rynholec",
    title: "Hlavní fotbalové hřiště",
    category: "Fotbalové hřiště",
    note: "Hlavní plocha pro zápasy a tréninky.",
  },
  {
    src: "/images/placeholders/football-2.svg?v=2",
    alt: "Detail fotbalového hřiště TJ Baník Rynholec",
    title: "Tréninkový detail",
    category: "Fotbalové hřiště",
    note: "Místo pro každodenní klubový program.",
  },
  {
    src: "/images/placeholders/football-3.svg?v=2",
    alt: "Zázemí u fotbalového hřiště TJ Baník Rynholec",
    title: "Zápasový prostor",
    category: "Fotbalové hřiště",
    note: "Zázemí u hlavní hrací plochy.",
  },
  {
    src: "/images/placeholders/multifunction-1.svg?v=2",
    alt: "Multifunkční hřiště v Rynholci",
    title: "Multifunkční hřiště",
    category: "Multifunkční hřiště",
    note: "Doplňkový prostor pro sportovní aktivity.",
  },
  {
    src: "/images/placeholders/multifunction-2.svg?v=2",
    alt: "Detail multifunkčního hřiště v Rynholci",
    title: "Sportovní plocha",
    category: "Multifunkční hřiště",
    note: "Vhodné pro volné bloky a menší akce.",
  },
  {
    src: "/images/placeholders/multifunction-3.svg?v=2",
    alt: "Zázemí multifunkčního hřiště v Rynholci",
    title: "Areálový blok",
    category: "Multifunkční hřiště",
    note: "Přehled bude navázaný na kalendář.",
  },
  {
    src: "/images/placeholders/gym-1.svg?v=2",
    alt: "Posilovna TJ Baník Rynholec",
    title: "Posilovna",
    category: "Posilovna",
    note: "Kondiční zázemí pro hráče a klub.",
  },
  {
    src: "/images/placeholders/gym-2.svg?v=2",
    alt: "Detail posilovny TJ Baník Rynholec",
    title: "Kondiční příprava",
    category: "Posilovna",
    note: "Prostor pro kondiční přípravu.",
  },
  {
    src: "/images/placeholders/gym-3.svg?v=2",
    alt: "Zázemí posilovny TJ Baník Rynholec",
    title: "Tréninkové zázemí",
    category: "Posilovna",
    note: "Tréninkové zázemí pro hráče.",
  },
  {
    src: "/images/placeholders/sauna-1.svg?v=2",
    alt: "Finská sauna TJ Baník Rynholec",
    title: "Finská sauna",
    category: "Finská sauna",
    note: "Regenerace a bloky podle domluvy.",
  },
  {
    src: "/images/placeholders/sauna-2.svg?v=2",
    alt: "Detail finské sauny TJ Baník Rynholec",
    title: "Regenerační část",
    category: "Finská sauna",
    note: "Obsazenost půjde vést v kalendáři.",
  },
  {
    src: "/images/placeholders/sauna-3.svg?v=2",
    alt: "Zázemí finské sauny TJ Baník Rynholec",
    title: "Saunový blok",
    category: "Finská sauna",
    note: "Klidové zázemí po sportovním programu.",
  },
  {
    src: "/images/placeholders/clubhouse-1.svg?v=2",
    alt: "Klubovna TJ Baník Rynholec",
    title: "Klubovna",
    category: "Klubovna a zázemí",
    note: "Pro schůzky, akce a běžný provoz klubu.",
  },
  {
    src: "/images/placeholders/clubhouse-2.svg?v=2",
    alt: "Detail klubovny TJ Baník Rynholec",
    title: "Klubové zázemí",
    category: "Klubovna a zázemí",
    note: "Místo pro komunitu kolem Baníku.",
  },
  {
    src: "/images/placeholders/clubhouse-3.svg?v=2",
    alt: "Zázemí klubu TJ Baník Rynholec",
    title: "Areálové zázemí",
    category: "Klubovna a zázemí",
    note: "Zázemí pro klubový provoz.",
  },
] as const satisfies readonly GalleryItem[];

export const schedulePreview = [
  {
    day: "SO",
    date: "27. 6.",
    time: "17:00",
    type: "Zápas",
    team: "A tým",
    opponent: "Domácí utkání",
    venue: "Fotbalové hřiště",
    status: "Potvrzeno",
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
    status: "Potvrzeno",
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
    status: "Potvrzeno",
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
  {
    day: "SO",
    date: "4. 7.",
    time: "09:00",
    type: "Areál",
    team: "Areál",
    opponent: "Volný blok hřiště",
    venue: "Fotbalové hřiště",
    status: "Volno",
    preview: true,
  },
  {
    day: "ČT",
    date: "9. 7.",
    time: "18:30",
    type: "Trénink",
    team: "A tým",
    opponent: "Večerní příprava",
    venue: "Fotbalové hřiště",
    status: "Potvrzeno",
    preview: true,
  },
  {
    day: "NE",
    date: "12. 7.",
    time: "15:00",
    type: "Areál",
    team: "Areál",
    opponent: "Klubovní odpoledne",
    venue: "Klubovna a zázemí",
    status: "Blokováno",
    preview: true,
  },
  {
    day: "SO",
    date: "18. 7.",
    time: "10:30",
    type: "Zápas",
    team: "Žáci",
    opponent: "Mládežnický turnaj",
    venue: "Fotbalové hřiště",
    status: "Potvrzeno",
    preview: true,
  },
  {
    day: "NE",
    date: "26. 7.",
    time: "17:00",
    type: "Regenerace",
    team: "Areál",
    opponent: "Sauna rezervace",
    venue: "Finská sauna",
    status: "Blokováno",
    preview: true,
  },
  {
    day: "PO",
    date: "3. 8.",
    time: "16:00",
    type: "Trénink",
    team: "Přípravka",
    opponent: "Prázdninový trénink",
    venue: "Multifunkční hřiště",
    status: "Potvrzeno",
    preview: true,
  },
  {
    day: "SO",
    date: "15. 8.",
    time: "17:30",
    type: "Zápas",
    team: "A tým",
    opponent: "Domácí utkání",
    venue: "Fotbalové hřiště",
    status: "Potvrzeno",
    preview: true,
  },
  {
    day: "NE",
    date: "23. 8.",
    time: "11:00",
    type: "Areál",
    team: "Areál",
    opponent: "Volný blok areálu",
    venue: "Multifunkční hřiště",
    status: "Volno",
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
    image: "/images/placeholders/clubhouse-1.svg?v=2",
  },
  {
    date: "27. 6. 2026",
    category: "Týmy",
    title: "A tým zvládl domácí utkání",
    summary: "Krátký report ze zápasu s prostorem pro výsledek, soupeře, fotku a nejdůležitější momenty utkání.",
    href: "/novinky#a-tym-domaci-utkani",
    image: "/images/placeholders/football-1.svg?v=2",
  },
  {
    date: "30. 6. 2026",
    category: "Týmy",
    title: "Mládež má za sebou povedený trénink",
    summary: "Mládežnické týmy mají v novinkách prostor pro tréninky, turnaje, zápasy a informace pro rodiče.",
    href: "/novinky#mladez-trenink",
    image: "/images/placeholders/multifunction-2.svg?v=2",
  },
  {
    date: "2. 7. 2026",
    category: "Areál",
    title: "Sauna a zázemí připravené na rezervace",
    summary: "Areálová část webu může informovat o provozu, obsazenosti, změnách otevírací doby a domluvených blocích.",
    href: "/areal#sauna",
    image: "/images/placeholders/sauna-1.svg?v=2",
  },
  {
    date: "4. 7. 2026",
    category: "Kalendář",
    title: "Kalendář ukáže zápasy, tréninky i bloky areálu",
    summary: "Kalendář je připravený pro ruční správu na webu i pro import přes Excel šablonu. Návštěvník vidí jen přehled.",
    href: "/kalendar",
    image: "/images/placeholders/football-2.svg?v=2",
  },
  {
    date: "9. 7. 2026",
    category: "Klub",
    title: "Starší garda chystá přátelský zápas",
    summary: "Klubové novinky mohou pokrýt přátelské zápasy, setkání, akce pro fanoušky a život kolem areálu.",
    href: "/novinky#stara-garda",
    image: "/images/placeholders/clubhouse-2.svg?v=2",
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
