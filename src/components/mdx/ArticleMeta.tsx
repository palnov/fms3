import Link from "next/link";
import { BookOpenCheck, CalendarCheck } from "lucide-react";
import { articles } from "@/lib/articles";
import { getSiteOrigin } from "@/lib/runtime-config";

const MONTHS: Record<string, string> = {
  января: "01",
  февраля: "02",
  марта: "03",
  апреля: "04",
  мая: "05",
  июня: "06",
  июля: "07",
  августа: "08",
  сентября: "09",
  октября: "10",
  ноября: "11",
  декабря: "12",
};

function toIsoDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
  if (!match) return "2026-06-12";
  const [, day, month, year] = match;
  return `${year}-${MONTHS[month.toLowerCase()] ?? "01"}-${day.padStart(2, "0")}`;
}

function createBreadcrumbs(href: string, title: string, origin: string) {
  return [
    { "@type": "ListItem", position: 1, name: "Главная", item: origin },
    { "@type": "ListItem", position: 2, name: "Инструкции", item: `${origin}/pathways` },
    { "@type": "ListItem", position: 3, name: title, item: `${origin}${href}` },
  ];
}

export default function ArticleMeta({
  href,
  reviewed = "12 июня 2026 года",
  readingTime,
}: {
  href: string;
  reviewed?: string;
  readingTime: string;
}) {
  const article = articles.find((entry) => entry.href === href);
  const origin = getSiteOrigin();
  const url = `${origin}${href}`;
  const title = article?.title ?? "Миграционная инструкция";
  const description = article?.description ?? "Практическая инструкция по миграционным вопросам в России.";
  const dateModified = toIsoDate(reviewed);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        inLanguage: "ru-RU",
        dateModified,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "Редакция Миграционного справочника", url: origin },
        publisher: { "@type": "Organization", name: "Миграционный справочник", url: origin },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: createBreadcrumbs(href, title, origin),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="article-meta" aria-label="Информация о материале">
        <span><CalendarCheck aria-hidden="true" /> Проверено: <time dateTime={dateModified}>{reviewed}</time></span>
        <span><BookOpenCheck aria-hidden="true" /> {readingTime}</span>
        <span>Подготовлено <Link href="/editorial-policy">редакцией по официальным источникам</Link></span>
      </div>
    </>
  );
}
