import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieOptions } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/ai-chats/login", request.url), { status: 303 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...getAdminSessionCookieOptions(), maxAge: 0 });
  return response;
}
