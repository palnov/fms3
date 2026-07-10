"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Bot, User, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import SafeMessageText from "@/components/chat/SafeMessageText";
import LeadForm from "@/components/forms/LeadForm";
import { useAIChat } from "@/components/chat/AIChatProvider";

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
  isBottom,
}: ConsultationBannerProps) {
  // Auto-detect if it's the bottom banner by checking isBottom prop or if context has "Финальный"
  const isBottomBanner = isBottom || context.includes("Финальный");

  const [inputText, setInputText] = useState("");
  const [hasTriggeredWelcome, setHasTriggeredWelcome] = useState(false);
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");
  const { messages, isTyping, errorMsg, sendQuestion } = useAIChat();
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInputText("");
    await sendQuestion(text, { context });
  }, [context, sendQuestion]);

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

              setWelcomeText(`Привет! Отвечу на вопросы по теме «${cleanTitle}». Спросите меня ниже. Это бесплатно.`);
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

  const lastUserQuestion = [...messages].reverse().find((message) => message.sender === "user")?.text || "";

  // 1. TOP BANNER: Dark theme with a button that scrolls to the bottom chat
  if (!isBottomBanner) {
    return (
      <section data-toc-exclude className="my-8 overflow-hidden rounded-2xl border border-[#1f2c41] bg-[#1f2c41] p-5 text-white shadow-xl transition-all duration-300 sm:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ff8a8c]">
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
              className="button-primary inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#ff2e32] px-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#d92327] active:scale-95"
            >
              Задать вопрос <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 2. BOTTOM BANNER: Light theme with full inline chatbot
  return (
    <section 
      ref={bannerRef}
      data-toc-exclude
      className="bottom-banner-chat ym-hide-content my-12 overflow-hidden rounded-[2rem] border border-[#dfe8ff] bg-[#dfe9ff] p-4 text-[#1f2c41] shadow-[0_18px_48px_rgba(31,44,65,0.08)] transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(31,44,65,0.11)] sm:p-6"
    >
      {/* Header Info */}
      <div className="mb-5 rounded-[1.5rem] bg-white/55 px-4 py-4 backdrop-blur-sm sm:px-5">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#02629f] shadow-sm">
          <Bot className="h-3.5 w-3.5 text-[#02629f]" />
          Спросите ИИ
        </span>
        <h3 className="!m-0 !text-xl !font-bold !tracking-normal text-[#1f2c41] sm:!text-2xl">{title}</h3>
        <p className="!mb-0 !mt-3 !text-sm !leading-6 text-[#5f6e87]">{description}</p>
      </div>

      {/* Chat Messages Log */}
      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
          messages.length > 0 || welcomeText || isTypingWelcome
            ? "mb-5 grid-rows-[1fr] opacity-100"
            : "mb-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex max-h-[380px] flex-col gap-5 overflow-y-auto px-1 pr-2 transition-[max-height] duration-500 ease-out">
            {welcomeText && (
              <div data-motion-live className="flex w-full flex-col items-start">
                <div className="flex max-w-[88%] items-end gap-2.5 sm:max-w-[78%]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/75 bg-white text-[#02629f] shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-[1.55rem] rounded-bl-md bg-white/95 px-5 py-4 !text-sm !leading-6 text-[#4d5564] shadow-[0_10px_28px_rgba(89,111,160,0.10)]">
                    <p className="!m-0 min-h-[1.25rem] !max-w-none !text-sm !leading-6">{welcomeText}</p>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                data-motion-live
                className={`flex w-full flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`flex max-w-[88%] items-end gap-2.5 sm:max-w-[78%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/75 shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-[#02629f] text-white" 
                      : "bg-white text-[#02629f]"
                  }`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-[1.55rem] bg-white/95 px-5 py-4 !text-sm !leading-6 text-[#4d5564] shadow-[0_10px_28px_rgba(89,111,160,0.10)] ${
                    msg.sender === "user" ? "rounded-br-md" : "rounded-bl-md"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="!m-0 min-h-[1.25rem] !max-w-none !text-sm !leading-6">{msg.text}</p>
                    ) : (
                      <SafeMessageText
                        text={msg.text}
                        linkClassName="font-semibold text-[#02629f] underline underline-offset-2 transition-colors hover:text-[#014f82]"
                        paragraphClassName="!mb-1.5 min-h-[1.25rem] !max-w-none !text-sm !leading-6 last:!mb-0"
                      />
                    )}
                  </div>
                </div>
                <span className={`mt-1 text-[11px] font-semibold text-[#6f7890] ${msg.sender === "user" ? "mr-12" : "ml-12"}`}>
                  {msg.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.sender === "ai" && msg.suggestedReplies && msg.suggestedReplies.length > 0 && !msg.showLeadForm && (
                  <div className="ml-12 mt-2 flex max-w-[78%] flex-wrap gap-2">
                    {msg.suggestedReplies.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => handleSend(reply)}
                        disabled={isTyping || isTypingWelcome}
                        className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#02629f] shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                {msg.sender === "ai" && msg.showLeadForm && (
                  <div data-motion-live className="ml-12 mt-3 max-w-md rounded-[1.5rem] border border-white/85 bg-white/95 p-5 shadow-[0_10px_28px_rgba(89,111,160,0.12)]">
                    <div className="mb-2 flex items-center gap-2 text-[#ff2e32]">
                      <Sparkles className="h-4 w-4" />
                      <h4 className="!m-0 !text-sm !font-bold !text-[#1f2c41]">Можно сверить ситуацию с юристом</h4>
                    </div>
                    <p className="!mb-4 !mt-0 !text-xs !leading-5 !text-[#667287]">
                      Если есть срок, отказ, запрет или риск ошибки в документах, специалист бесплатно уточнит детали и подскажет следующий шаг.
                    </p>
                    <LeadForm sourceContext={context} defaultQuestion={lastUserQuestion} />
                  </div>
                )}
              </div>
            ))}

            {(isTyping || isTypingWelcome) && (
              <div data-motion-live className="flex w-full items-end gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/75 bg-white text-[#02629f] shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex min-h-14 items-center gap-1.5 rounded-[1.55rem] rounded-bl-md bg-white/95 px-5 py-4 shadow-[0_10px_28px_rgba(89,111,160,0.10)]" aria-label="ИИ печатает">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#667287]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#667287] [animation-delay:0.16s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#667287] [animation-delay:0.32s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div data-motion-live role="alert" aria-live="assertive" className="mb-3 flex items-center gap-2 rounded-xl border border-[#ff2e32]/20 bg-[#fff0f0] p-3 text-xs font-bold text-[#d92327]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="ym-disable-submit flex items-center gap-2 rounded-full bg-white/95 p-2 shadow-[0_10px_28px_rgba(89,111,160,0.12)]"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Спросите ИИ-помощника по теме статьи..."
          disabled={isTyping || isTypingWelcome}
          className="ym-disable-keys min-w-0 flex-grow rounded-full border-0 bg-transparent px-4 py-3 text-sm font-medium text-[#1f2c41] transition-all placeholder:text-[#6f7890] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTyping || isTypingWelcome || !inputText.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#4d5564] transition-colors hover:bg-[#edf2fd] hover:text-[#02629f] active:scale-95 disabled:opacity-45"
          aria-label="Отправить вопрос"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="!mb-0 !mt-2 text-center !text-[11px] !text-[#667287]">
        Сообщения обрабатываются по <Link href="/privacy" className="font-bold underline">правилам конфиденциальности</Link>.
      </p>
    </section>
  );
}
