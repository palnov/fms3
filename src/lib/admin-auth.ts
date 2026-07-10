import crypto from "crypto";
import { cookies } from "next/headers";
import { getRequiredSecret } from "@/lib/runtime-config";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret() {
  if (process.env.NODE_ENV !== "production" && !process.env.ADMIN_SECRET) {
    return "development-admin-secret-with-32-chars";
  }
  return getRequiredSecret("ADMIN_SECRET");
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyAdminPassword(value: string) {
  const secret = getSecret();
  const given = Buffer.from(value);
  const expected = Buffer.from(secret);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export function createAdminSessionValue() {
  const secret = getSecret();
  const issuedAt = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${issuedAt}:${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidAdminSession(value: string | undefined) {
  if (!value) return false;

  const secret = getSecret();
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return false;

  const [issuedAtRaw] = payload.split(":");
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  const age = Date.now() - issuedAt;
  return age >= 0 && age <= SESSION_TTL_SECONDS * 1000;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
