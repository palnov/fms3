import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAiConversation } from "@/lib/ai-chat-log";
import SafeMessageText from "@/components/chat/SafeMessageText";

export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Moscow",
  }).format(new Date(timestamp));
}

function roleLabel(role: string) {
  if (role === "user") return "Пользователь";
  if (role === "assistant") return "ИИ";
  return "Система";
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/ai-chats/login");
  }

  const { id } = await params;
  const conversation = getAiConversation(id);
  if (!conversation) notFound();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/ai-chats" className="text-sm text-blue-300 hover:text-blue-200">
            ← К списку
          </Link>
          <form action={`/admin/ai-chats/${conversation.id}/delete`} method="post">
            <button className="rounded-md border border-red-900 px-3 py-2 text-sm text-red-200 hover:bg-red-950">
              Удалить диалог
            </button>
          </form>
        </div>

        <header className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-bold">Диалог {conversation.id}</h1>
          <dl className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div><dt className="text-slate-500">Создан</dt><dd>{formatDate(conversation.createdAt)}</dd></div>
            <div><dt className="text-slate-500">Последнее сообщение</dt><dd>{formatDate(conversation.lastMessageAt)}</dd></div>
            <div><dt className="text-slate-500">Пользователь</dt><dd>{conversation.anonymousId}</dd></div>
            <div><dt className="text-slate-500">Язык / контекст</dt><dd>{conversation.language}{conversation.pageContext ? ` / ${conversation.pageContext}` : ""}</dd></div>
          </dl>
          {conversation.lastError ? (
            <p className="mt-4 rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
              {conversation.lastError}
            </p>
          ) : null}
        </header>

        <section className="mt-6 space-y-4">
          {conversation.messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-lg border p-4 ${
                message.role === "user"
                  ? "border-blue-900 bg-blue-950/40"
                  : message.role === "assistant"
                    ? "border-slate-800 bg-slate-900"
                    : "border-amber-900 bg-amber-950/30"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wide">{roleLabel(message.role)}</span>
                <span>{formatDate(message.createdAt)}</span>
              </div>
              <div className="prose prose-invert max-w-none prose-p:my-2 prose-li:my-1">
                <SafeMessageText text={message.content} />
              </div>
              {Object.keys(message.metadata).length > 0 ? (
                <details className="mt-3 text-xs text-slate-400">
                  <summary className="cursor-pointer">Метаданные</summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3">{JSON.stringify(message.metadata, null, 2)}</pre>
                </details>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
