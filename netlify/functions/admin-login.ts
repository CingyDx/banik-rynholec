import type { Config, Context } from "@netlify/functions";

import { createSessionCookie, createSessionToken, shouldUseSecureCookie } from "./_shared/admin-auth";
import { getRequiredEnv } from "./_shared/env";
import { jsonResponse, methodNotAllowed } from "./_shared/http";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  getRetryAfterMessage,
  recordFailedLogin,
} from "./_shared/login-rate-limit";

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

    const rateLimit = await checkLoginRateLimit(req, username, sessionSecret);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: getRetryAfterMessage(rateLimit.retryAfterSeconds) },
        {
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
          status: 429,
        },
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      await recordFailedLogin(req, username, sessionSecret);
      return jsonResponse({ error: "Neplatné přihlašovací údaje." }, { status: 401 });
    }

    await clearLoginRateLimit(req, username, sessionSecret);
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
    console.error("Admin login failed", error);
    return jsonResponse({ error: "Přihlášení se nepodařilo." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/login",
};
