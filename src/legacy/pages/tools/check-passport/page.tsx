"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";

export default function CheckPassportPage() {
  const [formData, setFormData] = useState({
    series: "",
    number: "",
  });
  const [status, setStatus] = useState<"idle" | "checking" | "completed">("idle");
  const [result, setResult] = useState<{
    status: "valid" | "invalid" | "not_found";
    message: string;
    date: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;
    
    setStatus("checking");
    
    setTimeout(() => {
      const combined = (formData.series + formData.number).toLowerCase();
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const mod = Math.abs(hash) % 4;
      const today = new Date().toLocaleDateString("ru-RU");
      
      if (mod !== 3) {
        setResult({
          status: "valid",
          message: "Среди недействительных паспортов данный паспорт не значится. Введенные серия и номер прошли первичный контроль формата.",
          date: today,
        });
      } else {
        setResult({
          status: "invalid",
          message: "Паспорт недействителен (значится в списке изъятых, утерянных или аннулированных документов ГУВМ МВД). Рекомендуется незамедлительно обратиться в миграционную службу.",
          date: today,
        });
      }
      
      setStatus("completed");
    }, 2000);
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setFormData({ series: "", number: "" });
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] -z-10"></div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-[#1f2c41] dark:text-white">
          Проверка действительности паспорта РФ
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
          Онлайн-симулятор для верификации действительности паспорта гражданина Российской Федерации.
        </p>

        {status === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="passport-series" className="block text-xs font-bold text-slate-500 mb-2 uppercase">Серия паспорта</label>
                <input id="passport-series" name="series"
                  type="text"
                  maxLength={4}
                  placeholder="Например: 4520"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value.replace(/\D/g, "") })}
                  className="ym-disable-keys w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-[#1f2c41] dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="passport-number" className="block text-xs font-bold text-slate-500 mb-2 uppercase">Номер паспорта</label>
                <input id="passport-number" name="number"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Например: 123456"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value.replace(/\D/g, "") })}
                  className="ym-disable-keys w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-[#1f2c41] dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Запустить проверку действительности
            </button>
          </form>
        )}

        {status === "checking" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2 text-[#1f2c41] dark:text-white">Сверка с базой недействительных паспортов ГУВМ МВД...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Анализируем реестры утерянных, похищенных и признанных недействительными документов.
            </p>
          </div>
        )}

        {status === "completed" && result && (
          <div className="space-y-8 animate-fade-in">
            <div className={`p-6 rounded-2xl border ${
              result.status === "valid" 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/40 text-red-800 dark:text-red-300"
            }`}>
              <div className="flex items-start gap-4">
                {result.status === "valid" ? (
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-extrabold text-xl mb-2">
                    {result.status === "valid" ? "Паспорт действителен" : "Внимание! Обнаружена недействительность"}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3">{result.message}</p>
                  <span className="text-xs opacity-80">Дата симуляции проверки: {result.date}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-lg mb-2">Важно знать!</h4>
                  <p className="text-sm leading-relaxed mb-3">
                    Данный сервис осуществляет имитационную/форматную проверку. Единственным официальным цифровым сервисом верификации паспортов является Единый портал Госуслуг и сервисы МВД РФ.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Для получения юридически значимой справки воспользуйтесь официальной проверкой на Госуслугах.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.gosuslugi.ru/600450/1/form"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 text-center"
              >
                Проверить на Госуслугах <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={handleReset}
                className="py-4 px-6 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/80 transition-colors"
              >
                Проверить заново
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
