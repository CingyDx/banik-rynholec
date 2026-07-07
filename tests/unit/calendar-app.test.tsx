import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CalendarApp from "../../src/components/calendar/CalendarApp";
import { calendarSeedEvents } from "../../src/content/calendar";

describe("CalendarApp modes", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ events: calendarSeedEvents }), { status: 200 })),
    );
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
    expect(screen.getByRole("button", { name: /Import Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Export Excel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nový zápis" })).toBeInTheDocument();
    expect(screen.getByLabelText("Začátek")).toHaveValue(formatExpectedTodayStart());
    expect(document.querySelector(".month-cell.is-today strong")).toHaveTextContent(String(new Date().getDate()));
  });
});

function formatExpectedTodayStart(): string {
  const today = new Date();
  return `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()} 14:00`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
