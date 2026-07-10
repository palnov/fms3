import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteAiConversation } from "@/lib/ai-chat-log";
import { isTrustedMutationOrigin } from "@/lib/security";

export async function POST(request: Request, context: RouteContext<"/admin/ai-chats/[id]/delete">) {
  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/ai-chats/login", request.url), { status: 303 });
  }

  const { id } = await context.params;
  deleteAiConversation(id);
  return NextResponse.redirect(new URL("/admin/ai-chats", request.url), { status: 303 });
}
