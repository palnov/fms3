"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Printer, RefreshCw, ClipboardList, HelpCircle } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

interface ChecklistItem {
  id: string;
  text: string;
  description: string;
}

interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

const CHECKLISTS: Record<string, {
  title: string;
  fee: string;
  groups: ChecklistGroup[];
}> = {
  "rvp-marriage": {
    title: "РВП по браку с гражданином РФ",
    fee: "Государственная пошлина: 1600 рублей (реквизиты уточняйте в ММЦ/УМВД вашего региона).",
    groups: [
      {
        title: "1. Личные документы",
        items: [
          { id: "rvp-m-pass", text: "Заграничный паспорт иностранного гражданина", description: "Срок действия паспорта должен быть не менее 6 месяцев на момент подачи заявления." },
          { id: "rvp-m-trans", text: "Нотариально заверенный перевод всех страниц паспорта", description: "Должен быть выполнен российским нотариусом. Переводятся все штампы и визы." },
          { id: "rvp-m-mig", text: "Миграционная карта и бланк уведомления о прибытии (регистрация)", description: "Оригиналы и копии действующих документов, подтверждающих легальное пребывание в РФ." },
          { id: "rvp-m-photo", text: "Фотографии 35x45 мм — 4 шт.", description: "Черно-белые или цветные, на матовой бумаге, без уголков." },
        ]
      },
      {
        title: "2. Документы-основания (Брак)",
        items: [
          { id: "rvp-m-cert", text: "Свидетельство о заключении брака", description: "Оригинал и копия. Если брак заключен за границей — требуется апостиль/легализация и нотариальный перевод." },
          { id: "rvp-m-spouse", text: "Паспорт супруга — гражданина РФ", description: "Оригинал и копия всех страниц с отметками. Обязательно наличие штампа о постоянной регистрации (прописке)." },
          { id: "rvp-m-child", text: "Подтверждение совместного проживания или общий ребенок", description: "Свидетельство о рождении общего ребенка (при наличии) или документы, подтверждающие совместное ведение хозяйства (требование 2025-2026 гг для исключения фиктивных браков)." },
        ]
      },
      {
        title: "3. Справки и Сертификаты",
        items: [
          { id: "rvp-m-med", text: "Медицинское заключение об отсутствии опасных инфекций", description: "Проходится строго в уполномоченных медцентрах РФ. Включает ВИЧ-сертификат, справки из наркологии и КВД." },
          { id: "rvp-m-lang", text: "Сертификат о владении русским языком, знании истории и законов", description: "Уровень РВП. Не требуется при наличии советского аттестата или диплома, выданного в РФ." },
          { id: "rvp-m-crim", text: "Справка об отсутствии судимости (для визовых стран)", description: "Срок действия — 3 месяца со дня выдачи. Должна быть легализована или апостилирована в стране исхода." },
        ]
      },
      {
        title: "4. Заявление и Оплата",
        items: [
          { id: "rvp-m-app", text: "Заявление о выдаче РВП в 2-х экземплярах", description: "Заполняется разборчиво от руки или на компьютере. Без сокращений и исправлений." },
          { id: "rvp-m-fee", text: "Квитанция об оплате государственной пошлины (1600 руб.)", description: "Оплачивается на реквизиты ГУВМ МВД региона подачи. Оригинал квитанции прилагается к делу." },
        ]
      }
    ]
  },
  "rvp-quota": {
    title: "РВП по квоте (общий порядок)",
    fee: "Государственная пошлина: 1600 рублей.",
    groups: [
      {
        title: "1. Личные документы",
        items: [
          { id: "rvp-q-pass", text: "Заграничный паспорт + нотариальный перевод", description: "Все заполненные и пустые страницы." },
          { id: "rvp-q-mig", text: "Миграционная карта и регистрация в РФ", description: "С актуальным сроком действия." },
          { id: "rvp-q-photo", text: "Фотографии 35x45 мм — 4 шт.", description: "Матовые, без ретуши." },
        ]
      },
      {
        title: "2. Документы-основания (Одобрение квоты)",
        items: [
          { id: "rvp-q-decision", text: "Решение о выделении квоты на РВП", description: "Уведомление от УМВД региона о том, что ваше заявление на квоту одобрено." },
        ]
      },
      {
        title: "3. Справки и Знания",
        items: [
          { id: "rvp-q-med", text: "Комплексное медицинское заключение", description: "Справки об отсутствии ВИЧ, туберкулеза, сифилиса и наркомании." },
          { id: "rvp-q-lang", text: "Сертификат о знании русского языка (уровень РВП)", description: "Либо российский диплом/аттестат." },
          { id: "rvp-q-crim", text: "Справка об отсутствии судимости (для граждан визовых стран)", description: "С нотариальным переводом и апостилем." },
        ]
      },
      {
        title: "4. Заявление и Оплата",
        items: [
          { id: "rvp-q-app", text: "Заявление о выдаче РВП в 2-х экземплярах", description: "На стандартных бланках." },
          { id: "rvp-q-fee", text: "Квитанция об оплате госпошлины 1600 руб.", description: "Оригинал платежного поручения." },
        ]
      }
    ]
  },
  "vnzh-marriage": {
    title: "ВНЖ по близким родственникам (родители / дети)",
    fee: "Государственная пошлина: 5000 рублей (срок рассмотрения 3-4 месяца).",
    groups: [
      {
        title: "1. Личные документы",
        items: [
          { id: "vnzh-f-pass", text: "Паспорт иностранного гражданина + нотариальный перевод", description: "Все страницы, заверенные российским нотариусом." },
          { id: "vnzh-f-mig", text: "Миграционная карта и регистрация в РФ", description: "Оригиналы и копии." },
          { id: "vnzh-f-photo", text: "Фотографии 35x45 мм — 4 шт.", description: "Матовые, на светлом фоне." },
        ]
      },
      {
        title: "2. Документы-основания (Родство)",
        items: [
          { id: "vnzh-f-child-cert", text: "Свидетельство о рождении ребенка — гражданина РФ", description: "При подаче по детям. Подтверждает родственную связь." },
          { id: "vnzh-f-parent-cert", text: "Ваше свидетельство о рождении", description: "При подаче по родителям-гражданам РФ. Должно быть легализовано/переведено при необходимости." },
          { id: "vnzh-f-relative-pass", text: "Паспорт родственника — гражданина РФ (ребенка или родителя)", description: "Копия паспорта с обязательной отметкой о постоянной регистрации (прописке) в РФ." },
        ]
      },
      {
        title: "3. Справки и Финансы",
        items: [
          { id: "vnzh-f-med", text: "Медицинское заключение для ВНЖ", description: "Сертификаты об отсутствии инфекций, наркомании и ВИЧ-инфекции." },
          { id: "vnzh-f-income", text: "Подтверждение легального дохода в РФ", description: "Справка 2-НДФЛ, выписка из банка (в размере не менее прожиточного минимума за 12 месяцев) или пенсионное удостоверение." },
          { id: "vnzh-f-lang", text: "Сертификат о знании русского языка (уровень ВНЖ)", description: "Либо российский диплом/аттестат. Мужчины старше 65 лет и женщины старше 60 лет полностью освобождаются." },
        ]
      },
      {
        title: "4. Заявление и Госпошлина",
        items: [
          { id: "vnzh-f-app", text: "Заявление на выдачу ВНЖ — 2 экз.", description: "Сведения обо всех родственниках, месте работы за последние 5 лет." },
          { id: "vnzh-f-fee", text: "Квитанция об оплате госпошлины 5000 руб.", description: "Оригинал чека." },
        ]
      }
    ]
  },
  "vnzh-pension": {
    title: "ВНЖ для пенсионеров и нетрудоспособных",
    fee: "Государственная пошлина: 5000 рублей. Пенсионеры имеют право на льготы по сдаче экзаменов.",
    groups: [
      {
        title: "1. Личные документы",
        items: [
          { id: "vnzh-p-pass", text: "Заграничный паспорт с нотариальным переводом", description: "Все страницы." },
          { id: "vnzh-p-pension-cert", text: "Пенсионное удостоверение с нотариальным переводом", description: "Оригинал и копия документа, выданного в стране исхода." },
          { id: "vnzh-p-photo", text: "Фотографии 35x45 мм — 4 шт.", description: "Матовые." },
        ]
      },
      {
        title: "2. Подтверждение родства с гражданами РФ",
        items: [
          { id: "vnzh-p-child-birth", text: "Свидетельство о рождении сына или дочери (граждан РФ)", description: "Подтверждающее вашу родственную связь." },
          { id: "vnzh-p-child-pass", text: "Паспорт сына или дочери с регистрацией в РФ", description: "Копия паспорта с постоянной пропиской." },
        ]
      },
      {
        title: "3. Медицина и Финансы",
        items: [
          { id: "vnzh-p-med", text: "Медицинское заключение об отсутствии заболеваний", description: "Справка об отсутствии ВИЧ, туберкулеза и наркозависимости." },
          { id: "vnzh-p-pension-income", text: "Справка о размере получаемой пенсии", description: "Получаемой в РФ или в стране исхода." },
          { id: "vnzh-p-lang-ex", text: "Документ об освобождении от экзамена по русскому языку", description: "Согласно закону, мужчины от 65 лет и женщины от 60 лет полностью освобождаются от экзамена по возрасту." },
        ]
      },
      {
        title: "4. Заявление и Оплата",
        items: [
          { id: "vnzh-p-app", text: "Заявление о выдаче ВНЖ в 2-х экземплярах", description: "С указанием пенсионного статуса." },
          { id: "vnzh-p-fee", text: "Квитанция об оплате государственной пошлины (5000 руб.)", description: "Оригинал квитанции." },
        ]
      }
    ]
  },
  "vnzh-profession": {
    title: "ВНЖ по востребованной профессии (приказ Минтруда)",
    fee: "Государственная пошлина: 5000 рублей.",
    groups: [
      {
        title: "1. Личные документы",
        items: [
          { id: "vnzh-pr-pass", text: "Паспорт иностранного гражданина + нотариальный перевод", description: "Все страницы." },
          { id: "vnzh-pr-mig", text: "Миграционная карта и регистрация в РФ", description: "Действующие бланки." },
          { id: "vnzh-pr-photo", text: "Фотографии 35x45 мм — 4 шт.", description: "На матовой бумаге." },
        ]
      },
      {
        title: "2. Документы о квалификации и стаже",
        items: [
          { id: "vnzh-pr-diploma", text: "Диплом об образовании по квалификации", description: "С нотариальным переводом (при необходимости)." },
          { id: "vnzh-pr-book", text: "Трудовая книжка или сведения о трудовой деятельности", description: "Подтверждающие стаж работы в РФ по востребованной профессии не менее 6 месяцев." },
          { id: "vnzh-pr-sfr", text: "Выписка по лицевому счету из Социального фонда РФ (СФР)", description: "Документ, подтверждающий начисление страховых взносов работодателем за период работы." },
        ]
      },
      {
        title: "3. Справки и экзамены",
        items: [
          { id: "vnzh-pr-med", text: "Медицинский сертификат для ВНЖ", description: "ВИЧ, туберкулез, сифилис, тест на наркотики." },
          { id: "vnzh-pr-lang", text: "Сертификат о знании русского языка (уровень ВНЖ)", description: "Либо диплом РФ/СССР." },
        ]
      },
      {
        title: "4. Заявление и Оплата",
        items: [
          { id: "vnzh-pr-app", text: "Заявление о выдаче ВНЖ в 2-х экземплярах", description: "С заполнением разделов о работе." },
          { id: "vnzh-pr-fee", text: "Квитанция об оплате государственной пошлины (5000 руб.)", description: "Оплаченная квитанция." },
        ]
      }
    ]
  },
  "citizenship-simplified": {
    title: "Гражданство РФ в упрощенном порядке",
    fee: "Государственная пошлина: 3500 рублей. Подача осуществляется в ГУВМ МВД субъекта РФ.",
    groups: [
      {
        title: "1. Статус ВНЖ и Личные документы",
        items: [
          { id: "cit-s-vnzh", text: "Вид на жительство (ВНЖ) в РФ с регистрацией по месту жительства", description: "Оригинал книжки ВНЖ и копия всех страниц." },
          { id: "cit-s-pass", text: "Заграничный паспорт с нотариальным переводом", description: "Нотариальный перевод всех страниц." },
          { id: "cit-s-photo", text: "Фотографии 30x40 мм — 4 шт.", description: "Строго цветные или черно-белые, на матовой бумаге." },
        ]
      },
      {
        title: "2. Документы-основания для упрощения",
        items: [
          { id: "cit-s-ground", text: "Документы, дающие право на упрощенное гражданство", description: "Свидетельство о браке с гражданином РФ + паспорт супруга (срок брака от 3 лет, либо наличие общего ребенка), диплом РФ (для выпускников со стажем работы от 1 года), свидетельство участника программы соотечественников или ВНЖ по родителям/детям РФ." },
        ]
      },
      {
        title: "3. Знание языка и доходы",
        items: [
          { id: "cit-s-lang", text: "Документ, подтверждающий владение русским языком", description: "Сертификат о прохождении тестирования на гражданство РФ, либо советский аттестат/диплом, либо диплом РФ. От сдачи освобождаются лица старше пенсионного возраста." },
        ]
      },
      {
        title: "4. Заявление и Оплата",
        items: [
          { id: "cit-s-app", text: "Заявление о приеме в гражданство РФ — 2 экз.", description: "На новых бланках Указа Президента № 889." },
          { id: "cit-s-fee", text: "Квитанция об оплате государственной пошлины (3500 руб.)", description: "Оригинал квитанции." },
        ]
      }
    ]
  }
};

export default function ChecklistGeneratorPage() {
  const [selectedType, setSelectedType] = useState<string>("rvp-marriage");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load checklist checks from localStorage on mount/type change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`fms3_checklist_${selectedType}`);
      if (stored) {
        try {
          setCheckedItems(JSON.parse(stored));
        } catch {
          setCheckedItems({});
        }
      } else {
        setCheckedItems({});
      }
    }
  }, [selectedType]);

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      if (typeof window !== "undefined") {
        localStorage.setItem(`fms3_checklist_${selectedType}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleReset = () => {
    setCheckedItems({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(`fms3_checklist_${selectedType}`);
    }
  };

  const currentChecklist = CHECKLISTS[selectedType] || CHECKLISTS["rvp-marriage"];

  // Calculate progress
  const allItems = currentChecklist.groups.flatMap(g => g.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter(item => checkedItems[item.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center print:py-4">
      <div className="mb-8 print:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 dark:border-slate-800 relative bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 shadow-2xl print:border-0 print:bg-white print:p-0 print:shadow-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#02629f]/5 rounded-full blur-[80px] -z-10 print:hidden"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Генератор чек-листов документов
            </h1>
            <p className="text-slate-650 dark:text-slate-405 text-sm font-medium">
              Интерактивный список документов под ваш статус. Отмечайте готовые документы и распечатывайте список.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" /> Распечатать
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shadow-sm"
              title="Сбросить все отметки"
            >
              <RefreshCw className="w-4 h-4" /> Сбросить
            </button>
          </div>
        </div>

        {/* Selection Tab print:hidden */}
        <div className="mb-8 print:hidden">
          <label className="block text-xs font-bold text-slate-500 mb-2.5 uppercase">Выберите ваш статус:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 focus:outline-none focus:border-[#02629f] transition-colors font-bold text-sm text-[#02629f]"
          >
            <option value="rvp-marriage">РВП по браку</option>
            <option value="rvp-quota">РВП по квоте</option>
            <option value="vnzh-marriage">ВНЖ по близким родственникам (родители/дети)</option>
            <option value="vnzh-pension">ВНЖ для пенсионеров</option>
            <option value="vnzh-profession">ВНЖ по востребованной профессии (Минтруд)</option>
            <option value="citizenship-simplified">Гражданство РФ в упрощенном порядке</option>
          </select>
        </div>

        {/* Print Title Header */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Миграционный справочник — Чек-лист</h1>
          <p className="text-sm text-slate-600 mt-1">
            Список документов для статуса: <strong>{currentChecklist.title}</strong>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-5 print:hidden">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-[#02629f]" />
            <div>
              <strong className="block text-sm font-bold">Готовность документов</strong>
              <span className="text-xs text-slate-500 font-medium">Собрано {checkedCount} из {totalCount} элементов</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-[#02629f]">{progressPercent}%</span>
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#02629f] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Checklist Groups */}
        <div className="space-y-8">
          {currentChecklist.groups.map((group) => (
            <div key={group.title} className="print:break-inside-avoid">
              <h3 className="text-base font-extrabold text-[#02629f] border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
                {group.title}
              </h3>
              
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      checkedItems[item.id]
                        ? "border-emerald-250 bg-emerald-500/5 dark:bg-emerald-950/10"
                        : "border-slate-150/80 hover:bg-slate-50/40"
                    } print:border-slate-300 print:bg-white print:p-2.5`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => {}} // toggling handled on container click
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer print:w-4 print:h-4"
                    />
                    <div>
                      <strong className={`block text-sm font-bold leading-tight ${
                        checkedItems[item.id] ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-250"
                      } print:text-slate-900 print:no-underline`}>
                        {item.text}
                      </strong>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-normal print:text-slate-650">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* State fee information block */}
        <div className="mt-8 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/15 text-sm text-slate-700 dark:text-slate-300 leading-relaxed print:mt-6 print:border-slate-400">
          <strong className="block font-bold mb-1 text-slate-800 dark:text-slate-200">Информация об оплате:</strong>
          <p>{currentChecklist.fee}</p>
        </div>

        {/* Lead capturing section */}
        <div className="mt-12 border border-slate-250/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 bg-[#1f2c41] text-white print:hidden">
          <h3 className="text-xl font-extrabold mb-2">Возникли вопросы по оформлению справок?</h3>
          <p className="text-sm text-white/70 mb-6">
            Наши специалисты помогут заполнить бланки заявлений, проверят ваши документы на ошибки и проконсультируют по медкомиссии.
          </p>
          <LeadForm 
            sourceContext={`Checklist: ${currentChecklist.title}`}
            defaultQuestion={`Здравствуйте! Я готовлю пакет документов для статуса: ${currentChecklist.title}. Собрано ${checkedCount} из ${totalCount} документов. Нужна консультация по оформлению оставшихся документов и заполнению заявления.`}
          />
        </div>
      </div>
    </div>
  );
}
