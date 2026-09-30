export function ConsultationBannerPreview({
  title,
  description,
  isBottom,
}: {
  title: string;
  description: string;
  isBottom: boolean;
}) {
  return (
    <section className={(isBottom ? "article-chat-banner" : "article-next-step-banner") + " my-8 p-5 sm:p-7"}>
      <h3 className="!m-0 !text-xl !font-bold">{title}</h3>
      <p className="!mb-0 !mt-3 !text-sm !leading-6">{description}</p>
      <p className="!mb-0 !mt-4 text-xs font-semibold opacity-75">Отправка сообщений и заявок отключена в предпросмотре.</p>
    </section>
  );
}
