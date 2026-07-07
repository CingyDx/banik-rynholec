import { getStore } from "@netlify/blobs";

type LoginAttemptRecord = {
  count: number;
  firstAttemptAt: string;
  lockedUntil?: string;
};

export type LoginRateLimitResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

const loginStoreName = "banik-admin-security";
const maxAttempts = 8;
const windowMs = 10 * 60 * 1000;
const lockMs = 15 * 60 * 1000;

export async function checkLoginRateLimit(
  request: Request,
  username: string,
  secret: string,
  now = new Date(),
): Promise<LoginRateLimitResult> {
  try {
    const record = await readAttemptRecord(request, username, secret);
    if (!record) {
      return { allowed: true };
    }

    const lockedUntil = readDate(record.lockedUntil);
    if (lockedUntil && lockedUntil.getTime() > now.getTime()) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000)),
      };
    }

    const firstAttemptAt = readDate(record.firstAttemptAt);
    if (!firstAttemptAt || firstAttemptAt.getTime() + windowMs <= now.getTime()) {
      return { allowed: true };
    }

    return { allowed: true };
  } catch (error) {
    console.warn("Admin login rate limit check failed", error);
    return { allowed: true };
  }
}

export async function recordFailedLogin(
  request: Request,
  username: string,
  secret: string,
  now = new Date(),
): Promise<void> {
  try {
    const key = await createAttemptKey(request, username, secret);
    const store = getLoginStore();
    const current = normalizeAttemptRecord(await store.get(key, { type: "json" }));
    const currentFirstAttempt = readDate(current?.firstAttemptAt);
    const isInsideWindow = Boolean(currentFirstAttempt && currentFirstAttempt.getTime() + windowMs > now.getTime());
    const count = isInsideWindow ? (current?.count ?? 0) + 1 : 1;
    const next: LoginAttemptRecord = {
      count,
      firstAttemptAt: isInsideWindow && current ? current.firstAttemptAt : now.toISOString(),
    };

    if (count >= maxAttempts) {
      next.lockedUntil = new Date(now.getTime() + lockMs).toISOString();
    }

    await store.setJSON(key, next);
  } catch (error) {
    console.warn("Admin login rate limit update failed", error);
  }
}

export async function clearLoginRateLimit(request: Request, username: string, secret: string): Promise<void> {
  try {
    await getLoginStore().delete(await createAttemptKey(request, username, secret));
  } catch (error) {
    console.warn("Admin login rate limit clear failed", error);
  }
}

export function getRetryAfterMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return `Příliš mnoho pokusů. Zkuste to znovu za ${minutes} min.`;
}

async function readAttemptRecord(request: Request, username: string, secret: string): Promise<LoginAttemptRecord | null> {
  const key = await createAttemptKey(request, username, secret);
  return normalizeAttemptRecord(await getLoginStore().get(key, { type: "json" }));
}

function getLoginStore() {
  return getStore({ name: loginStoreName, consistency: "strong" });
}

async function createAttemptKey(request: Request, username: string, secret: string): Promise<string> {
  const identity = `${readClientIdentifier(request)}:${username.trim().toLowerCase() || "unknown"}`;
  const signature = await signValue(identity, secret);
  return `login/${signature.slice(0, 64)}`;
}

function readClientIdentifier(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function normalizeAttemptRecord(value: unknown): LoginAttemptRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const count = typeof record.count === "number" && Number.isFinite(record.count) ? Math.max(0, record.count) : 0;
  const firstAttemptAt = typeof record.firstAttemptAt === "string" ? record.firstAttemptAt : "";
  const lockedUntil = typeof record.lockedUntil === "string" ? record.lockedUntil : undefined;

  if (!count || !readDate(firstAttemptAt)) {
    return null;
  }

  return { count, firstAttemptAt, lockedUntil };
}

function readDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
