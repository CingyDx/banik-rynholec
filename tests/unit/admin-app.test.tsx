import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminApp from "../../src/components/admin/AdminApp";
import { calendarSeedEvents } from "../../src/content/calendar";

describe("AdminApp", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/api/admin/session")) {
          return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
        }
        if (url.endsWith("/api/admin/login")) {
          return new Response(JSON.stringify({ username: "admin" }), { status: 200 });
        }
        if (url.endsWith("/api/calendar")) {
          return new Response(JSON.stringify({ events: calendarSeedEvents }), { status: 200 });
        }
        return new Response("Not found", { status: 404 });
      }),
    );
  });

  it("uses one shared admin login before showing calendar editing", async () => {
    render(<AdminApp />);

    expect(await screen.findByRole("heading", { name: "Administrace" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Uživatelské jméno"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Heslo"), { target: { value: "tajne-heslo" } });
    fireEvent.click(screen.getByRole("button", { name: "Přihlásit" }));

    expect(await screen.findByRole("heading", { name: "Kalendář a Excel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stáhnout roční šablonu/i })).toBeInTheDocument();
  });

  it("shows a clean local-dev message when the admin API returns HTML instead of JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith("/api/admin/session")) {
          return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
        }
        if (url.endsWith("/api/admin/login")) {
          return new Response("<!doctype html><html><body>Not found</body></html>", {
            headers: { "Content-Type": "text/html" },
            status: 404,
          });
        }
        return new Response("Not found", { status: 404 });
      }),
    );

    render(<AdminApp />);

    expect(await screen.findByRole("heading", { name: "Administrace" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Uživatelské jméno"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Heslo"), { target: { value: "tajne-heslo" } });
    fireEvent.click(screen.getByRole("button", { name: "Přihlásit" }));

    expect(await screen.findByText(/Administrace se připojí po spuštění Netlify režimu/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unexpected token/i)).not.toBeInTheDocument();
  });
});
