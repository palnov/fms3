import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionValue, getAdminSessionCookieOptions, verifyAdminPassword } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp, hashRateLimitKey, isTrustedMutationOrigin } from "@/lib/security";

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  const formData = await request.formData();
  const secret = formData.get("secret");
  const url = new URL(request.url);

  if (typeof secret !== "string" || !verifyAdminPassword(secret)) {
    let limit;
    try {
      limit = await checkRateLimit(
        hashRateLimitKey(["admin-login", getClientIp(request)]),
        LOGIN_LIMIT,
        LOGIN_WINDOW_MS,
      );
    } catch {
      return NextResponse.json({ error: "Сервис входа временно недоступен." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    if (!limit.allowed) {
      return NextResponse.redirect(new URL("/admin/ai-chats/login?error=rate-limit", request.url), { status: 303 });
    }
    return NextResponse.redirect(new URL("/admin/ai-chats/login?error=1", url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin/ai-chats", url), { status: 303 });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), getAdminSessionCookieOptions());
  return response;
}
