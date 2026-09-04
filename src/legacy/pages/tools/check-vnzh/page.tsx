"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink, Calendar, ChevronDown } from "lucide-react";

export default function CheckVnzhPage() {
  const [formData, setFormData] = useState({
    region: "",
    birthDate: "",
    docNumber: "",
  });
  const [status, setStatus] = useState<"idle" | "checking" | "completed">("idle");
  const [result, setResult] = useState<{
    status: "ready" | "pending" | "not_found";
    message: string;
    date: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.docNumber || !formData.region) return;
    
    setStatus("checking");
    
    setTimeout(() => {
      // Semi-random based on inputs
      const combined = (formData.docNumber + formData.birthDate).toLowerCase();
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const mod = Math.abs(hash) % 3;
      const today = new Date().toLocaleDateString("ru-RU");
      
      if (mod === 0) {
        setResult({
          status: "ready",
          message: "Вид на жительство готов к выдаче. Уполномоченным органом ГУВМ МВД РФ вынесено положительное решение. Пожалуйста, посетите ведомство с паспортом для получения документа.",
          date: today,
        });
      } else if (mod === 1) {
        setResult({
          status: "pending",
          message: "Документы находятся на рассмотрении инспектором. Общий срок рассмотрения заявления на ВНЖ составляет 4 месяца (для некоторых категорий граждан — от 15 дней до 3 месяцев).",
          date: today,
        });
      } else {
        setResult({
          status: "not_found",
          message: "Данные о готовности ВНЖ в системе не обнаружены. Если вы подали документы недавно, сведения могут отобразиться позже.",
          date: today,
        });
      }
      
      setStatus("completed");
    }, 2000);
  };

  const handleReset = () => {
    setStatus("idle");
    setResult(null);
    setFormData({ region: "", birthDate: "", docNumber: "" });
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
          Проверка готовности ВНЖ
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
          Онлайн-симулятор для верификации готовности Вида на жительство (ВНЖ) в РФ.
        </p>

        {status === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vnzh-region" className="block text-xs font-bold text-slate-500 mb-2 uppercase">Регион подачи</label>
                <div className="relative">
                  <select id="vnzh-region" name="region"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-[#1f2c41] dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="" className="text-slate-400">Выберите регион...</option>
                    <option value="77">г. Москва</option>
                    <option value="50">Московская область</option>
                    <option value="78">г. Санкт-Петербург</option>
                    <option value="47">Ленинградская область</option>
                    <option value="23">Краснодарский край</option>
                    <option value="54">Новосибирская область</option>
                    <option value="66">Свердловская область</option>
                    <option value="other">Другой регион РФ</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="vnzh-birth-date" className="block text-xs font-bold text-slate-500 mb-2 uppercase">Дата рождения</label>
                <input id="vnzh-birth-date" name="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="ym-disable-keys w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-[#1f2c41] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vnzh-document" className="block text-xs font-bold text-slate-500 mb-2 uppercase">Номер документа (паспорта)</label>
              <input id="vnzh-document" name="documentNumber"
                type="text"
                required
                placeholder="Цифры загранпаспорта, по которому подавалось заявление"
                value={formData.docNumber}
                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                className="ym-disable-keys w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-[#1f2c41] dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Запросить сведения
            </button>
          </form>
        )}

        {status === "checking" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2 text-[#1f2c41] dark:text-white">Поиск записи в реестре ВНЖ ГУВМ МВД...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Идет сверка с архивом принятых решений о выдаче видов на жительство.
            </p>
          </div>
        )}

        {status === "completed" && result && (
          <div className="space-y-8 animate-fade-in">
            <div className={`p-6 rounded-2xl border ${
              result.status === "ready" 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                : result.status === "pending"
                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40 text-blue-800 dark:text-blue-300"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300"
            }`}>
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-xl mb-2">
                    {result.status === "ready" && "Решение принято!"}
                    {result.status === "pending" && "Заявление рассматривается"}
                    {result.status === "not_found" && "Решение еще не занесено в реестр"}
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
                  <h4 className="font-extrabold text-lg mb-2">Обратите внимание!</h4>
                  <p className="text-sm leading-relaxed mb-3">
                    Данный инструмент является симулятором. Официальная и на 100% достоверная информация о готовности ВНЖ находится исключительно в ведении МВД РФ.
                  </p>
                  <p className="text-sm leading-relaxed">
                    Для точной проверки рекомендуем перейти на официальный информационный сервис ГУВМ МВД России.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://гувм.мвд.рф/services/residence"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 text-center"
              >
                Проверить на сайте МВД РФ <ExternalLink className="w-4 h-4" />
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
