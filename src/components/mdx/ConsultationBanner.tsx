"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Bot, User, AlertCircle, ArrowRight } from "lucide-react";
import SafeMessageText from "@/components/chat/SafeMessageText";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

interface ConsultationBannerProps {
  title?: string;
  description?: string;
  context?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  isBottom?: boolean;
}

export default function ConsultationBanner({
  title = "Разберите свою ситуацию по материалам справочника",
  description = "Сначала задайте вопрос ИИ-помощнику. Он найдёт связанные инструкции и источники. Если потребуется индивидуальный анализ, можно оставить заявку специалисту.",
  context = "Баннер в статье",
  secondaryHref,
  secondaryLabel,
  isBottom,
}: ConsultationBannerProps) {
  // Auto-detect if it's the bottom banner by checking isBottom prop or if context has "Финальный"
  const isBottomBanner = isBottom || context.includes("Финальный");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const createMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `banner-msg-${messageIdRef.current}`;
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: createMessageId(),
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
        body: JSON.stringify({ question: text, language: "ru", context }),
      });

      const data = await response.json();

      if (response.ok) {
        const fullText = data.text;
        const msgId = createMessageId();

        const aiMsg: Message = {
          id: msgId,
          sender: "ai",
          text: "",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);

        const words = fullText.split(" ");
        let currentText = "";
        let wordIndex = 0;

        const interval = setInterval(() => {
          if (wordIndex < words.length) {
            currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: currentText } : m));
            wordIndex++;
          } else {
            clearInterval(interval);
          }
        }, 30);

      } else {
        const errorText = data.error || "Произошла ошибка при получении ответа.";
        if (response.status === 429) {
          const aiMsg: Message = {
            id: createMessageId(),
            sender: "ai",
            text: data.text || errorText,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          setErrorMsg(errorText);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ошибка сети. Пожалуйста, попробуйте снова.");
    } finally {
      setIsTyping(false);
    }
  }, [createMessageId, context]);

  const scrollToBottomChat = () => {
    const bottomChat = document.querySelector(".bottom-banner-chat");
    if (bottomChat) {
      bottomChat.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = bottomChat.querySelector("input");
      if (input) {
        setTimeout(() => input.focus(), 800);
      }
    }
  };

  // 1. TOP BANNER: Dark theme with a button that scrolls to the bottom chat
  if (!isBottomBanner) {
    return (
      <section className="my-8 overflow-hidden rounded-2xl bg-[#1f2c41] p-5 text-white sm:p-7 border border-slate-800 shadow-xl transition-all duration-300">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ff7b7e]">
              <Bot className="h-4 w-4" />
              Следующий шаг
            </span>
            <h3 className="!m-0 !text-xl !font-bold !text-white sm:!text-2xl">{title}</h3>
            <p className="!mb-0 !mt-3 !text-sm !leading-6 !text-slate-300">{description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col shrink-0">
            <button
              type="button"
              onClick={scrollToBottomChat}
              className="button-primary whitespace-nowrap inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors px-4 text-sm font-bold text-white shadow-md active:scale-95"
            >
              Задать вопрос <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. BOTTOM BANNER: Light theme with full inline chatbot
  const [hasTriggeredWelcome, setHasTriggeredWelcome] = useState(false);
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBottomBanner || hasTriggeredWelcome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasTriggeredWelcome(true);
          
          // Trigger typing animation after a short delay
          setTimeout(() => {
            setIsTypingWelcome(true);
            
            // Add message after typing delay
            setTimeout(() => {
              // Dynamically resolve page title (H1) or fallback to banner title
              const pageTitle = document.querySelector("h1")?.textContent || title;
              const cleanTitle = pageTitle.replace(/ в \d{4} году/g, "").trim();

              const welcomeMsg: Message = {
                id: "welcome-msg",
                sender: "ai",
                text: `Привет! Отвечу на любые вопросы по теме «${cleanTitle}». Спросите меня ниже. Это бесплатно.`,
                timestamp: new Date()
              };
              setMessages([welcomeMsg]);
              setIsTypingWelcome(false);
            }, 1400);
          }, 400);
        }
      },
      { threshold: 0.1 }
    );

    const currentBanner = bannerRef.current;
    if (currentBanner) {
      observer.observe(currentBanner);
    }

    return () => {
      if (currentBanner) {
        observer.unobserve(currentBanner);
      }
    };
  }, [isBottomBanner, hasTriggeredWelcome, title]);

  return (
    <section 
      ref={bannerRef}
      className="bottom-banner-chat my-12 overflow-hidden rounded-[2rem] bg-white border border-slate-200/70 p-6 text-slate-850 sm:p-8 shadow-[0_20px_50px_-20px_rgba(148,163,184,0.18)] hover:shadow-[0_25px_60px_-20px_rgba(148,163,184,0.25)] transition-all duration-500 relative"
    >
      {/* Premium background mesh gradients */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="border-b border-slate-100 pb-4 mb-4 relative z-10">
        <span className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600 bg-blue-50/80 border border-blue-100/50 px-3 py-1 rounded-full shadow-sm">
          <Bot className="h-3.5 w-3.5 animate-pulse text-blue-500" />
          Спросите ИИ
        </span>
        <h3 className="!m-0 !text-xl !font-bold text-slate-900 sm:!text-2xl tracking-tight">{title}</h3>
        <p className="!mb-0 !mt-3 !text-sm !leading-6 text-slate-500">{description}</p>
      </div>

      {/* Chat Messages Log */}
      {(messages.length > 0 || isTypingWelcome) && (
        <div className="max-h-[320px] overflow-y-auto mb-4 pr-2 space-y-4 flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] animate-message-appear ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user" 
                  ? "bg-slate-700 text-white" 
                  : "bg-blue-50 text-blue-600 border border-blue-100"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                  : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none shadow-sm"
              }`}>
                {msg.sender === "user" ? (
                  msg.text
                ) : (
                  <SafeMessageText
                    text={msg.text}
                    linkClassName="font-semibold text-blue-600 underline hover:text-blue-500 transition-colors"
                    paragraphClassName="mb-1.5 min-h-[1.25rem]"
                  />
                )}
              </div>
            </div>
          ))}

          {(isTyping || isTypingWelcome) && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-message-appear">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-2 relative z-10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex gap-2 relative z-10"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Спросите ИИ-помощника по теме статьи..."
          disabled={isTyping || isTypingWelcome}
          className="flex-grow px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-50 transition-all font-medium text-sm text-slate-800 placeholder-slate-400 shadow-sm"
        />
        <button
          type="submit"
          disabled={isTyping || isTypingWelcome || !inputText.trim()}
          className="w-12 h-12 rounded-xl bg-[#ff7b7e] hover:bg-[#ff8c90] disabled:bg-slate-200 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}

