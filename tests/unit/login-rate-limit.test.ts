import { beforeEach, describe, expect, it, vi } from "vitest";

const blobMock = vi.hoisted(() => ({
  entries: new Map<string, unknown>(),
}));

vi.mock("@netlify/blobs", () => ({
  getStore: vi.fn(() => ({
    delete: vi.fn(async (key: string) => {
      blobMock.entries.delete(key);
    }),
    get: vi.fn(async (key: string) => blobMock.entries.get(key) ?? null),
    setJSON: vi.fn(async (key: string, value: unknown) => {
      blobMock.entries.set(key, value);
    }),
  })),
}));

import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  recordFailedLogin,
} from "../../netlify/functions/_shared/login-rate-limit";

const secret = "test-session-secret-for-rate-limit";
const now = new Date("2026-07-07T10:00:00Z");

describe("admin login rate limit", () => {
  beforeEach(() => {
    blobMock.entries.clear();
  });

  it("temporarily blocks repeated failed login attempts", async () => {
    const request = new Request("https://banikrynholec.cz/api/admin/login", {
      headers: {
        "x-forwarded-for": "192.0.2.44",
      },
    });

    for (let index = 0; index < 8; index += 1) {
      await recordFailedLogin(request, "banikrynholec", secret, now);
    }

    const result = await checkLoginRateLimit(
      request,
      "banikrynholec",
      secret,
      new Date("2026-07-07T10:01:00Z"),
    );

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBe(14 * 60);
    }
    expect([...blobMock.entries.keys()][0]).not.toContain("192.0.2.44");
  });

  it("clears the rate limit after a successful login", async () => {
    const request = new Request("https://banikrynholec.cz/api/admin/login", {
      headers: {
        "x-forwarded-for": "198.51.100.17",
      },
    });

    await recordFailedLogin(request, "banikrynholec", secret, now);
    await clearLoginRateLimit(request, "banikrynholec", secret);

    await expect(checkLoginRateLimit(request, "banikrynholec", secret, now)).resolves.toEqual({ allowed: true });
    expect(blobMock.entries.size).toBe(0);
  });
});
