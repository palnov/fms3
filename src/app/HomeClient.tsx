"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, ShieldCheck, FileText, Globe, 
  MapPin, CheckCircle2, Target, ClipboardList, 
  BookOpen, Bot, ChevronRight, Search, Landmark, LandmarkIcon
} from "lucide-react";
import gsap from "gsap";
import MigrationIllustration from "@/components/illustrations/MigrationIllustration";

export default function HomeClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero elements stagger
      gsap.fromTo(
        ".animate-hero-item",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power4.out", stagger: 0.15 }
      );

      // Metrics entry
      gsap.fromTo(
        ".animate-metric-card",
        { opacity: 0, scale: 0.9, y: 20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power3.out", 
          stagger: 0.1,
          delay: 0.4
        }
      );

      // Pathway cards scroll stagger-like entrance
      gsap.fromTo(
        ".animate-pathway-card",
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power2.out", 
          stagger: 0.15,
          delay: 0.6 
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden bg-grid">
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between pt-20 md:pt-32 pb-20 md:pb-28 px-6 lg:px-8 gap-12 min-h-[90vh]">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] bg-primary-500/10 dark:bg-primary-500/15 rounded-full blur-[120px] opacity-80 animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[5%] w-[550px] h-[550px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[140px] opacity-70"></div>
        </div>

        {/* Text Area */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10 max-w-3xl">
          <div className="animate-hero-item glass rounded-full px-4 py-1.5 mb-6 text-xs font-bold text-primary-500 inline-flex items-center gap-2 border-primary-500/10 bg-primary-50/50 dark:bg-slate-900/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            Законодательство обновлено на 2026 год
          </div>
          
          <h1 className="animate-hero-item text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Переезд в Россию <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-slate-800 dark:from-primary-400 dark:via-primary-300 dark:to-slate-200">
              без лишней бюрократии
            </span>
          </h1>
          
          <p className="animate-hero-item text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-2xl">
            Современный цифровой хаб для иностранных граждан. Пошаговые интерактивные дорожные карты, чек-листы и умный анализ шансов на РВП, ВНЖ или гражданство РФ.
          </p>

          <div className="animate-hero-item flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/tools/calculator" 
              className="px-8 py-4 rounded-2xl font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-[0_8px_30px_rgba(25,83,181,0.25)] hover:shadow-[0_8px_40px_rgba(25,83,181,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Оценить свои шансы <Target className="w-5 h-5" />
            </Link>
            <Link 
              href="/pathways/vnzh" 
              className="px-8 py-4 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Инструкция ВНЖ <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Dynamic Graphic Area */}
        <div className="animate-hero-item flex-1 w-full flex items-center justify-center z-10">
          <MigrationIllustration />
        </div>
      </section>

      {/* 2. TRUST METRICS */}
      <section ref={metricsRef} className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-24 md:mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "100%", desc: "Соответствие ФЗ-115 и ФЗ-62", color: "text-primary-500" },
            { icon: Search, title: "4 пути", desc: "Легализации в 2026 году", color: "text-primary-500" },
            { icon: CheckCircle2, title: "0 ₽", desc: "Абсолютно бесплатный сервис", color: "text-primary-500" },
            { icon: MapPin, title: "89", desc: "Регионов РФ в базе данных", color: "text-primary-500" }
          ].map((item, i) => (
            <div 
              key={i} 
              className="animate-metric-card flex flex-col items-center justify-center text-center p-6 glass rounded-3xl hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center mb-4 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold mb-1">{item.title}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2.5 LEGISLATIVE CHANGES 2026 */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-24 md:mb-32 animate-hero-item">
        <div className="glass rounded-3xl p-8 md:p-10 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10">
          <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
            </span>
            Главные изменения в миграционном праве на 2026 год
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <strong className="block text-slate-900 dark:text-white font-extrabold text-base">Режим высылки</strong>
              <p className="text-xs md:text-sm font-medium">Введен специальный правовой режим для лиц, не имеющих законных оснований находиться в РФ. Усилен контроль за фактическим пребыванием.</p>
            </div>
            <div className="space-y-2">
              <strong className="block text-slate-900 dark:text-white font-extrabold text-base">Единый реестр работодателей</strong>
              <p className="text-xs md:text-sm font-medium">Привлечение иностранных сотрудников теперь осуществляется строго через верифицированные Минтрудом организации.</p>
            </div>
            <div className="space-y-2">
              <strong className="block text-slate-900 dark:text-white font-extrabold text-base">Ограничение «90 дней в год»</strong>
              <p className="text-xs md:text-sm font-medium">Для граждан безвизовых стран совокупный срок пребывания без РВП, ВНЖ или патента сокращен до 90 дней в течение календарного года.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 USER SEGMENTATION */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-24 md:mb-32 animate-hero-item">
        <div className="text-center md:text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">С чего начать именно вам?</h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
            Выберите вашу ситуацию, чтобы получить персональную пошаговую инструкцию и список документов.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Родственники в РФ", 
              desc: "ВНЖ напрямую по родителям, детям или супругам-гражданам РФ.", 
              link: "/pathways/vnzh#relatives", 
              tag: "Самый частый путь" 
            },
            { 
              title: "Студенты и выпускники", 
              desc: "Получение РВПО во время учебы или ВНЖ по красному диплому.", 
              link: "/pathways/rvp#students", 
              tag: "Для учащихся" 
            },
            { 
              title: "Ценные специалисты", 
              desc: "ВНЖ в РФ для IT-кадров и востребованных профессий из перечня Минтруда.", 
              link: "/pathways/vnzh#specialists", 
              tag: "Для профессионалов" 
            },
            { 
              title: "Начать с нуля", 
              desc: "Оформление патента, квоты на РВП или участие в программе Соотечественников.", 
              link: "/pathways/repatriation", 
              tag: "Без оснований" 
            }
          ].map((item, idx) => (
            <Link 
              href={item.link} 
              key={idx} 
              className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider text-primary-500 uppercase block mb-3 opacity-80">{item.tag}</span>
                <h4 className="font-extrabold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs font-bold text-primary-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Перейти к шагам <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. CORE PATHWAYS (BENTO GRID STYLE) */}
      <section ref={cardsRef} className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Варианты легализации</h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
              Документы и сроки зависят от вашей ситуации. Выберите один из четырех официальных путей переезда.
            </p>
          </div>
          <Link href="/pathways" className="text-primary-500 hover:text-primary-600 font-bold flex items-center gap-1.5 group transition-colors">
            Все варианты <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* PREMIUM BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: ВНЖ (2/3 width on desktop) */}
          <Link 
            href="/pathways/vnzh" 
            className="animate-pathway-card premium-card security-pattern md:col-span-2 p-8 md:p-10 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold tracking-widest px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full uppercase">
                  Бессрочно / Премиум
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4 group-hover:text-primary-500 transition-colors">
                Вид на жительство (ВНЖ)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm mb-6 max-w-xl">
                Бессрочный статус, дающий право жить и работать без патентов. Можно получить напрямую без РВП при наличии определенных условий.
              </p>

              {/* Sub-features for visual richness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  По браку при наличии детей
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  Для IT-специалистов
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  По диплому РФ с отличием
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  По родителям или детям из РФ
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex items-center text-sm font-bold text-primary-500">
              Перейти к инструкции <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: РВП (1/3 width) */}
          <Link 
            href="/pathways/rvp" 
            className="animate-pathway-card premium-card p-8 md:p-10 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full">
                  На 3 года
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                РВП
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-xs mb-6">
                Разрешение на временное проживание. Ограниченное право на жительство по региону выдачи или полученной квоте.
              </p>

              {/* Graphical representation of processing limits */}
              <div className="bg-slate-100 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/20">
                <div className="flex justify-between text-[10px] font-bold mb-1 opacity-70">
                  <span>Срок действия</span>
                  <span>36 месяцев</span>
                </div>
                <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-primary-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex items-center text-sm font-bold text-primary-500">
              Пошаговый гайд <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Госпрограмма переселения (1/3 width) */}
          <Link 
            href="/pathways/repatriation" 
            className="animate-pathway-card premium-card p-8 md:p-10 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <MapPin className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                  Льготы + Подъемные
                </span>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                Соотечественники
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-xs mb-6">
                Государственная программа по возвращению соотечественников и репатриантов. Предусматривает компенсацию транспортных расходов.
              </p>

              {/* Visual elements like map coordinate graphics */}
              <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/10">
                <Landmark className="w-8 h-8 text-primary-500/70" />
                <div className="text-[10px] leading-tight font-medium text-slate-500">
                  <p className="font-bold text-slate-800 dark:text-slate-200">89 регионов РФ</p>
                  <p>Индивидуальные квоты</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex items-center text-sm font-bold text-primary-500">
              Пошаговый гайд <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Гражданство (2/3 width on desktop) */}
          <Link 
            href="/pathways/citizenship" 
            className="animate-pathway-card premium-card security-pattern md:col-span-2 p-8 md:p-10 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold tracking-widest px-3 py-1 bg-red-500/10 text-red-500 rounded-full uppercase">
                  Финальный Паспорт РФ
                </span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4 group-hover:text-primary-500 transition-colors">
                Гражданство РФ
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm mb-6 max-w-xl">
                Заключительный этап легализации. Разбираем порядок подачи заявления по новому ФЗ-138, сдачу экзамена, подготовку к присяге.
              </p>

              {/* Sub-steps grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/20 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div>
                  <span className="text-primary-500 font-bold block mb-1">01. Сдача тестов</span>
                  Знание языка и истории
                </div>
                <div>
                  <span className="text-primary-500 font-bold block mb-1">02. Справка о доходах</span>
                  Легальный заработок
                </div>
                <div>
                  <span className="text-primary-500 font-bold block mb-1">03. Присяга</span>
                  Получение паспорта
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex items-center text-sm font-bold text-primary-500">
              Пошаговый гайд <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* 4. INTERACTIVE TOOLS / LEAD MAGNETS */}
      <section ref={toolsRef} className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-32 z-10 relative">
        <div className="glass rounded-[2.5rem] p-8 md:p-14 border border-slate-200/50 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Умные онлайн-инструменты</h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Автоматизируйте рутину сбора документов и оценки ваших шансов перед походом в ММЦ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            <Link href="/tools/calculators" className="group flex flex-col p-8 rounded-3xl bg-white/70 shadow-lg hover:shadow-xl dark:bg-slate-900/50 hover:-translate-y-1.5 transition-all duration-300 border border-transparent hover:border-primary-500/20">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 transform group-hover:scale-105 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Калькуляторы</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-medium">
                Рассчитайте сроки нахождения в РФ по правилу «90 из 180» и точную стоимость трудового патента для любого региона.
              </p>
              <div className="text-sm font-bold text-primary-500 flex items-center">
                Открыть калькуляторы <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </Link>
            
            <Link href="/tools/document-check" className="group flex flex-col p-8 rounded-3xl bg-white/70 shadow-lg hover:shadow-xl dark:bg-slate-900/50 hover:-translate-y-1.5 transition-all duration-300 border border-transparent hover:border-primary-500/20">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 transform group-hover:scale-105 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Проверка документов</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-medium">
                Проверьте валидность паспорта, патента или наличие запрета на въезд с прямым переходом на официальные базы МВД РФ.
              </p>
              <div className="text-sm font-bold text-primary-500 flex items-center">
                Проверить документы <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </Link>

            <Link href="/tools/ai-consultant" className="group flex flex-col p-8 rounded-3xl bg-white/70 shadow-lg hover:shadow-xl dark:bg-slate-905/50 dark:bg-slate-900/50 hover:-translate-y-1.5 transition-all duration-300 border border-transparent hover:border-primary-500/20">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-6 transform group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Консультант</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-medium">
                Интеллектуальный помощник, знающий все нормы ФЗ-115, ФЗ-62 и ФЗ-138. Получите моментальный ответ на свой вопрос.
              </p>
              <div className="text-sm font-bold text-primary-500 flex items-center">
                Задать вопрос ИИ <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="w-full max-w-4xl mx-auto px-6 mb-24">
        <h2 className="text-3xl font-extrabold mb-12 text-center tracking-tight">Ответы на популярные вопросы</h2>
        <div className="space-y-4">
          {[
            {
              q: "Можно ли подать на ВНЖ без оформления РВП?",
              a: "Да, закон предусматривает прямую подачу на ВНЖ для граждан Беларуси, Молдовы, Казахстана, квалифицированных специалистов по перечню профессий, а также при переезде к близким родственникам-гражданам РФ."
            },
            {
              q: "Какой срок действия у РВП?",
              a: "РВП выдается строго на 3 года без возможности продления. Спустя 8 месяцев проживания с РВП вы получаете законное право подать заявление на получение бессрочного ВНЖ."
            },
            {
              q: "Нужен ли сертификат о знании русского языка?",
              a: "Да, для большинства процедур подтверждение владения языком обязательно. От экзамена освобождены пенсионеры (65+ для мужчин, 60+ для женщин), дети до 18 лет и выпускники советских или российских вузов."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-900 hover:border-primary-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold mb-3 flex items-start gap-3">
                <span className="text-primary-500 shrink-0 mt-1"><BookOpen className="w-5 h-5" /></span>
                {item.q}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:ml-8 font-medium">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
