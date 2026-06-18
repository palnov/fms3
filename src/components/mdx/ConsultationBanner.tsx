"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Scale } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

interface ConsultationBannerProps {
  title?: string;
  description?: string;
  context?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function ConsultationBanner({
  title = "Разберите свою ситуацию по материалам справочника",
  description = "Сначала задайте вопрос ИИ-помощнику. Он найдёт связанные инструкции и источники. Если потребуется индивидуальный анализ, можно оставить заявку специалисту.",
  context = "Баннер в статье",
  secondaryHref,
  secondaryLabel,
}: ConsultationBannerProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="my-8 overflow-hidden rounded-2xl bg-[#1f2c41] p-5 text-white sm:p-7">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ff7b7e]">
            <Bot className="h-4 w-4" />
            Следующий шаг
          </span>
          <h3 className="!m-0 !text-xl !font-bold !text-white sm:!text-2xl">{title}</h3>
          <p className="!mb-0 !mt-3 !text-sm !leading-6 !text-slate-300">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <Link href="/tools/ai-consultant" className="button-primary whitespace-nowrap">
            Задать вопрос <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10"
            >
              <Scale className="h-4 w-4" />
              Нужен специалист
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl bg-white p-4 text-[#1f2c41] sm:p-6">
          <LeadForm sourceContext={context} />
        </div>
      )}
    </section>
  );
}
