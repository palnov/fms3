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
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousChatStateRef = useRef({ messageCount: messages.length, isTyping });
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousState = previousChatStateRef.current;
    const shouldScroll =
      messages.length > previousState.messageCount ||
      (isTyping && !previousState.isTyping);

    previousChatStateRef.current = { messageCount: messages.length, isTyping };

    if (!shouldScroll) return;

    const container = messagesContainerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages.length, isTyping]);

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
      <section data-toc-exclude className="article-next-step-banner my-8 overflow-hidden p-5 shadow-xl transition-all duration-300 sm:p-7">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <span className="article-next-step-label mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
              <Bot className="h-4 w-4" />
              Следующий шаг
            </span>
            <h3 className="article-next-step-title !m-0 !text-xl !font-bold sm:!text-2xl">{title}</h3>
            <p className="article-next-step-description !mb-0 !mt-3 !text-sm !leading-6">{description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col shrink-0">
            <button
              type="button"
              onClick={scrollToBottomChat}
              className="article-next-step-action inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap px-4 text-sm font-bold shadow-md transition-colors active:scale-95"
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
      className="article-chat-banner bottom-banner-chat ym-hide-content my-12 overflow-hidden p-4 transition-shadow duration-300 sm:p-6"
    >
      {/* Header Info */}
      <div className="article-chat-header mb-5 px-4 py-4 sm:px-5">
        <span className="article-chat-kicker mb-3 inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] shadow-sm">
          <Bot className="h-3.5 w-3.5" />
          Спросите ИИ
        </span>
        <h3 className="article-chat-title !m-0 !text-xl !font-bold !tracking-normal sm:!text-2xl">{title}</h3>
        <p className="article-chat-description !mb-0 !mt-3 !text-sm !leading-6">{description}</p>
      </div>

      {/* Chat Messages Log */}
      <div className="mb-5 grid grid-rows-[1fr] opacity-100">
        <div className="min-h-0 overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="article-chat-log flex max-h-[380px] flex-col gap-5 overflow-y-auto transition-[max-height] duration-500 ease-out"
          >
            {welcomeText && (
              <div data-motion-live className="flex w-full flex-col items-start">
                <div className="flex max-w-[88%] items-end gap-2.5 sm:max-w-[78%]">
                  <div className="article-chat-avatar article-chat-avatar-ai flex h-9 w-9 shrink-0 items-center justify-center shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="article-chat-bubble article-chat-bubble-ai px-5 py-4 !text-sm !leading-6">
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
                  <div className={`article-chat-avatar flex h-9 w-9 shrink-0 items-center justify-center shadow-sm ${
                    msg.sender === "user" 
                      ? "article-chat-avatar-user"
                      : "article-chat-avatar-ai"
                  }`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`article-chat-bubble px-5 py-4 !text-sm !leading-6 ${
                    msg.sender === "user" ? "article-chat-bubble-user" : "article-chat-bubble-ai"
                  }`}>
                    {msg.sender === "user" ? (
                      <p className="!m-0 min-h-[1.25rem] !max-w-none !text-sm !leading-6">{msg.text}</p>
                    ) : (
                      <SafeMessageText
                        text={msg.text}
                        linkClassName="article-chat-message-link font-semibold underline underline-offset-2 transition-colors"
                        paragraphClassName="!mb-1.5 min-h-[1.25rem] !max-w-none !text-sm !leading-6 last:!mb-0"
                      />
                    )}
                  </div>
                </div>
                <span className={`article-chat-timestamp mt-1 text-[11px] font-semibold ${msg.sender === "user" ? "mr-12" : "ml-12"}`}>
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
                        className="article-chat-suggestion px-3 py-1.5 text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                {msg.sender === "ai" && msg.showLeadForm && (
                  <div data-motion-live className="article-chat-lead-card ml-12 mt-3 max-w-md p-5">
                    <div className="article-chat-lead-kicker mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <h4 className="!m-0 !text-sm !font-bold">Можно сверить ситуацию с юристом</h4>
                    </div>
                    <p className="article-chat-lead-copy !mb-4 !mt-0 !text-xs !leading-5">
                      Если есть срок, отказ, запрет или риск ошибки в документах, специалист бесплатно уточнит детали и подскажет следующий шаг.
                    </p>
                    <LeadForm sourceContext={context} defaultQuestion={lastUserQuestion} />
                  </div>
                )}
              </div>
            ))}

            {(isTyping || isTypingWelcome) && (
              <div data-motion-live className="flex w-full items-end gap-2.5">
                <div className="article-chat-avatar article-chat-avatar-ai flex h-9 w-9 shrink-0 items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="article-chat-typing flex min-h-14 items-center gap-1.5 px-5 py-4" aria-label="ИИ печатает">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.16s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.32s]"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div data-motion-live role="alert" aria-live="assertive" className="article-chat-error mb-3 flex items-center gap-2 p-3 text-xs font-bold">
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
        className="article-chat-input-bar ym-disable-submit flex items-center gap-2 p-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Спросите ИИ-помощника по теме статьи..."
          disabled={isTyping || isTypingWelcome}
          className="article-chat-input-field ym-disable-keys min-w-0 flex-grow bg-transparent px-4 py-3 text-sm font-medium transition-all focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTyping || isTypingWelcome || !inputText.trim()}
          className="article-chat-send flex h-12 w-12 shrink-0 items-center justify-center transition-colors active:scale-95 disabled:opacity-45"
          aria-label="Отправить вопрос"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="article-chat-privacy !mb-0 !mt-2 text-center !text-[11px]">
        Сообщения обрабатываются по <Link href="/privacy" className="font-bold underline">правилам конфиденциальности</Link>.
      </p>
    </section>
  );
}
