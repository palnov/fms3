import Link from "next/link";

export default function CmsPreviewUnavailable() {
  return (
    <section className="site-container py-16 sm:py-24" role="status">
      <p className="section-kicker">Предпросмотр</p>
      <h1 className="display-title mt-4">Черновик пока недоступен</h1>
      <p className="mt-5 max-w-2xl text-slate-600">
        Страница ещё не сохранена или её адрес изменился. Сохраните черновик в CMS и откройте предпросмотр снова.
      </p>
      <Link className="button-secondary mt-8 inline-flex" href="/api/cms/preview/exit" prefetch={false}>Закрыть предпросмотр</Link>
    </section>
  );
}
