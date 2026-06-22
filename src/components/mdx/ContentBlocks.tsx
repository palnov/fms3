import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Info,
} from "lucide-react";

export function ArticleMeta({
  reviewed = "12 июня 2026 года",
  readingTime,
}: {
  reviewed?: string;
  readingTime: string;
}) {
  return (
    <div className="article-meta" aria-label="Информация о материале">
      <span><CalendarCheck aria-hidden="true" /> Проверено: <time>{reviewed}</time></span>
      <span><BookOpenCheck aria-hidden="true" /> {readingTime}</span>
    </div>
  );
}

export function QuickAnswer({ children }: { children: React.ReactNode }) {
  return (
    <section data-motion-card className="content-callout content-callout-answer">
      <strong>Короткий ответ</strong>
      <div>{children}</div>
    </section>
  );
}

export function LegalSource({
  title = "Правовое основание",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside data-motion-card className="content-callout content-callout-source">
      <strong><BookOpenCheck aria-hidden="true" /> {title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <aside data-motion-card className="content-callout content-callout-notice">
      <strong><Info aria-hidden="true" /> Обратите внимание</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <aside data-motion-card className="content-callout content-callout-warning">
      <strong><AlertTriangle aria-hidden="true" /> Важно</strong>
      <div>{children}</div>
    </aside>
  );
}

export function FaqAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div data-motion-stagger className="faq-list">
      {items.map((item) => (
        <details key={item.question} data-motion-card>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function RelatedGuide({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} data-motion-card className="related-guide">
      <span><CheckCircle2 aria-hidden="true" /> Следующий шаг</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <span className="related-guide-link">Открыть инструкцию <ArrowRight aria-hidden="true" /></span>
    </Link>
  );
}
