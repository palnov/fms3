"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="site-container flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#ff2e32]">Ошибка</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#1f2c41]">Не удалось открыть раздел</h1>
      <p className="mt-4 max-w-xl text-[#667287]">Попробуйте повторить запрос. Если ошибка сохраняется, вернитесь позже.</p>
      <button type="button" className="button-primary mt-7" onClick={reset}>Попробовать снова</button>
    </section>
  );
}
