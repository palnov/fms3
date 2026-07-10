"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface LeadFormProps {
  defaultQuestion?: string;
  sourceContext?: string;
  onSuccess?: () => void;
  variant?: "light" | "dark";
}

export default function LeadForm({
  defaultQuestion = "",
  sourceContext = "Прямое обращение",
  onSuccess,
  variant = "light",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState(defaultQuestion);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fieldId = useId();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, question: `[${sourceContext}] ${question}`, company, privacyConsent: true }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Не удалось отправить заявку.");
      }

      setStatus("success");
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ошибка сети. Попробуйте ещё раз.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-emerald-600" />
        <h3 className="!m-0 !text-lg !font-bold !text-[#1f2c41]">Заявка отправлена</h3>
        <p className="!mb-0 !mt-2 !text-sm !text-[#667287]">Специалист свяжется с вами по указанному номеру.</p>
      </div>
    );
  }

  const isDark = variant === "dark";
  const labelClass = isDark ? "text-sm font-bold text-slate-200" : "text-sm font-bold text-[#1f2c41]";
  const consentClass = isDark ? "!m-0 !text-xs !leading-5 !text-slate-400" : "!m-0 !text-xs !leading-5 !text-[#7b8799]";
  const fieldClass = isDark
    ? "mt-1.5 w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-base text-[#1f2c41] placeholder:text-[#8a95a5] focus:border-[#7db7ff] focus:bg-white"
    : "mt-1.5 w-full rounded-xl border border-[#d8dee7] bg-[#f4f6fa] px-4 py-3 text-base text-[#1f2c41] placeholder:text-[#8a95a5] focus:border-[#02629f] focus:bg-white";

  return (
    <form onSubmit={handleSubmit} className="ym-disable-submit grid gap-4">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        className="ym-disable-keys hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass} htmlFor={`${fieldId}-name`}>
          Имя
          <input id={`${fieldId}-name`} name="name" autoComplete="name" className={`ym-disable-keys ${fieldClass}`} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Как к вам обращаться" />
        </label>
        <label className={labelClass} htmlFor={`${fieldId}-phone`}>
          Телефон
          <input id={`${fieldId}-phone`} name="phone" autoComplete="tel" className={`ym-disable-keys ${fieldClass}`} type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+7 999 123-45-67" />
        </label>
      </div>
      <label className={labelClass} htmlFor={`${fieldId}-question`}>
        Вопрос
        <textarea id={`${fieldId}-question`} name="question" className={`ym-disable-keys ${fieldClass} min-h-28 resize-y`} required value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Кратко опишите ситуацию" />
      </label>

      <label className={`flex items-start gap-2 ${consentClass}`}>
        <input type="checkbox" name="privacyConsent" required className="mt-1 h-4 w-4 shrink-0 accent-[#02629f]" />
        <span>Я согласен с обработкой данных на условиях <Link href="/privacy" className="font-bold underline">политики конфиденциальности</Link>.</span>
      </label>

      {status === "error" && (
        <div role="alert" aria-live="assertive" className="flex gap-2 rounded-xl bg-[#fff0f0] p-3 text-sm text-[#9b272a]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button type="submit" disabled={status === "loading"} className="button-primary disabled:cursor-not-allowed disabled:opacity-60">
        {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
        Отправить вопрос специалисту
      </button>
    </form>
  );
}
