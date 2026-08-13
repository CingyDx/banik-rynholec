import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CalendarApp, {
  addHoursToDateTime,
  getDurationHours,
  getMonthGrid,
} from "../../src/components/calendar/CalendarApp";
import { calendarSeedEvents } from "../../src/content/calendar";

describe("CalendarApp modes", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(new Date("2026-07-29T12:00:00+02:00"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ events: calendarSeedEvents }), { status: 200 })),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps public visitors in read-only calendar mode", async () => {
    render(<CalendarApp mode="public" />);

    expect(await screen.findByLabelText("Správa kalendáře")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Administrace/i })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("button", { name: /Import Excel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Export Excel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nový zápis" })).not.toBeInTheDocument();
  });

  it("shows offline Excel and edit controls for the shared admin account", async () => {
    render(<CalendarApp mode="admin" />);

    expect(await screen.findByLabelText("Správa kalendáře")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stáhnout roční šablonu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stáhnout vyplněný kalendář/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Import Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nový zápis" })).toBeInTheDocument();
    expect(screen.getByLabelText("Začátek")).toHaveValue(formatExpectedTodayStart());
    expect(screen.getByRole("button", { name: /Dnes/i })).toBeInTheDocument();
    expect(document.querySelector(".month-cell.is-today strong")).toHaveTextContent("29. 7.");
    expect(document.querySelector(".month-cell.is-today")).toHaveAttribute("aria-current", "date");
    expect(document.querySelector(".month-cell.is-today small")).toHaveTextContent("Dnes");

    const cells = Array.from(document.querySelectorAll<HTMLElement>(".month-cell"));
    expect(cells).toHaveLength(42);
    expect(cells.every((cell) => Boolean(cell.querySelector("strong")?.textContent?.trim()))).toBe(true);
    expect(cells[0]).toHaveAttribute("data-date", "2026-06-29");
    expect(cells[0]?.querySelector("strong")).toHaveTextContent("29. 6.");
    expect(cells[41]).toHaveAttribute("data-date", "2026-08-09");
    expect(cells[41]?.querySelector("strong")).toHaveTextContent("9. 8.");
  });

  it("offers half-hour duration steps for 90-minute training blocks", async () => {
    render(<CalendarApp mode="admin" />);

    expect(await screen.findByRole("option", { name: "+0,5 h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "+1,5 h" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "+10 h" })).toBeInTheDocument();
  });

  it("keeps 90-minute event arithmetic exact", () => {
    expect(getDurationHours("2026-09-01T17:00", "2026-09-01T18:30")).toBe(1.5);
    expect(addHoursToDateTime("2026-09-01T17:00", 1.5)).toBe("2026-09-01T18:30");
  });

  it("visually distinguishes an occupied sauna from an occupied gym", async () => {
    const saunaEvent = {
      ...calendarSeedEvents.find((event) => event.resourceId === "sauna")!,
      start: "2026-07-01T18:00",
      end: "2026-07-01T20:00",
    };
    const gymEvent = calendarSeedEvents.find((event) => event.resourceId === "gym")!;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ events: [saunaEvent, gymEvent] }), { status: 200 })),
    );

    render(<CalendarApp mode="public" />);

    expect(await screen.findByLabelText(/Obsazenost sauny/)).toHaveClass("resource-sauna");
    expect(screen.getByLabelText(/Posilovna blok/)).toHaveClass("resource-gym");
  });

  it("automatically follows the real local date across a month boundary", async () => {
    vi.setSystemTime(new Date("2026-07-31T23:59:30+02:00"));
    render(<CalendarApp mode="public" />);

    expect(await screen.findByText("červenec 2026")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByText("srpen 2026")).toBeInTheDocument();
    expect(document.querySelector(".month-cell.is-today strong")).toHaveTextContent("1. 8.");
    expect(document.querySelector(".month-cell.is-today")).toHaveAttribute("data-date", "2026-08-01");
  });

  it("generates the 2026 month grid from real calendar rules", () => {
    for (let month = 0; month < 12; month += 1) {
      const grid = getMonthGrid(new Date(2026, month, 1));
      const daysInMonth = new Date(2026, month + 1, 0).getDate();

      expect(grid).toHaveLength(42);
      expect(grid[0]?.getDay()).toBe(1);

      for (let day = 1; day <= daysInMonth; day += 1) {
        const gridIndex = grid.findIndex(
          (date) => date.getFullYear() === 2026 && date.getMonth() === month && date.getDate() === day,
        );
        const expectedMondayColumn = toMondayColumn(weekdayByCalendarFormula(2026, month + 1, day));

        expect(gridIndex).toBeGreaterThanOrEqual(0);
        expect(gridIndex % 7).toBe(expectedMondayColumn);
      }
    }

    expect(weekdayByCalendarFormula(2026, 7, 29)).toBe(3);
    expect(weekdayByCalendarFormula(2026, 8, 1)).toBe(6);
  });
});

function formatExpectedTodayStart(): string {
  const today = new Date();
  return `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()} 14:00`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toMondayColumn(jsWeekday: number): number {
  return jsWeekday === 0 ? 6 : jsWeekday - 1;
}

function weekdayByCalendarFormula(year: number, month: number, day: number): number {
  const monthOffsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let normalizedYear = year;
  if (month < 3) {
    normalizedYear -= 1;
  }
  return (
    normalizedYear +
    Math.floor(normalizedYear / 4) -
    Math.floor(normalizedYear / 100) +
    Math.floor(normalizedYear / 400) +
    monthOffsets[month - 1]! +
    day
  ) % 7;
}
