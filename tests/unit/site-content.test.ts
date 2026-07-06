import { describe, expect, it } from "vitest";

import {
  club,
  facilities,
  galleryItems,
  navigation,
  newsPreview,
  reservationAreas,
  schedulePreview,
  teams,
} from "../../src/content/site";

describe("public site content", () => {
  it("defines every primary navigation route", () => {
    expect(navigation).toEqual([
      { label: "Domů", href: "/" },
      { label: "Klub", href: "/klub" },
      { label: "Týmy", href: "/tymy" },
      { label: "Novinky", href: "/novinky" },
      { label: "Galerie", href: "/galerie" },
      { label: "Kalendář", href: "/kalendar" },
      { label: "Areál", href: "/areal" },
      { label: "Kontakt", href: "/kontakt" },
    ]);
  });

  it("contains the four confirmed team categories", () => {
    expect(teams.map(({ name }) => name)).toEqual([
      "Přípravka",
      "Žáci",
      "A tým",
      "Stará garda",
    ]);
  });

  it("describes the verified public facilities", () => {
    expect(facilities.map(({ name }) => name)).toEqual([
      "Fotbalové hřiště",
      "Multifunkční hřiště",
      "Posilovna",
      "Finská sauna",
      "Klubovna a zázemí",
    ]);
    expect(club.address).toBe("U hřiště, Rynholec");
    expect(club.coordinates).toEqual({ latitude: 50.1349364, longitude: 13.92615 });
  });

  it("keeps the homepage schedule as a longer preview carousel", () => {
    expect(schedulePreview.length).toBeGreaterThanOrEqual(10);
    expect(schedulePreview.every(({ preview }) => preview)).toBe(true);
    expect(schedulePreview.slice(0, 4).map(({ team }) => team)).toEqual([
      "A tým",
      "Žáci",
      "Přípravka",
      "Areál",
    ]);
    expect(schedulePreview.at(-1)).toMatchObject({
      date: "23. 8.",
      opponent: "Volný blok areálu",
    });
  });

  it("uses prerelease-ready news items with temporary media", () => {
    expect(newsPreview[0]).toMatchObject({
      date: "23. 6. 2026",
      category: "Klub",
      title: "Nové místo pro Baník Rynholec vzniká",
    });
    expect(newsPreview.length).toBeGreaterThanOrEqual(6);
    expect(newsPreview.map(({ title }) => title)).toContain("A tým zvládl domácí utkání");
    expect(newsPreview.every(({ image }) => image.startsWith("/images/placeholders/"))).toBe(true);
  });

  it("provides three gallery images for every facility group", () => {
    expect(galleryItems).toHaveLength(facilities.length * 3);
    for (const facility of facilities) {
      expect(galleryItems.filter(({ category }) => category === facility.name)).toHaveLength(3);
    }
  });

  it("keeps facility availability informational instead of active booking", () => {
    expect(reservationAreas.map(({ name }) => name)).toEqual([
      "Hřiště",
      "Multifunkční hřiště",
      "Posilovna",
      "Sauna",
      "Klubovna",
    ]);
    expect(reservationAreas.every(({ status }) => status === "Informační přehled")).toBe(true);
  });
});
