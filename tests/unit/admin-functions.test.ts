import { describe, expect, it, vi } from "vitest";

import adminLogin from "../../netlify/functions/admin-login";

type ProcessLike = {
  env: Record<string, string | undefined>;
};

describe("admin functions", () => {
  it("does not expose internal environment variable names in login errors", async () => {
    const globals = globalThis as typeof globalThis & { process: ProcessLike };
    const env = globals.process.env;
    const previousUsername = env.BANIK_ADMIN_USERNAME;
    const previousPassword = env.BANIK_ADMIN_PASSWORD;
    const previousSecret = env.BANIK_SESSION_SECRET;
    delete env.BANIK_ADMIN_USERNAME;
    delete env.BANIK_ADMIN_PASSWORD;
    delete env.BANIK_SESSION_SECRET;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const response = await adminLogin(
        new Request("https://banikrynholec.cz/api/admin/login", {
          body: JSON.stringify({ username: "admin", password: "secret" }),
          method: "POST",
        }),
        {} as never,
      );
      const payload = (await response.json()) as { error?: string };

      expect(response.status).toBe(500);
      expect(payload.error).toBe("Přihlášení se nepodařilo.");
      expect(payload.error).not.toContain("BANIK_");
    } finally {
      env.BANIK_ADMIN_USERNAME = previousUsername;
      env.BANIK_ADMIN_PASSWORD = previousPassword;
      env.BANIK_SESSION_SECRET = previousSecret;
      consoleSpy.mockRestore();
    }
  });
});
