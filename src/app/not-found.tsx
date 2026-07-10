import Link from "next/link";

export default function NotFound() {
  return (
    <section className="site-container flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#ff2e32]">Ошибка 404</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#1f2c41]">Страница не найдена</h1>
      <p className="mt-4 max-w-xl text-[#667287]">Адрес мог измениться или содержать ошибку. Откройте инструкции или вернитесь на главную.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/" className="button-primary">На главную</Link>
        <Link href="/pathways" className="button-secondary">Все инструкции</Link>
      </div>
    </section>
  );
}
