"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Phone, Sparkles } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import SafeMessageText from "@/components/chat/SafeMessageText";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  showLeadForm?: boolean;
}

const PARTNER_PHONE = process.env.NEXT_PUBLIC_PARTNER_PHONE || "8 (800) 350-84-13";

const LANGUAGES = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "tg", name: "Тоҷикӣ", flag: "🇹🇯" },
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "ro", name: "Română", flag: "🇲🇩" },
  { code: "kk", name: "Қазақша", flag: "🇰🇿" },
  { code: "en", name: "English", flag: "🇬🇧" },
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

export default function FloatingLawyerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>("ru");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: TRANSLATIONS.ru.welcome
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.ru;

  const createMessageId = () => {
    messageIdRef.current += 1;
    return `widget-message-${messageIdRef.current}`;
  };

  const selectLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    const nextTranslation = TRANSLATIONS[nextLanguage] || TRANSLATIONS.ru;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{
          ...prev[0],
          text: nextTranslation.welcome
        }];
      }
      return prev;
    });
    setShowLangMenu(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const text = inputVal;
    setInputVal("");

    const userMsg: Message = {
      id: createMessageId(),
      sender: "user",
      text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, language }),
      });

      const data = await response.json();

      if (response.ok) {
        const fullText = data.text;
        const msgId = createMessageId();
        
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            sender: "ai",
            text: "",
            showLeadForm: false
          }
        ]);

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
            if (data.showLeadForm) {
              setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showLeadForm: true } : m));
              }, 1000);
            }
          }
        }, 30);
      } else {
        const errorText = data.text || data.error || "Произошла ошибка при отправке запроса.";
        setMessages(prev => [
          ...prev,
          {
            id: createMessageId(),
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
          id: createMessageId(),
          sender: "ai",
          text: "Ошибка сети. Пожалуйста, проверьте интернет-соединение."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end sm:items-end sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:p-0 bg-black/50 sm:bg-transparent">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:w-[380px] h-[85vh] sm:h-[550px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-slate-800/90 backdrop-blur border-b border-slate-700/60 p-3.5 flex flex-col gap-1.5 shrink-0 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center relative shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-slate-800"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm">{t.assistantTitle}</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.online}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={langMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="flex items-center gap-1 text-[11px] font-extrabold bg-slate-950/65 hover:bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1 text-white transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                      <span className="text-[9px] text-slate-300 font-bold uppercase">{language}</span>
                      <svg className={`w-2.5 h-2.5 text-slate-400 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showLangMenu && (
                      <div className="absolute right-0 mt-1.5 w-32 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              selectLanguage(lang.code);
                            }}
                            className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              language === lang.code
                                ? "bg-blue-600 text-white"
                                : "text-slate-350 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{lang.flag}</span>
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
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Partner Hotline Number */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/40 border border-slate-700/30 rounded-lg text-[10px] sm:text-xs font-semibold text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
                <span>{t.hotline}</span>
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
                      {msg.sender === "user" ? (
                        msg.text
                      ) : (
                        <SafeMessageText
                          text={msg.text}
                          linkClassName="font-semibold text-blue-400 hover:underline"
                        />
                      )}
                    </div>
                  </div>

                  {/* Inline Lead Form */}
                  {msg.sender === "ai" && msg.showLeadForm && (
                    <div className="ml-9 p-4 bg-slate-900/90 border border-slate-800 rounded-xl max-w-[85%] space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>{t.lawyerTitle}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        {t.lawyerText}
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
                placeholder={t.placeholder}
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
