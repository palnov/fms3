"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Sparkles, Shield, Bookmark } from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  sources?: string[];
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  "Как получить ВНЖ по браку в 2026 году?",
  "Сколько стоит патент на работу в Москве?",
  "Как проверить запрет на въезд в РФ?",
  "Можно ли получить ВНЖ без РВП?"
];

const ANSWERS: Record<string, { text: string; sources: string[] }> = {
  "Как получить ВНЖ по браку в 2026 году?": {
    text: "Для получения ВНЖ по браку в 2026 году необходимо, чтобы у вас был общий ребенок (рожденный или усыновленный в браке), либо предварительно получить РВП по браку и прожить по нему не менее 8 месяцев. Обратите внимание на изменения: брачные союзы без общих детей теперь подлежат более строгой проверке со стороны МВД РФ с целью выявления фиктивных браков.",
    sources: ["ФЗ-115 «О правовом положении иностранных граждан» ст. 8", "ФЗ-138 «О гражданстве РФ»"]
  },
  "Сколько стоит патент на работу в Москве?": {
    text: "В 2026 году ежемесячный авансовый платеж по патенту на работу в г. Москве и Московской области составляет 7 500 рублей. Оплачивать патент необходимо строго до даты его выдачи каждый месяц. Просрочка даже на 1 день аннулирует патент.",
    sources: ["Налоговый кодекс РФ ст. 227.1", "Закон г. Москвы № 29"]
  },
  "Как проверить запрет на въезд в РФ?": {
    text: "Официальная база ГУВМ МВД содержит списки лиц, которым не разрешен въезд. Проверку можно совершить на официальном сайте МВД РФ. Ни один сторонний сайт не имеет прямого онлайн-доступа к актуальной базе данных. Рекомендуем использовать наш раздел проверки документов для перехода на официальный сервис.",
    sources: ["Официальный сайт МВД РФ (services.fms.gov.ru)"]
  },
  "Можно ли получить ВНЖ без РВП?": {
    text: "Да, ВНЖ в обход РВП могут получить граждане Белоруссии, Молдовы, Казахстана, квалифицированные специалисты (по перечню Минтруда, отработавшие от 6 месяцев), выпускники российских вузов с красным дипломом, а также лица, чьи родители или дети имеют гражданство РФ и постоянно проживают в России.",
    sources: ["ФЗ-115 ст. 8, пункт 2"]
  }
};

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Здравствуйте! Я ваш ИИ-консультант по миграционным вопросам в Российской Федерации. Мои знания основаны на ФЗ-115, ФЗ-62 и ФЗ-138. Задайте свой вопрос или выберите одну из популярных тем ниже.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      // Find matching answer or generate default
      const match = Object.keys(ANSWERS).find(q => q.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(q.toLowerCase()));
      
      const aiResponse = match 
        ? ANSWERS[match] 
        : {
            text: "К сожалению, мой демонстрационный режим содержит ответы только на популярные предустановленные вопросы. В реальной версии RAG-система выполнит поиск по всей базе законов РФ с помощью эмбеддингов Google (text-multilingual-embedding-002) и сгенерирует подробный юридический ответ.",
            sources: ["ФЗ-115 «О правовом положении иностранных граждан»"]
          };

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiResponse.text,
        sources: aiResponse.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-8 md:py-12 flex flex-col h-[90vh]">
      <div className="mb-4 shrink-0">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="flex-grow glass rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-white/30 dark:bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Миграционный ИИ-Консультант</h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary-500" /> Подключен к ФЗ-115, ФЗ-62, ФЗ-138
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-bold tracking-widest px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full uppercase">
            RAG / Google Embeddings
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/20 dark:bg-slate-900/10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user" 
                  ? "bg-slate-800 text-white dark:bg-slate-700" 
                  : "bg-primary-500/10 text-primary-500"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-primary-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none text-slate-800 dark:text-slate-200"
                }`}>
                  {msg.text}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-500 font-bold px-1">
                    <Bookmark className="w-3 h-3 text-primary-500" /> Источники:
                    {msg.sources.map((src, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 border border-slate-200/20 text-slate-600 dark:text-slate-400">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-450 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-450 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-450 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Preset suggestions & input panel */}
        <div className="p-4 sm:p-6 border-t border-slate-200/50 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30 shrink-0">
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Часто задаваемые вопросы:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="py-2 px-3 rounded-lg text-xs font-bold text-left bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/10 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Спросите меня о патенте, ВНЖ, РВП или гражданстве..."
              className="flex-grow px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium text-sm text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              className="w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
