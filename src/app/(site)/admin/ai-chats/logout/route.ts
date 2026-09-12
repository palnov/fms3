import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieOptions } from "@/lib/admin-auth";
import { isTrustedMutationOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/admin/ai-chats/login", request.url), { status: 303 });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...getAdminSessionCookieOptions(), maxAge: 0 });
  return response;
}
