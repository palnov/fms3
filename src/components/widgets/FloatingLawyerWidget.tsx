"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Bot, User, Phone, Sparkles } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import SafeMessageText from "@/components/chat/SafeMessageText";
import { useAIChat } from "@/components/chat/AIChatProvider";
import { getPhoneHref, PARTNER_PHONE } from "@/lib/contact";

const LANGUAGES = [
  { code: "ru", name: "Русский" },
  { code: "tg", name: "Тоҷикӣ" },
  { code: "uz", name: "O'zbekcha" },
  { code: "ro", name: "Română" },
  { code: "kk", name: "Қазақша" },
  { code: "en", name: "English" },
];

const TRANSLATIONS: Record<string, {
  welcome: string;
  placeholder: string;
  assistantTitle: string;
  online: string;
  hotline: string;
  lawyerTitle: string;
  lawyerText: string;
}> = {
  ru: {
    welcome: "Здравствуйте! Я ИИ-помощник по миграционным вопросам. Могу помочь найти информацию по РВП, ВНЖ, гражданству или выдать нужные бланки. Задайте свой вопрос!",
    placeholder: "Спросите ИИ-ассистента...",
    assistantTitle: "ИИ-консультант",
    online: "Онлайн",
    hotline: "Горячая линия:",
    lawyerTitle: "Бесплатная экспресс-помощь юриста",
    lawyerText: "Оставьте контакты, и специалист бесплатно перезвонит вам для разбора ситуации.",
  },
  tg: {
    welcome: "Салом! Ман ёвари СУ оид ба масъалаҳои муҳоҷират ҳастам. Ман метавонам дар ёфтани маълумот дар бораи РВП, ВНЖ, шаҳрвандӣ ё додани варақаҳои зарурӣ кӯмак кунам. Саволи худро диҳед!",
    placeholder: "Аз ёвари СУ пурсед...",
    assistantTitle: "Ёвари СУ",
    online: "Онлайн",
    hotline: "Хати мустақим:",
    lawyerTitle: "Ёрии таъҷилии ройгони ҳуқуқшинос",
    lawyerText: "Тамосҳои худро гузоред, ва мутахассис барои таҳлили вазъият ба шумо ройгон занг мезанад.",
  },
  uz: {
    welcome: "Salom! Men migratsiya masalalari bo'yicha sun'iy intellekt yordamchisiman. RVP, VNJ, fuqarolik bo'yicha ma'lumot topishga yoki kerakli shakllarni berishga yordam bera olaman. Savolingizni bering!",
    placeholder: "AI yordamchisidan so'rang...",
    assistantTitle: "AI-maslahatchi",
    online: "Onlayn",
    hotline: "Ishonch telefoni:",
    lawyerTitle: "Bepul tezkor huquqiy yordam",
    lawyerText: "Kontaktlaringizni qoldiring, va mutaxassis vaziyatni tahlil qilish uchun sizga bepul qo'ng'iroq qiladi.",
  },
  ro: {
    welcome: "Bună ziua! Sunt asistentul dumneavoastră AI pentru probleme de migrație. Vă pot ajuta să găsiți informații despre RVP, permis de ședere, cetățenie sau să vă ofer formularele necesare. Puneți o întrebare!",
    placeholder: "Întrebați asistentul AI...",
    assistantTitle: "Consultant AI",
    online: "Online",
    hotline: "Linie fierbinte:",
    lawyerTitle: "Asistență juridică gratuită",
    lawyerText: "Lăsați datele de contact, iar un specialist vă va suna gratuit pentru a analiza situația.",
  },
  kk: {
    welcome: "Сәлеметсіз бе! Мен көші-қон мәселелері бойынша ИИ-көмекшімін. РВП, ВНЖ, азаматтық туралы ақпарат табуға немесе қажетті бланкілерді беруге көмектесе аламын. Сұрағыңызды қойыңыз!",
    placeholder: "ИИ-ассистенттен сұраңыз...",
    assistantTitle: "ИИ-кеңесші",
    online: "Онлайн",
    hotline: "Желілік байланыс:",
    lawyerTitle: "Заңгердің тегін шұғыл көмегі",
    lawyerText: "Байланыс мәліметтерін қалдырыңыз, маман сізге жағдайды талдау үшін тегін хабарласады.",
  },
  en: {
    welcome: "Hello! I am your AI assistant for migration issues. I can help you find information on TRP, residence permit, citizenship, or provide the necessary forms. Ask your question!",
    placeholder: "Ask the AI assistant...",
    assistantTitle: "AI Consultant",
    online: "Online",
    hotline: "Hotline:",
    lawyerTitle: "Free Express Lawyer Help",
    lawyerText: "Leave your contacts and a specialist will call you back for free to review your case.",
  }
};

export default function FloatingLawyerWidget({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [inputVal, setInputVal] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { messages, language, setLanguage, isTyping, errorMsg, sendQuestion, syncLimitStatus } = useAIChat();
  const previousChatStateRef = useRef({ messageCount: messages.length, isTyping });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const previousState = previousChatStateRef.current;
    const shouldScroll =
      isOpen &&
      (messages.length > previousState.messageCount ||
        (isTyping && !previousState.isTyping));

    previousChatStateRef.current = { messageCount: messages.length, isTyping };

    if (!shouldScroll) return;

    const container = messagesContainerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [isOpen, messages.length, isTyping]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;

  const selectLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    setShowLangMenu(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const text = inputVal;
    setInputVal("");
    await sendQuestion(text, { context: "Виджет ИИ-чатбота" });
  };

  const displayMessages = messages.length > 0
    ? messages
    : [{ id: "widget-welcome", sender: "ai" as const, text: t.welcome, timestamp: new Date() }];
  const lastUserQuestion = [...messages].reverse().find((message) => message.sender === "user")?.text || "";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          void syncLimitStatus();
        }}
        className={`floating-assistant-trigger fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center gap-2 px-0 transition-all sm:w-auto sm:px-4 ${pathname === "/" ? "floating-assistant-trigger-home" : ""} ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
        aria-label="Задать вопрос ИИ"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden text-sm font-extrabold sm:inline">Задать вопрос</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-assistant-overlay ym-hide-content fixed inset-0 z-50 flex items-end justify-center sm:bottom-5 sm:right-5 sm:left-auto sm:top-auto sm:items-end sm:justify-end">
          <div data-motion-live role="dialog" aria-modal="true" aria-labelledby="widget-chat-title" className="floating-assistant-panel flex h-[85vh] w-full flex-col overflow-hidden sm:h-[590px] sm:w-[400px]">
            {/* Header */}
            <div className="floating-assistant-header relative flex shrink-0 flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="floating-assistant-avatar relative flex h-10 w-10 shrink-0 items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                    <span className="floating-assistant-online-dot absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"></span>
                  </div>
                  <div>
                    <h3 id="widget-chat-title" className="floating-assistant-title text-sm font-extrabold">{t.assistantTitle}</h3>
                    <p className="floating-assistant-status flex items-center gap-1 text-[10px] font-semibold">
                      <span className="floating-assistant-status-dot h-1.5 w-1.5 rounded-full"></span> {t.online}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={langMenuRef}>
                    <button
                      type="button"
                      aria-label="Выбрать язык"
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="floating-assistant-language flex min-h-9 items-center gap-1 px-2.5 text-[11px] font-extrabold"
                    >
                      <span className="text-[9px] font-black uppercase">{language}</span>
                      <svg className={`floating-assistant-chevron w-2.5 h-2.5 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showLangMenu && (
                      <div className="floating-assistant-language-menu motion-popover absolute right-0 z-50 mt-1.5 flex w-36 flex-col gap-0.5 p-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              selectLanguage(lang.code);
                            }}
                            className={`floating-assistant-language-option flex w-full items-center justify-between px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                              language === lang.code
                                ? "floating-assistant-language-active"
                                : ""
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-5 text-[9px] font-black uppercase">{lang.code}</span>
                              <span>{lang.name}</span>
                            </span>
                            {language === lang.code && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Закрыть чат"
                    className="floating-assistant-close p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Partner Hotline Number */}
              <div className="floating-assistant-hotline flex items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold sm:text-xs">
                <Phone className="floating-assistant-hotline-icon w-3.5 h-3.5 shrink-0" />
                <span>{t.hotline}</span>
                <a href={getPhoneHref(PARTNER_PHONE)} className="floating-assistant-hotline-link ml-auto font-bold underline">
                  {PARTNER_PHONE}
                </a>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={messagesContainerRef} className="floating-assistant-messages flex-grow space-y-4 overflow-y-auto p-4">
              {displayMessages.map((msg) => (
                <div key={msg.id} data-motion-live className="space-y-2">
                  <div className={`floating-assistant-message-row flex max-w-[85%] gap-2.5 ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`floating-assistant-message-avatar flex h-7 w-7 shrink-0 items-center justify-center text-xs ${
                      msg.sender === "user" ? "floating-assistant-message-avatar-user" : "floating-assistant-message-avatar-ai"
                    }`}>
                      {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`floating-assistant-message-bubble p-3 text-xs font-medium leading-relaxed ${
                      msg.sender === "user" 
                        ? "floating-assistant-message-bubble-user"
                        : "floating-assistant-message-bubble-ai"
                    }`}>
                      {msg.sender === "user" ? (
                        msg.text
                      ) : (
                        <SafeMessageText
                          text={msg.text}
                          linkClassName="floating-assistant-message-link font-semibold hover:underline"
                        />
                      )}
                    </div>
                  </div>

                  {/* Inline Lead Form */}
                  {msg.sender === "ai" && msg.showLeadForm && (
                    <div data-motion-live className="floating-assistant-lead ml-9 max-w-[85%] space-y-2 p-4">
                      <div className="floating-assistant-lead-kicker flex items-center gap-1.5 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>{t.lawyerTitle}</span>
                      </div>
                      <p className="floating-assistant-lead-copy text-[10px] font-semibold leading-normal">
                        {t.lawyerText}
                      </p>
                      <LeadForm 
                        sourceContext="Виджет ИИ-чатбота" 
                        defaultQuestion={lastUserQuestion}
                        onSuccess={() => setTimeout(() => setIsOpen(false), 4000)}
                      />
                    </div>
                  )}

                  {msg.sender === "ai" && msg.suggestedReplies && msg.suggestedReplies.length > 0 && !msg.showLeadForm && (
                    <div data-motion-live className="ml-9 flex max-w-[85%] flex-wrap gap-2">
                      {msg.suggestedReplies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => sendQuestion(reply, { context: "Виджет ИИ-чатбота" })}
                          disabled={isTyping}
                          className="floating-assistant-suggestion px-2.5 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-50"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[80%]">
                  <div className="floating-assistant-message-avatar floating-assistant-message-avatar-ai flex h-7 w-7 shrink-0 items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="floating-assistant-typing flex items-center gap-1 p-3">
                    <span className="h-1.5 w-1.5 rounded-full"></span>
                    <span className="h-1.5 w-1.5 rounded-full"></span>
                    <span className="h-1.5 w-1.5 rounded-full"></span>
                  </div>
                </div>
              )}
            </div>

            {errorMsg ? <p role="alert" aria-live="assertive" className="floating-assistant-error px-3 py-2 text-xs font-semibold">{errorMsg}</p> : null}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="floating-assistant-input-bar ym-disable-submit flex shrink-0 gap-2 p-3">
              <input
                type="text"
                aria-label={t.placeholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={t.placeholder}
                disabled={isTyping}
                className="floating-assistant-input ym-disable-keys flex-grow px-3 py-2 text-xs disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputVal.trim()}
                className="floating-assistant-send flex shrink-0 items-center justify-center p-2 disabled:opacity-45"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="floating-assistant-privacy px-3 pb-2 pt-1 text-[10px]">
              Сообщения обрабатываются по <Link href="/privacy" className="font-bold underline">правилам конфиденциальности</Link>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
