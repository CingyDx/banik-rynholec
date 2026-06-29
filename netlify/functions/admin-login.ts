import type { Config, Context } from "@netlify/functions";

import { createSessionCookie, createSessionToken, shouldUseSecureCookie } from "./_shared/admin-auth";
import { getRequiredEnv } from "./_shared/env";
import { jsonResponse, methodNotAllowed } from "./_shared/http";

const maxAgeSeconds = 60 * 60 * 8;

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = (await req.json()) as { username?: unknown; password?: unknown };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    const expectedUsername = getRequiredEnv("BANIK_ADMIN_USERNAME");
    const expectedPassword = getRequiredEnv("BANIK_ADMIN_PASSWORD");
    const sessionSecret = getRequiredEnv("BANIK_SESSION_SECRET");

    if (username !== expectedUsername || password !== expectedPassword) {
      return jsonResponse({ error: "Neplatné přihlašovací údaje." }, { status: 401 });
    }

    const token = await createSessionToken({ username, secret: sessionSecret, maxAgeSeconds });
    return jsonResponse(
      { username },
      {
        headers: {
          "Set-Cookie": createSessionCookie(token, maxAgeSeconds, { secure: shouldUseSecureCookie(req) }),
        },
      },
    );
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Přihlášení se nepodařilo." },
      { status: 500 },
    );
  }
};

export const config: Config = {
  path: "/api/admin/login",
};
