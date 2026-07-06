import type { Config, Context } from "@netlify/functions";

import { readSessionFromRequest } from "./_shared/admin-auth";
import { normalizeCalendarEventsForStorage, readCalendarEventsFromStore, writeCalendarEventsToStore } from "./_shared/calendar-data";
import { getRequiredEnv } from "./_shared/env";
import { jsonResponse, methodNotAllowed } from "./_shared/http";

export default async (req: Request, _context: Context) => {
  if (req.method === "GET") {
    try {
      return jsonResponse({ events: await readCalendarEventsFromStore() });
    } catch (error) {
      console.error("Calendar read failed", error);
      return jsonResponse({ error: "Kalendář se nepodařilo načíst." }, { status: 500 });
    }
  }

  if (req.method !== "PUT") {
    return methodNotAllowed();
  }

  try {
    const session = await readSessionFromRequest(req, getRequiredEnv("BANIK_SESSION_SECRET"));
    if (!session) {
      return jsonResponse({ error: "Nejste přihlášený administrátor." }, { status: 401 });
    }

    const body = (await req.json()) as { events?: unknown };
    const incomingCount = Array.isArray(body.events) ? body.events.length : 0;
    const normalized = normalizeCalendarEventsForStorage(body.events);
    if (incomingCount > 0 && normalized.length === 0) {
      return jsonResponse({ error: "Soubor neobsahuje žádné platné kalendářní záznamy." }, { status: 400 });
    }

    return jsonResponse({ events: await writeCalendarEventsToStore(normalized) });
  } catch (error) {
    console.error("Calendar write failed", error);
    return jsonResponse({ error: "Kalendář se nepodařilo uložit." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/calendar",
};
