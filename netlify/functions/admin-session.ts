import type { Config, Context } from "@netlify/functions";

import { createClearSessionCookie, readSessionFromRequest, shouldUseSecureCookie } from "./_shared/admin-auth";
import { getRequiredEnv } from "./_shared/env";
import { jsonResponse, methodNotAllowed } from "./_shared/http";

export default async (req: Request, _context: Context) => {
  if (req.method === "DELETE") {
    return jsonResponse(
      { authenticated: false },
      {
        headers: {
          "Set-Cookie": createClearSessionCookie({ secure: shouldUseSecureCookie(req) }),
        },
      },
    );
  }

  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const session = await readSessionFromRequest(req, getRequiredEnv("BANIK_SESSION_SECRET"));
    return jsonResponse(
      session
        ? { authenticated: true, username: session.username, expiresAt: session.expiresAt }
        : { authenticated: false },
      { status: session ? 200 : 401 },
    );
  } catch (error) {
    console.error("Admin session check failed", error);
    return jsonResponse({ error: "Session nejde ověřit." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/admin/session",
};
