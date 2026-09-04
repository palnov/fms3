import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Карта сайта",
  description: "Все инструкции и сервисы Миграционного справочника: ВНЖ, РВП, гражданство, работа, проверки и миграционные риски.",
  alternates: { canonical: "/karta-sayta" },
};

const tools = [
  ["/tools/ai-consultant", "ИИ-консультант по миграции"],
  ["/tools/path-finder", "Подбор пути легализации"],
  ["/tools/checklist-generator", "Чек-листы документов"],
  ["/tools/calculators", "Миграционные калькуляторы"],
  ["/tools/check-rvp", "Проверка готовности РВП"],
  ["/tools/check-vnzh", "Проверка готовности ВНЖ"],
  ["/tools/check-citizenship", "Проверка готовности гражданства"],
  ["/tools/check-patent", "Проверка готовности патента"],
] as const;

export default function SitemapPage() {
  return (
    <div className="site-container public-index-page py-12 sm:py-20">
      <p className="section-kicker">Навигация</p>
      <h1 className="display-title mt-4">Карта сайта</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[#667287]">
        Все опубликованные инструкции и практические сервисы. Для начала откройте <Link className="font-bold text-[#2d5145]" href="/pathways">раздел документов и статусов</Link>.
      </p>

      <section className="mt-10">
        <h2 className="section-title">Инструкции</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.href} href={article.href} className="surface-card p-5">
              <strong className="block text-base">{article.title}</strong>
              <span className="mt-2 block text-sm leading-6 text-[#667287]">{article.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-title">Сервисы</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(([href, title]) => (
            <Link key={href} href={href} className="surface-card p-5 font-bold text-[#2d5145]">{title}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
