"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Sparkles, Shield, Bookmark, AlertCircle, RefreshCw } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  sources?: string[];
  showLeadForm?: boolean;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  "Как получить ВНЖ по браку в 2026 году?",
  "Сколько стоит патент на работу в Москве?",
  "Как проверить запрет на въезд в РФ?",
  "Можно ли получить ВНЖ без РВП?"
];

export default function AIConsultantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Здравствуйте! Я ваш ИИ-консультант по миграционным вопросам в Российской Федерации. Мои знания основаны на официальных законах (ФЗ-115, ФЗ-62) и актуальных правилах МВД. Задайте свой вопрос или выберите одну из популярных тем ниже.",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Read initial limits if available
  useEffect(() => {
    // Basic local tracking as fallback
    const localLimit = localStorage.getItem("ai_requests_left");
    if (localLimit !== null) {
      setRemainingRequests(parseInt(localLimit, 10));
    } else {
      setRemainingRequests(20);
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMsg: Message = {
          id: Math.random().toString(),
          sender: "ai",
          text: data.text,
          sources: data.sources,
          showLeadForm: data.showLeadForm,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        if (data.remainingRequests !== undefined) {
          setRemainingRequests(data.remainingRequests);
          localStorage.setItem("ai_requests_left", data.remainingRequests.toString());
        }
      } else {
        // Handle rate limits or other issues
        const errorText = data.error || "Произошла ошибка при получении ответа.";
        
        if (response.status === 429) {
          const aiMsg: Message = {
            id: Math.random().toString(),
            sender: "ai",
            text: data.text || errorText,
            showLeadForm: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMsg]);
          setRemainingRequests(0);
          localStorage.setItem("ai_requests_left", "0");
        } else {
          setErrorMsg(errorText);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ошибка сети. Пожалуйста, проверьте интернет-соединение и попробуйте снова.");
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to safely render simple markdown
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let formatted = line;
      // Bold Markdown **text**
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Markdown Links [text](url)
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline font-semibold transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
      
      return (
        <p
          key={idx}
          className="min-h-[1.25rem] mb-1.5"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col h-[90vh]">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
        {remainingRequests !== null && (
          <span className="text-xs text-slate-500 font-bold">
            Осталось бесплатных вопросов: <span className={`${remainingRequests <= 5 ? "text-amber-500" : "text-emerald-500"}`}>{remainingRequests} / 20</span>
          </span>
        )}
      </div>

      <div className="flex-grow bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col overflow-hidden relative shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white">Миграционный ИИ-Консультант</h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" /> Подключен к ФЗ-115, ФЗ-62 и шаблонам МВД
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-bold tracking-widest px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full uppercase">
            RAG / SQLite
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6 bg-slate-50/20 dark:bg-slate-950/10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user" 
                  ? "bg-slate-800 text-white dark:bg-slate-700" 
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className="space-y-3 w-full">
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10"
                    : "bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none text-slate-800 dark:text-slate-200 shadow-sm"
                }`}>
                  {msg.sender === "user" ? msg.text : formatMessageText(msg.text)}
                </div>

                {/* Inline Lead Form Card */}
                {msg.sender === "ai" && msg.showLeadForm && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner max-w-md animate-in fade-in-50 duration-300">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <h4 className="text-sm font-bold text-white">Бесплатная экспресс-помощь юриста</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 font-medium leading-relaxed">
                      Законы меняются, а ошибки в заполнении могут привести к отказу. Заполните форму, и дежурный юрист бесплатно перепроверит ваши документы.
                    </p>
                    <LeadForm 
                      sourceContext="AI Чат-бот" 
                      defaultQuestion={messages[messages.length - 2]?.text || ""}
                    />
                  </div>
                )}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-500 font-bold px-1">
                    <Bookmark className="w-3 h-3 text-blue-500" /> Источники:
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
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Error panel */}
        {errorMsg && (
          <div className="px-5 py-3 bg-red-500/10 border-t border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preset suggestions & input panel */}
        <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Часто задаваемые вопросы:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="py-2 px-3 rounded-lg text-xs font-bold text-left bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 transition-colors cursor-pointer"
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
              placeholder={remainingRequests === 0 ? "Вы исчерпали лимит вопросов..." : "Спросите о патенте, ВНЖ, РВП или гражданстве..."}
              disabled={remainingRequests === 0 || isTyping}
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors font-medium text-sm text-slate-800 dark:text-slate-100 shadow-inner"
            />
            <button
              type="submit"
              disabled={remainingRequests === 0 || isTyping || !inputText.trim()}
              className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
