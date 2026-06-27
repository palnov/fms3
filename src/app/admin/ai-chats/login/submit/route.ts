import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionValue, getAdminSessionCookieOptions, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const secret = formData.get("secret");
  const url = new URL(request.url);

  if (typeof secret !== "string" || !verifyAdminPassword(secret)) {
    return NextResponse.redirect(new URL("/admin/ai-chats/login?error=1", url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin/ai-chats", url), { status: 303 });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), getAdminSessionCookieOptions());
  return response;
}
