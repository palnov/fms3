"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Sparkles, Shield, Bookmark, AlertCircle, Download, ExternalLink } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";
import SafeMessageText from "@/components/chat/SafeMessageText";

interface Source {
  name: string;
  parent_url?: string | null;
  download_url?: string | null;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  sources?: (string | Source)[];
  showLeadForm?: boolean;
  timestamp: Date;
}

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
  backToHome: string;
  remaining: string;
  presetsLabel: string;
  presets: string[];
  mvdShield: string;
  ragTag: string;
  errorLimit: string;
  inputPlaceholderLimit: string;
  sourcesLabel: string;
}> = {
  ru: {
    welcome: "Здравствуйте! Я ваш ИИ-консультант по миграционным вопросам в Российской Федерации. Мои знания основаны на официальных законах (ФЗ-115, ФЗ-62) и актуальных правилах МВД. Задайте свой вопрос или выберите одну из популярных тем ниже.",
    placeholder: "Спросите о патенте, ВНЖ, РВП или гражданстве...",
    backToHome: "Назад на главную",
    remaining: "Осталось бесплатных вопросов:",
    presetsLabel: "Часто задаваемые вопросы:",
    presets: [
      "Как получить ВНЖ по браку в 2026 году?",
      "Сколько стоит патент на работу в Москве?",
      "Как проверить запрет на въезд в РФ?",
      "Можно ли получить ВНЖ без РВП?"
    ],
    mvdShield: "Подключен к ФЗ-115, ФЗ-62 и шаблонам МВД",
    ragTag: "RAG / SQLite",
    errorLimit: "Вы исчерпали лимит вопросов...",
    inputPlaceholderLimit: "Вы исчерпали лимит вопросов...",
    sourcesLabel: "Источники:",
  },
  tg: {
    welcome: "Салом! Ман мушовири СУ-и шумо оид ба масъалаҳои муҳоҷират дар Федератсияи Русия ҳастам. Дониши ман ба қонунҳои расмӣ (ФЗ-115, ФЗ-62) ва қоидаҳои ҷории ВКД асос ёфтааст. Саволи худро диҳед ё яке аз мавзӯъҳои маъмулро дар зер интихоб кунед.",
    placeholder: "Дар бораи патент, ВНЖ, РВП ё шаҳрвандӣ пурсед...",
    backToHome: "Бозгашт ба саҳифаи асосӣ",
    remaining: "Саволҳои ройгони боқимонда:",
    presetsLabel: "Саволҳои бештар додашаванда:",
    presets: [
      "Чӣ тавр дар соли 2026 тавассути издивоҷ ВНЖ гирифтан мумкин аст?",
      "Патент барои кор дар Маскав чанд пул аст?",
      "Чӣ тавр манъи вуруд ба РФ-ро тафтиш кардан мумкин аст?",
      "Оё бе РВП ВНЖ гирифтан мумкин аст?"
    ],
    mvdShield: "Ба ФЗ-115, ФЗ-62 ва қолибҳои ВКД пайваст аст",
    ragTag: "RAG / SQLite",
    errorLimit: "Шумо лимити саволҳоро тамом кардед...",
    inputPlaceholderLimit: "Шумо лимити саволҳоро тамом кардед...",
    sourcesLabel: "Манбаъҳо:",
  },
  uz: {
    welcome: "Salom! Men Rossiya Federatsiyasidagi migratsiya masalalari bo'yicha sizning sun'iy intellekt maslahatchiman. Mening bilimlarim rasmiy qonunlar (FZ-115, FZ-62) va Ichki ishlar vazirligining amaldagi qoidalariga asoslangan. Savolingizni bering yoki quyidagi ommabop mavzulardan birini tanlang.",
    placeholder: "Patent, VNJ, RVP yoki fuqarolik haqida so'rang...",
    backToHome: "Bosh sahifaga qaytish",
    remaining: "Qolgan bepul savollar soni:",
    presetsLabel: "Ko'p beriladigan savollar:",
    presets: [
      "2026 yilda nikoh orqali qanday qilib VNJ olish mumkin?",
      "Moskvada ish patenti qancha turadi?",
      "Rossiyaga kirish taqiqi qanday tekshiriladi?",
      "RVP-siz VNJ olish mumkinmi?"
    ],
    mvdShield: "FZ-115, FZ-62 va IIV shablonlariga ulangan",
    ragTag: "RAG / SQLite",
    errorLimit: "Siz savollar limitini tugatdingiz...",
    inputPlaceholderLimit: "Siz savollar limitini tugatdingiz...",
    sourcesLabel: "Manbalar:",
  },
  ro: {
    welcome: "Bună ziua! Sunt consultantul dumneavoastră AI pentru probleme de migrație în Federația Rusă. Cunoștințele mele se bazează pe legile oficiale (FZ-115, FZ-62) și pe reglementările actuale ale MAI. Puneți o întrebare sau alegeți unul dintre subiectele populare de mai jos.",
    placeholder: "Întrebați despre brevet, permis de ședere, RVP sau cetățenie...",
    backToHome: "Înapoi la pagina principală",
    remaining: "Întrebări gratuite rămase:",
    presetsLabel: "Întrebări frecvente:",
    presets: [
      "Cum se obține permisul de ședere prin căsătorie în 2026?",
      "Cât costă un brevet de muncă în Moscova?",
      "Cum se verifică interdicția de intrare în Federația Rusă?",
      "Se poate obține permisul de ședere fără RVP?"
    ],
    mvdShield: "Conectat la FZ-115, FZ-62 și șabloanele MAI",
    ragTag: "RAG / SQLite",
    errorLimit: "Ați epuizat limita de întrebări...",
    inputPlaceholderLimit: "Ați epuizat limita de întrebări...",
    sourcesLabel: "Surse:",
  },
  kk: {
    welcome: "Сәлеметсіз бе! Мен Ресей Федерациясындағы көші-қон мәселелері бойынша сіздің ИИ-кеңесшіңізбін. Менің білімім ресми заңдарға (ФЗ-115, ФЗ-62) және ІІМ-нің ағымдағы ережелеріне негізделген. Сұрағыңызды қойыңыз немесе төмендегі танымал тақырыптардың бірін таңдаңыз.",
    placeholder: "Патент, ВНЖ, РВП немесе азаматтық туралы сұраңыз...",
    backToHome: "Басты бетке оралу",
    remaining: "Қалған тегін сұрақтар саны:",
    presetsLabel: "Жиі қойылатын сұрақтар:",
    presets: [
      "2026 жылы неке бойынша ВНЖ-ны қалай алуға болады?",
      "Мәскеуде жұмыс патенті қанша тұрады?",
      "РФ-ға кіруге тыйым салынғанын қалай тексеруге болады?",
      "РВП-сыз ВНЖ алуға бола ма?"
    ],
    mvdShield: "ФЗ-115, ФЗ-62 және ІІМ үлгілеріне қосылған",
    ragTag: "RAG / SQLite",
    errorLimit: "Сұрақтар лимиті таусылды...",
    inputPlaceholderLimit: "Сұрақтар лимиті таусылды...",
    sourcesLabel: "Дереккөздер:",
  },
  en: {
    welcome: "Hello! I am your AI consultant on migration issues in the Russian Federation. My knowledge is based on official laws (FZ-115, FZ-62) and current rules of the Ministry of Internal Affairs. Ask your question or choose one of the popular topics below.",
    placeholder: "Ask about patent, residence permit, TRP or citizenship...",
    backToHome: "Back to Home",
    remaining: "Remaining free questions:",
    presetsLabel: "Frequently Asked Questions:",
    presets: [
      "How to get a residence permit by marriage in 2026?",
      "How much does a work patent cost in Moscow?",
      "How to check the entry ban to the Russian Federation?",
      "Is it possible to get a residence permit without TRP?"
    ],
    mvdShield: "Connected to FZ-115, FZ-62 and MVD templates",
    ragTag: "RAG / SQLite",
    errorLimit: "You have reached your question limit...",
    inputPlaceholderLimit: "You have reached your question limit...",
    sourcesLabel: "Sources:",
  }
};

export default function AIConsultantPage() {
  const [language, setLanguage] = useState<string>("ru");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: TRANSLATIONS.ru.welcome,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(20);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
    return `message-${messageIdRef.current}`;
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
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
        body: JSON.stringify({ question: text, language }),
      });

      const data = await response.json();

      if (response.ok) {
        const fullText = data.text;
        const msgId = createMessageId();

        const aiMsg: Message = {
          id: msgId,
          sender: "ai",
          text: "",
          sources: data.sources,
          showLeadForm: false,
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
            if (data.showLeadForm) {
              setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showLeadForm: true } : m));
              }, 1000);
            }
          }
        }, 30);

        if (data.remainingRequests !== undefined) {
          setRemainingRequests(data.remainingRequests);
          localStorage.setItem("ai_requests_left", data.remainingRequests.toString());
        }
      } else {
        // Handle rate limits or other issues
        const errorText = data.error || "Произошла ошибка при получении ответа.";
        
        if (response.status === 429) {
          const aiMsg: Message = {
            id: createMessageId(),
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

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col h-[90vh]">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t.backToHome}
        </Link>
        {remainingRequests !== null && (
          <span className="text-xs text-slate-500 font-bold">
            {t.remaining} <span className={`${remainingRequests <= 5 ? "text-amber-500" : "text-emerald-500"}`}>{remainingRequests} / 20</span>
          </span>
        )}
      </div>

      <div className="flex-grow bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col overflow-hidden relative shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white">Миграционный ИИ-Консультант</h3>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" /> {t.mvdShield}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-xs font-extrabold bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-700 dark:text-slate-250 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                <span className="font-bold">{LANGUAGES.find(l => l.code === language)?.name}</span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        selectLanguage(lang.code);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        language === lang.code
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="text-[10px] sm:text-xs font-bold tracking-widest px-3 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl uppercase">
              {t.ragTag}
            </div>
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
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <SafeMessageText
                      text={msg.text}
                      linkClassName="font-semibold text-blue-500 underline transition-colors hover:text-blue-600"
                      paragraphClassName="mb-1.5 min-h-[1.25rem]"
                    />
                  )}
                </div>

                {/* Inline Lead Form Card */}
                {msg.sender === "ai" && msg.showLeadForm && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner max-w-md animate-in fade-in-50 duration-300">
                    <div className="flex items-center gap-2 mb-3 text-blue-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <h4 className="text-sm font-bold text-white">Бесплатная экспресс-помощь юриста</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 font-medium leading-relaxed">
                      Законы меняются, а ошибки в заполнении могут привести к отказу. Заполните форму, и юрист бесплатно перепроверит ваши документы.
                    </p>
                    <LeadForm 
                      sourceContext="AI Чат-бот" 
                      defaultQuestion={messages[messages.length - 2]?.text || ""}
                    />
                  </div>
                )}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 items-center text-[10px] text-slate-500 font-bold px-1">
                    <Bookmark className="w-3 h-3 text-blue-500" /> {t.sourcesLabel}
                    {msg.sources.map((src, i) => {
                      const isObj = typeof src === "object" && src !== null;
                      const name = isObj ? src.name : src;
                      const parentUrl = isObj ? src.parent_url : null;
                      const downloadUrl = isObj ? src.download_url : null;

                      return (
                        <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-850 border border-slate-200/40 text-slate-650 dark:text-slate-350 shadow-sm">
                          <span>{name}</span>
                          {downloadUrl && (
                            <a
                              href={downloadUrl}
                              download
                              title="Скачать документ"
                              className="text-blue-500 hover:text-blue-600 transition-colors p-0.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {parentUrl && (
                            <a
                              href={parentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Открыть первоисточник"
                              className="text-emerald-500 hover:text-emerald-600 transition-colors p-0.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
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
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> {t.presetsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.presets.map((q, idx) => (
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
              placeholder={remainingRequests === 0 ? t.inputPlaceholderLimit : t.placeholder}
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
