import { createHmac, timingSafeEqual } from "crypto";
import { getUserById } from "@/lib/db";

const SESSION_SECRET = process.env.SESSION_SECRET ?? "please-change-this-secret";
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionData = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

export function createSessionToken(userId: string, email: string, accessToken: string, refreshToken: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ userId, email, accessToken, refreshToken, issuedAt });
  const encryptedPayload = Buffer.from(payload).toString("base64");
  const signature = createHmac("sha256", SESSION_SECRET).update(encryptedPayload).digest("hex");
  return `${encryptedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encryptedPayload, signature] = parts;
  if (!encryptedPayload || !signature) {
    return null;
  }

  const expected = createHmac("sha256", SESSION_SECRET).update(encryptedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encryptedPayload, "base64").toString("utf8"));
    const age = Math.floor(Date.now() / 1000) - payload.issuedAt;
    if (age < 0 || age > SESSION_MAX_AGE_SECONDS) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  } catch {
    return null;
  }
}

export function createSessionCookie(userId: string, email: string, accessToken: string, refreshToken: string) {
  const token = createSessionToken(userId, email, accessToken, refreshToken);
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toUTCString();
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; ${secure}Expires=${expires}; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "Secure; " : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; ${secure}Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}

export async function getUserFromSessionCookie(sessionCookie?: string) {
  if (!sessionCookie) {
    return null;
  }

  const sessionData = verifySessionToken(sessionCookie);
  if (!sessionData) {
    return null;
  }

  const profile = await getUserById(sessionData.userId);
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    handle: profile.handle,
    email: sessionData.email,
  };
}
