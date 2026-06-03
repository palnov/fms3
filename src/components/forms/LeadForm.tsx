"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface LeadFormProps {
  defaultQuestion?: string;
  sourceContext?: string;
  onSuccess?: () => void;
}

export default function LeadForm({
  defaultQuestion = "",
  sourceContext = "Прямое обращение",
  onSuccess,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState(defaultQuestion);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          question: `[${sourceContext}] ${question}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Произошла ошибка при отправке.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Ошибка сети. Попробуйте еще раз.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-green-500/10 border border-green-500/20 rounded-xl">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Заявка успешно отправлена!</h3>
        <p className="text-sm text-gray-400">
          Юрист скоро свяжется с вами по указанному номеру для проведения консультации.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="name">
          Ваше Имя
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Иван Иванов"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="phone">
          Ваш Телефон
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="7 999 123 45 67"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Обязательно 11 цифр, начиная с 7.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="question">
          Суть вопроса
        </label>
        <textarea
          id="question"
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Опишите вашу ситуацию (например: хочу узнать как получить ВНЖ по профессии...)"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-500 min-h-[100px] resize-y transition-all"
        />
      </div>

      {status === "error" && (
        <div className="flex items-start gap-2 p-3 text-red-400 bg-red-500/10 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {status === "loading" && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>Получить консультацию бесплатно</span>
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}
