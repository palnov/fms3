import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAiConversations } from "@/lib/ai-chat-log";

export const dynamic = "force-dynamic";

type AdminChatsPageProps = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    page?: string;
  }>;
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(timestamp));
}

function first(value: string | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function AdminChatsPage({ searchParams }: AdminChatsPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/ai-chats/login");
  }

  const params = await searchParams;
  const q = first(params.q);
  const filter = params.filter === "lead" || params.filter === "error" ? params.filter : "all";
  const page = Math.max(Number(params.page || "1") || 1, 1);
  const limit = 30;
  const offset = (page - 1) * limit;
  const result = listAiConversations({ query: q, filter, limit, offset });
  const totalPages = Math.max(Math.ceil(result.total / limit), 1);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Диалоги ИИ-консультанта</h1>
            <p className="mt-1 text-sm text-slate-400">Отладочный журнал без телефонов и данных лид-форм.</p>
          </div>
          <form action="/admin/ai-chats/logout" method="post">
            <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900">
              Выйти
            </button>
          </form>
        </header>

        <form className="mt-6 grid gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_180px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Поиск по первому вопросу, ID диалога или пользователя"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            name="filter"
            defaultValue={filter}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="all">Все</option>
            <option value="lead">С формой</option>
            <option value="error">С ошибкой</option>
          </select>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Найти
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <div className="grid grid-cols-[160px_1fr_120px_120px] gap-4 border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase text-slate-400">
            <span>Последнее</span>
            <span>Диалог</span>
            <span>Сообщений</span>
            <span>Статус</span>
          </div>
          {result.items.length > 0 ? (
            result.items.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/admin/ai-chats/${conversation.id}`}
                className="grid grid-cols-[160px_1fr_120px_120px] gap-4 border-b border-slate-800 px-4 py-4 text-sm hover:bg-slate-800/60"
              >
                <span className="text-slate-400">{formatDate(conversation.lastMessageAt)}</span>
                <span>
                  <span className="block font-semibold text-slate-100">
                    {conversation.firstQuestion || "Без первого вопроса"}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {conversation.id} · {conversation.language}
                    {conversation.pageContext ? ` · ${conversation.pageContext}` : ""}
                  </span>
                </span>
                <span className="text-slate-300">{conversation.messageCount}</span>
                <span className="space-x-1">
                  {conversation.hasError ? <span className="rounded bg-red-950 px-2 py-1 text-xs text-red-200">ошибка</span> : null}
                  {conversation.hasLeadForm ? <span className="rounded bg-emerald-950 px-2 py-1 text-xs text-emerald-200">форма</span> : null}
                  {!conversation.hasError && !conversation.hasLeadForm ? <span className="text-slate-500">обычный</span> : null}
                </span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-slate-400">Диалогов пока нет.</div>
          )}
        </div>

        <nav className="mt-5 flex items-center justify-between text-sm text-slate-300">
          <span>
            Всего: {result.total}. Страница {page} из {totalPages}.
          </span>
          <div className="space-x-2">
            {page > 1 ? (
              <Link className="rounded-md border border-slate-700 px-3 py-2 hover:bg-slate-900" href={`/admin/ai-chats?q=${encodeURIComponent(q)}&filter=${filter}&page=${page - 1}`}>
                Назад
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link className="rounded-md border border-slate-700 px-3 py-2 hover:bg-slate-900" href={`/admin/ai-chats?q=${encodeURIComponent(q)}&filter=${filter}&page=${page + 1}`}>
                Вперед
              </Link>
            ) : null}
          </div>
        </nav>
      </div>
    </main>
  );
}
