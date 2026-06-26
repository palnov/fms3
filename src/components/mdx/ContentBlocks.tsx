"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Info,
  ChevronDown,
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
    <section className="content-callout content-callout-answer">
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
    <aside className="content-callout content-callout-source">
      <strong><BookOpenCheck aria-hidden="true" /> {title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <aside className="content-callout content-callout-notice">
      <strong><Info aria-hidden="true" /> Обратите внимание</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <aside className="content-callout content-callout-warning">
      <strong><AlertTriangle aria-hidden="true" /> Важно</strong>
      <div>{children}</div>
    </aside>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40 overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="p-4 pt-0 text-sm leading-relaxed text-slate-650 dark:text-slate-400">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="faq-list gap-3 grid mt-4 mb-6">
      {items.map((item) => (
        <FaqItem key={item.question} question={item.question} answer={item.answer} />
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
    <Link href={href} data-motion-card data-toc-exclude className="related-guide">
      <span><CheckCircle2 aria-hidden="true" /> Следующий шаг</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <span className="related-guide-link">Открыть инструкцию <ArrowRight aria-hidden="true" /></span>
    </Link>
  );
}

export function LinkCardGrid({
  items,
}: {
  items: Array<{ href: string; title: string; description: string; label?: string }>;
}) {
  return (
    <div className="link-card-grid" data-toc-exclude>
      {items.map((item) => (
        <Link key={item.href} href={item.href} data-motion-card className="link-card">
          {item.label ? <span>{item.label}</span> : null}
          <strong>{item.title}</strong>
          <p>{item.description}</p>
          <small>
            Перейти <ArrowRight aria-hidden="true" />
          </small>
        </Link>
      ))}
    </div>
  );
}
