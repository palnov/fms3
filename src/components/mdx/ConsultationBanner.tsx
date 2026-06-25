"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, AlertCircle, Sparkles } from "lucide-react";
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
}

export default function ConsultationBanner({
  title = "Разберите свою ситуацию по материалам справочника",
  description = "Сначала задайте вопрос ИИ-помощнику. Он найдёт связанные инструкции и источники. Если потребуется индивидуальный анализ, можно оставить заявку специалисту.",
  context = "Баннер в статье",
}: ConsultationBannerProps) {
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

  return (
    <section className="my-8 overflow-hidden rounded-2xl bg-[#1f2c41] p-5 text-white sm:p-7 border border-slate-800 shadow-xl transition-all duration-300">
      {/* Header Info */}
      <div className="border-b border-white/10 pb-4 mb-4">
        <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ff7b7e]">
          <Bot className="h-4 w-4" />
          Следующий шаг
        </span>
        <h3 className="!m-0 !text-xl !font-bold !text-white sm:!text-2xl">{title}</h3>
        {messages.length === 0 && (
          <p className="!mb-0 !mt-3 !text-sm !leading-6 !text-slate-350">{description}</p>
        )}
      </div>

      {/* Chat Messages Log */}
      {messages.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto mb-4 pr-2 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user" 
                  ? "bg-slate-700 text-white" 
                  : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white/5 border border-white/10 text-slate-100 rounded-tl-none"
              }`}>
                {msg.sender === "user" ? (
                  msg.text
                ) : (
                  <SafeMessageText
                    text={msg.text}
                    linkClassName="font-semibold text-blue-400 underline hover:text-blue-300 transition-colors"
                    paragraphClassName="mb-1.5 min-h-[1.25rem]"
                  />
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-1.5">
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
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
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
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Спросите ИИ-помощника по теме статьи..."
          disabled={isTyping}
          className="flex-grow px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors font-medium text-sm text-white placeholder-slate-400 shadow-inner"
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="w-11 h-11 rounded-xl bg-[#ff7b7e] hover:bg-[#ff8c90] disabled:bg-slate-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-lg active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}

