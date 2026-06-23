import { describe, expect, it } from "vitest";

import {
  club,
  facilities,
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

  it("keeps preview schedule entries visibly non-production", () => {
    expect(schedulePreview).toHaveLength(4);
    expect(schedulePreview.every(({ preview }) => preview)).toBe(true);
    expect(schedulePreview.map(({ team }) => team)).toEqual([
      "A tým",
      "Žáci",
      "Přípravka",
      "Areál",
    ]);
  });

  it("uses honest first-look news instead of invented match reports", () => {
    expect(newsPreview[0]).toMatchObject({
      date: "23. 6. 2026",
      category: "Klub",
      title: "Nové místo pro Baník Rynholec vzniká",
    });
    expect(newsPreview).toHaveLength(3);
  });

  it("offers read-only reservation areas for every public booking surface", () => {
    expect(reservationAreas.map(({ name }) => name)).toEqual([
      "Hřiště",
      "Multifunkční hřiště",
      "Posilovna",
      "Sauna",
      "Klubovna",
    ]);
    expect(reservationAreas.every(({ status }) => status === "Read-only náhled")).toBe(true);
  });
});
