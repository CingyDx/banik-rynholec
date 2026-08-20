import { describe, expect, it } from "vitest";

import {
  club,
  facilities,
  gallerySections,
  galleryItems,
  navigation,
  newsPreview,
  reservationAreas,
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
      { label: "Areál", href: "/areal" },
      { label: "Kontakt", href: "/kontakt" },
    ]);
  });

  it("contains the four confirmed team categories", () => {
    expect(teams.map(({ name }) => name)).toEqual([
      "Přípravka",
      "Starší žáci",
      "A tým",
      "Stará garda",
    ]);

    expect(teams.find(({ id }) => id === "zaci")).toMatchObject({
      coach: "Miroslav Chvaščák",
      phone: "+420 739 572 608",
      training: "Úterý a čtvrtek od 17:00 do 18:30.",
      instagram: "https://www.instagram.com/banikrynholeczaci/",
    });
    expect(teams.find(({ id }) => id === "zaci")?.image).toBeUndefined();

    expect(teams.find(({ id }) => id === "a-tym")).toMatchObject({
      image: "/images/teams/a-tym/a-tym-sezona-2025-2026.webp",
    });
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

  it("uses factual news items with supplied media", () => {
    expect(newsPreview[0]).toMatchObject({
      date: "20. 8. 2026",
      category: "Týmy",
      title: "Starší žáci: tréninky a kontakt na jednom místě",
    });
    expect(newsPreview.length).toBeGreaterThanOrEqual(3);
    expect(newsPreview.map(({ title }) => title)).toContain("A tým Baníku v sezoně 2025/2026");
    expect(newsPreview.every(({ image }) => !image.includes("/placeholders/"))).toBe(true);
  });

  it("publishes every supplied team photo in a real-photo gallery", () => {
    expect(gallerySections.map(({ id }) => id)).toEqual(["mladez", "a-tym", "areal"]);
    expect(galleryItems).toHaveLength(12);
    expect(galleryItems.filter(({ category }) => category === "mladez")).toHaveLength(9);
    expect(galleryItems.filter(({ category }) => category === "a-tym")).toHaveLength(1);
    expect(galleryItems.filter(({ category }) => category === "areal")).toHaveLength(2);
    expect(galleryItems.every(({ src }) => !src.includes("/placeholders/"))).toBe(true);
    expect(galleryItems.filter(({ category }) => category === "mladez").every(({ alt }) => !alt.includes("Starší žáci"))).toBe(true);
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
