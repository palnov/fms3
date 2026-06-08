"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Phone, Sparkles } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  showLeadForm?: boolean;
}

const PARTNER_PHONE = process.env.NEXT_PUBLIC_PARTNER_PHONE || "8 (800) 350-84-13";

export default function FloatingLawyerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Здравствуйте! Я ИИ-помощник по миграционным вопросам. Могу помочь найти информацию по РВП, ВНЖ, гражданству или выдать нужные бланки. Задайте свой вопрос!"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const text = inputVal;
    setInputVal("");

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "ai",
            text: data.text,
            showLeadForm: data.showLeadForm
          }
        ]);
      } else {
        const errorText = data.text || data.error || "Произошла ошибка при отправке запроса.";
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "ai",
            text: errorText,
            showLeadForm: data.showLeadForm || response.status === 429
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "ai",
          text: "Ошибка сети. Пожалуйста, проверьте интернет-соединение."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let formatted = line;
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">$1</a>');
      return (
        <p
          key={idx}
          className="min-h-[1.1rem] mb-1"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 hover:scale-105 transition-all z-50 flex items-center justify-center ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        aria-label="Задать вопрос ИИ"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:bottom-6 sm:right-6 sm:p-0 bg-black/50 sm:bg-transparent">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:w-[380px] h-[85vh] sm:h-[550px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-slate-800/90 backdrop-blur border-b border-slate-700/60 p-3.5 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center relative shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-slate-800"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">ИИ-консультант (Дежурный)</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Онлайн
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Partner Hotline Number */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/40 border border-slate-700/30 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <span>Горячая линия:</span>
                <a href={`tel:${PARTNER_PHONE.replace(/\D/g, "")}`} className="hover:text-white underline text-emerald-400 font-bold ml-auto">
                  {PARTNER_PHONE}
                </a>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/20">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      msg.sender === "user" ? "bg-slate-700 text-white" : "bg-blue-600/10 text-blue-400 border border-blue-500/10"
                    }`}>
                      {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}>
                      {msg.sender === "user" ? msg.text : formatMessageText(msg.text)}
                    </div>
                  </div>

                  {/* Inline Lead Form */}
                  {msg.sender === "ai" && msg.showLeadForm && (
                    <div className="ml-9 p-4 bg-slate-900/90 border border-slate-800 rounded-xl max-w-[85%] space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>Бесплатная экспресс-помощь юриста</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        Оставьте контакты, и дежурный специалист бесплатно перезвонит вам для разбора ситуации.
                      </p>
                      <LeadForm 
                        sourceContext="Виджет ИИ-чатбота" 
                        defaultQuestion={messages[messages.length - 2]?.text || ""}
                        onSuccess={() => setTimeout(() => setIsOpen(false), 4000)}
                      />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Спросите ИИ-ассистента..."
                disabled={isTyping}
                className="flex-grow px-3 py-2 text-xs rounded-lg border border-slate-800 bg-slate-950 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={isTyping || !inputVal.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
