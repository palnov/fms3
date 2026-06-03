"use client";

import React, { useState } from "react";
import LeadForm from "@/components/forms/LeadForm";

interface ConsultationBannerProps {
  title?: string;
  description?: string;
  context?: string;
}

export default function ConsultationBanner({
  title = "Остались вопросы или нужна помощь?",
  description = "Оставьте заявку, и наш старший миграционный юрист бесплатно оценит вашу ситуацию и расскажет пошаговый план решения.",
  context = "Баннер в статье",
}: ConsultationBannerProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="my-8 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-slate-900 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-0">
            {description}
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all active:scale-95 whitespace-nowrap"
            >
              Отправить заявку юристу
            </button>
          ) : null}
        </div>
      </div>

      {showForm && (
        <div className="p-6 pt-0 sm:p-8 sm:pt-0 animate-in fade-in slide-in-from-top-4">
          <div className="max-w-xl mx-auto md:mx-0 w-full">
            <LeadForm sourceContext={context} />
          </div>
        </div>
      )}
    </div>
  );
}
