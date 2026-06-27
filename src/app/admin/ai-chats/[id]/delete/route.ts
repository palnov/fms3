import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteAiConversation } from "@/lib/ai-chat-log";

export async function POST(request: Request, context: RouteContext<"/admin/ai-chats/[id]/delete">) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/ai-chats/login", request.url), { status: 303 });
  }

  const { id } = await context.params;
  deleteAiConversation(id);
  return NextResponse.redirect(new URL("/admin/ai-chats", request.url), { status: 303 });
}
