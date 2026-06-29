const sessionCookieName = "banik_admin_session";

export type AdminSession = {
  username: string;
  expiresAt: string;
};

type CreateSessionTokenOptions = {
  username: string;
  secret: string;
  now?: Date;
  maxAgeSeconds?: number;
};

type SessionCookieOptions = {
  secure?: boolean;
};

export async function createSessionToken({
  username,
  secret,
  now = new Date(),
  maxAgeSeconds = 60 * 60 * 8,
}: CreateSessionTokenOptions): Promise<string> {
  const payload = {
    username,
    expiresAt: new Date(now.getTime() + maxAgeSeconds * 1000).toISOString(),
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
  now = new Date(),
): Promise<AdminSession | null> {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  const payload = parseJson<AdminSession>(fromBase64Url(encodedPayload));
  if (!payload?.username || !payload.expiresAt) {
    return null;
  }

  const expiresAt = new Date(payload.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return null;
  }

  return payload;
}

export async function readSessionFromRequest(
  request: Request,
  secret: string,
  now = new Date(),
): Promise<AdminSession | null> {
  const token = readCookie(request.headers.get("cookie") ?? "", sessionCookieName);
  return token ? verifySessionToken(token, secret, now) : null;
}

export function createSessionCookie(token: string, maxAgeSeconds: number, options: SessionCookieOptions = {}): string {
  const parts = [
    `${sessionCookieName}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (options.secure ?? true) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function createClearSessionCookie(options: SessionCookieOptions = {}): string {
  return [
    `${sessionCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    options.secure ?? true ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function shouldUseSecureCookie(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto) {
    return forwardedProto === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return true;
  }
}

function readCookie(header: string, name: string): string | null {
  const parts = header.split(";").map((part) => part.trim());
  const prefix = `${name}=`;
  const match = parts.find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
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

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function toBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function fromBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return new TextDecoder().decode(Uint8Array.from(atob(padded), (char) => char.charCodeAt(0)));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
