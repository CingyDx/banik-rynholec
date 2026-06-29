import { describe, expect, it } from "vitest";

import {
  createSessionCookie,
  createSessionToken,
  readSessionFromRequest,
  shouldUseSecureCookie,
  verifySessionToken,
} from "../../netlify/functions/_shared/admin-auth";

const secret = "test-secret-that-is-long-enough";
const now = new Date("2026-07-01T12:00:00Z");

describe("admin auth helpers", () => {
  it("creates an http-only admin session cookie that can be read from a request", async () => {
    const token = await createSessionToken({ username: "admin", secret, now, maxAgeSeconds: 3600 });
    const cookie = createSessionCookie(token, 3600);
    const request = new Request("https://banikrynholec.cz/api/admin/session", {
      headers: { cookie },
    });

    await expect(readSessionFromRequest(request, secret, now)).resolves.toEqual({
      username: "admin",
      expiresAt: "2026-07-01T13:00:00.000Z",
    });
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Secure");
  });

  it("allows non-secure cookies only for local HTTP development", async () => {
    const token = await createSessionToken({ username: "admin", secret, now, maxAgeSeconds: 3600 });
    const localRequest = new Request("http://localhost:8888/api/admin/login");
    const productionRequest = new Request("https://banikrynholec.cz/api/admin/login");

    expect(shouldUseSecureCookie(localRequest)).toBe(false);
    expect(shouldUseSecureCookie(productionRequest)).toBe(true);
    expect(createSessionCookie(token, 3600, { secure: shouldUseSecureCookie(localRequest) })).not.toContain("Secure");
    expect(createSessionCookie(token, 3600, { secure: shouldUseSecureCookie(productionRequest) })).toContain("Secure");
  });

  it("rejects tampered or expired admin session tokens", async () => {
    const token = await createSessionToken({ username: "admin", secret, now, maxAgeSeconds: 60 });
    const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
    const expiredAt = new Date("2026-07-01T12:02:00Z");

    await expect(verifySessionToken(tampered, secret, now)).resolves.toBeNull();
    await expect(verifySessionToken(token, secret, expiredAt)).resolves.toBeNull();
  });
});
