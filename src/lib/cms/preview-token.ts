import { createHmac, timingSafeEqual } from "node:crypto";

const PREVIEW_TOKEN_TTL_SECONDS = 10 * 60;
const MAX_PREVIEW_TOKEN_TTL_SECONDS = 11 * 60;
const LOCAL_PAYLOAD_SECRET = "local-development-payload-secret-change-me";

function getPreviewSecret() {
  const secret = process.env.PAYLOAD_SECRET?.trim() || LOCAL_PAYLOAD_SECRET;
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("PAYLOAD_SECRET must contain at least 32 characters to sign CMS previews.");
  }
  return secret;
}

export function isSafeCmsPagePreviewPath(path: unknown): path is string {
  if (typeof path !== "string" || path !== path.trim() || !path.startsWith("/") || path.startsWith("//")) return false;
  if (/[\\?#\u0000-\u001f\u007f]/.test(path) || path.includes("//")) return false;

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    return false;
  }

  if (/[\\?#\u0000-\u001f\u007f]/.test(decodedPath) || decodedPath.includes("//")) return false;
  if (decodedPath.split("/").some((segment) => segment === "." || segment === "..")) return false;
  if (/^\/(?:api|cms|admin)(?:\/|$)/i.test(decodedPath)) return false;

  return true;
}

function sign(path: string, expires: number) {
  return createHmac("sha256", getPreviewSecret())
    .update(`cms-page-preview:v1\n${expires}\n${path}`)
    .digest("base64url");
}

export function createCmsPagePreviewSignature(path: unknown, now = Date.now()) {
  if (!isSafeCmsPagePreviewPath(path)) return null;

  // Keep the URL stable while Payload recalculates it for each form edit.
  const expires = Math.floor(now / 60_000) * 60 + PREVIEW_TOKEN_TTL_SECONDS;
  return { expires, signature: sign(path, expires) };
}

export function createCmsPagePreviewUrl(path: unknown, siteUrl: string) {
  const token = createCmsPagePreviewSignature(path);
  if (!token || typeof path !== "string") return null;

  const url = new URL("/api/cms/preview", siteUrl);
  url.searchParams.set("path", path);
  url.searchParams.set("expires", String(token.expires));
  url.searchParams.set("signature", token.signature);
  return url.toString();
}

export function verifyCmsPagePreviewSignature(path: unknown, expires: unknown, signature: unknown, now = Date.now()) {
  if (!isSafeCmsPagePreviewPath(path) || typeof signature !== "string" || !/^[-_A-Za-z0-9]{43}$/.test(signature)) return false;
  const expiry = typeof expires === "number" ? expires : Number(expires);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(expiry) || expiry <= nowSeconds || expiry - nowSeconds > MAX_PREVIEW_TOKEN_TTL_SECONDS) return false;

  const expected = Buffer.from(sign(path, expiry));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
