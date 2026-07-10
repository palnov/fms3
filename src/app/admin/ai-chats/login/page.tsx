export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const isRateLimited = params.error === "rate-limit";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold">Вход в админку</h1>
        <p className="mt-2 text-sm text-slate-400">Введите ADMIN_SECRET, чтобы открыть журнал диалогов ИИ-консультанта.</p>

        <form action="/admin/ai-chats/login/submit" method="post" className="ym-disable-submit mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Секрет</span>
            <input
              name="secret"
              type="password"
              autoComplete="current-password"
              className="ym-disable-keys mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
              required
            />
          </label>

          {hasError ? (
            <p className="rounded-md border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200">
              Неверный секрет.
            </p>
          ) : null}
          {isRateLimited ? (
            <p role="alert" className="rounded-md border border-amber-900 bg-amber-950 px-3 py-2 text-sm text-amber-200">
              Слишком много неудачных попыток. Попробуйте позже.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Войти
          </button>
        </form>
      </div>
    </main>
  );
}
