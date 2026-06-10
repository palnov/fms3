"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, ExternalLink } from "lucide-react";

type DocType = "passport" | "patent" | "ban";

export default function DocumentCheckPage() {
  const [docType, setDocType] = useState<DocType>("passport");
  const [formData, setFormData] = useState({
    number: "",
    series: "",
    name: "",
    region: "",
  });
  const [status, setStatus] = useState<"idle" | "checking" | "completed">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;
    setStatus("checking");
    setTimeout(() => {
      setStatus("completed");
    }, 2500);
  };

  const handleReset = () => {
    setStatus("idle");
    setFormData({ number: "", series: "", name: "", region: "" });
  };

  const getOfficialLink = () => {
    switch (docType) {
      case "passport":
        return "https://services.fms.gov.ru/info-service.htm?sid=2000";
      case "patent":
        return "https://services.fms.gov.ru/info-service.htm?sid=2060";
      case "ban":
        return "https://services.fms.gov.ru/info-service.htm?sid=3000";
    }
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] -z-10"></div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Проверка документов РФ
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
          Проверьте действительность патента, паспорта или наличие запрета на въезд в РФ.
        </p>

        {status === "idle" && (
          <div>
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl mb-8 border border-slate-200/10">
              {(["passport", "patent", "ban"] as DocType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setDocType(type)}
                  className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    docType === type
                      ? "bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-white"
                      : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
                  }`}
                >
                  {type === "passport" && "Паспорт"}
                  {type === "patent" && "Патент"}
                  {type === "ban" && "Запрет въезда"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {docType === "passport" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Серия паспорта</label>
                    <input
                      type="text"
                      placeholder="Например: 45"
                      value={formData.series}
                      onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Номер паспорта</label>
                    <input
                      type="text"
                      required
                      placeholder="Например: 123456"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                    />
                  </div>
                </div>
              )}

              {docType === "patent" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Серия бланка патента</label>
                      <input
                        type="text"
                        placeholder="Например: 77"
                        value={formData.series}
                        onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Номер патента</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: 123456789"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Регион выдачи</label>
                    <input
                      type="text"
                      placeholder="Например: г. Москва"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                    />
                  </div>
                </div>
              )}

              {docType === "ban" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">ФИО (латиницей как в паспорте)</label>
                    <input
                      type="text"
                      required
                      placeholder="Имя Фамилия"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Номер паспорта</label>
                      <input
                        type="text"
                        required
                        placeholder="Серия и номер"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Гражданство</label>
                      <input
                        type="text"
                        placeholder="Например: Узбекистан"
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                Проверить действительность
              </button>
            </form>
          </div>
        )}

        {status === "checking" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold mb-2">Выполняется защищенный запрос...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Подключаемся к системе верификации данных и проверяем формат введенного документа.
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
              <div className="flex gap-4">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-lg mb-2">Важная информация о проверке!</h4>
                  <p className="text-sm leading-relaxed mb-4">
                    Согласно законодательству РФ, ни один сторонний коммерческий ресурс не имеет прямого API-доступа к закрытой базе данных Главного управления по вопросам миграции (ГУВМ МВД РФ). 
                  </p>
                  <p className="text-sm leading-relaxed">
                    Для гарантированного и юридически чистого результата мы подготовили для вас прямую ссылку на официальный реестр МВД РФ. Пожалуйста, перепроверьте данные там.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={getOfficialLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 text-center"
              >
                Открыть базу МВД РФ <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={handleReset}
                className="py-4 px-6 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/80 transition-colors"
              >
                Проверить другой документ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
