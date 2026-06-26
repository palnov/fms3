"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, ShieldCheck, Sparkles, GraduationCap, BriefcaseBusiness, Users, MapPinned } from "lucide-react";
import LeadForm from "@/components/forms/LeadForm";

type CitizenshipType = "cis" | "eeu" | "visa" | "";
type FamilyType = "spouse" | "child" | "parent" | "none" | "";
type EducationType = "distinction" | "normal" | "none" | "";
type WorkType = "vks" | "demanded" | "normal" | "none" | "";
type ResettlementType = "repatriation" | "none" | "";

interface QuizState {
  citizenship: CitizenshipType;
  family: FamilyType;
  education: EducationType;
  work: WorkType;
  other: ResettlementType;
}

export default function PathFinderPage() {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizState>({
    citizenship: "",
    family: "",
    education: "",
    work: "",
    other: "",
  });

  const handleSelect = (field: keyof QuizState, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const resetQuiz = () => {
    setAnswers({
      citizenship: "",
      family: "",
      education: "",
      work: "",
      other: "",
    });
    setStep(1);
  };

  // Determine path recommendations
  const getRecommendation = () => {
    const { citizenship, family, education, work, other } = answers;

    // 1. Repatriation / Resettlement
    if (other === "repatriation") {
      return {
        title: "Госпрограмма переселения соотечественников (Репатриация)",
        badge: "Самый быстрый путь к Гражданству РФ",
        desc: "Как соотечественник, вы можете подать заявление на участие в Госпрограмме. Это дает право получить РВП без квоты, а затем подать на гражданство РФ в упрощенном порядке.",
        steps: [
          "Подать заявление на участие в программе переселения (в консульстве РФ в вашей стране или в МВД в РФ).",
          "Получить свидетельство участника Государственной программы.",
          "Оформить РВП без учета квоты.",
          "Подать заявление на гражданство РФ сразу после получения РВП и регистрации."
        ],
        details: "В 2026 году требования к подтверждению статуса соотечественника (особенно репатриантов) были упрощены, допускается подтверждение родства по прямой восходящей линии.",
        links: [
          { label: "Инструкция по переселению соотечественников", href: "/pathways/repatriation" }
        ],
        fee: "Госпошлина за РВП: 1600 руб. Участие в программе бесплатно, предоставляются подъемные."
      };
    }

    // 2. Family - Child or Parent (Direct VNJ)
    if (family === "child" || family === "parent") {
      return {
        title: "Вид на жительство (ВНЖ) по близким родственникам",
        badge: "Упрощенный ВНЖ без РВП",
        desc: "Наличие дееспособных детей или родителей, имеющих гражданство РФ и постоянную регистрацию на территории России, дает право получить ВНЖ напрямую, минуя стадию РВП.",
        steps: [
          "Собрать документы, подтверждающие родственную связь (свидетельства о рождении, браке).",
          "Пройти медицинское освидетельствование на отсутствие опасных заболеваний.",
          "Подать заявление на ВНЖ в ГУВМ МВД.",
          "Получить ВНЖ через 3–4 месяца и оформить регистрацию."
        ],
        details: "Пенсионеры (мужчины от 65 лет и женщины от 60 лет) полностью освобождаются от экзамена по русскому языку. В 2026 году госпошлина составляет 5000 руб.",
        links: [
          { label: "Руководство по получению ВНЖ", href: "/pathways/vnzh" },
          { label: "ВНЖ для пенсионеров и нетрудоспособных", href: "/pathways/vnzh/without-rvp" }
        ],
        fee: "Госпошлина: 5000 руб. (срок действия ВНЖ — бессрочно)."
      };
    }

    // 3. Family - Spouse (RVP by marriage)
    if (family === "spouse") {
      return {
        title: "Разрешение на временное проживание (РВП) по браку",
        badge: "Упрощенный статус",
        desc: "Зарегистрированный брак с гражданином РФ, имеющим постоянную регистрацию, дает право получить РВП без квоты.",
        steps: [
          "Собрать личные документы и паспорт супруга-гражданина РФ.",
          "Подготовить документы, подтверждающие совместное проживание, или свидетельство о рождении общего ребенка (новое правило 2025-2026 гг).",
          "Пройти медкомиссию и сдать экзамен на знание русского языка.",
          "Подать документы в ГУВМ МВД по месту жительства супруга.",
          "Через 2 года проживания в браке (или сразу при наличии общего ребенка) вы сможете подать на ВНЖ."
        ],
        details: "ВНИМАНИЕ: Для борьбы с фиктивными браками с недавнего времени для подачи на РВП требуется подтвердить ведение совместного хозяйства или наличие общего ребенка в браке.",
        links: [
          { label: "Инструкция по РВП по браку", href: "/pathways/rvp/marriage" }
        ],
        fee: "Госпошлина за РВП: 1600 руб. Срок рассмотрения: около 2-3 месяцев."
      };
    }

    // 4. Education - Distinction (Direct VNJ)
    if (education === "distinction") {
      return {
        title: "Вид на жительство (ВНЖ) по «красному» диплому РФ",
        badge: "Прямой ВНЖ для отличников",
        desc: "Иностранные граждане, успешно окончившие российский вуз по очной форме обучения и получившие диплом с отличием, имеют право оформить ВНЖ минуя РВП.",
        steps: [
          "Подготовить оригинал диплома с отличием и приложения к нему.",
          "Пройти медицинское освидетельствование.",
          "Подтвердить доход и жилье (если проживаете в РФ более 3 лет).",
          "Подать заявление на ВНЖ напрямую в МВД."
        ],
        details: "Вы полностью освобождаетесь от экзамена по русскому языку, так как окончили российское государственное учебное заведение.",
        links: [
          { label: "ВНЖ без РВП: категории выпускников", href: "/pathways/vnzh/without-rvp" }
        ],
        fee: "Госпошлина: 5000 руб."
      };
    }

    // 5. Work - VKS or Demanded Profession
    if (work === "vks" || work === "demanded") {
      const isVks = work === "vks";
      return {
        title: isVks ? "ВНЖ для высококвалифицированных специалистов (ВКС)" : "ВНЖ по востребованной профессии из списка Минтруда",
        badge: isVks ? "Премиальный рабочий статус" : "ВНЖ по квалификации",
        desc: isVks
          ? "Высококвалифицированные специалисты с заработной платой от 250 тыс. рублей в месяц имеют право оформить ВНЖ на срок действия их разрешения на работу."
          : "Если вы работаете в РФ не менее 6 месяцев по профессии из перечня Минтруда (врачи, инженеры, токари, IT-специалисты), вы можете подать заявление на ВНЖ без РВП.",
        steps: [
          "Подтвердить официальный стаж работы в РФ по специальности от 6 месяцев (для востребованных профессий) с отчислениями в СФР.",
          "Предоставить трудовой договор, трудовую книжку и справку 2-НДФЛ.",
          "Пройти медкомиссию.",
          "Подать заявление на ВНЖ."
        ],
        details: "Члены семьи ВКС также имеют право получить ВНЖ на аналогичный срок.",
        links: [
          { label: "ВНЖ по профессии", href: "/pathways/vnzh/without-rvp" },
          { label: "ВКС в России: правила и льготы", href: "/pathways/work/vks" }
        ],
        fee: "Госпошлина: 5000 руб."
      };
    }

    // 6. EAEU Citizenship (Direct VNJ or simplified RVP)
    if (citizenship === "eeu") {
      return {
        title: "ВНЖ для граждан ЕАЭС / Молдовы / Украины",
        badge: "Упрощенный порядок по гражданству",
        desc: "Граждане некоторых государств (Казахстан, Молдова, Беларусь) имеют право подать заявление на ВНЖ напрямую без РВП. Для граждан других стран ЕАЭС (Кыргызстан, Армения) процедура оформления патента не требуется, они могут легально работать по трудовому договору.",
        steps: [
          "Оформить трудовой договор (для Киргизии/Армении) или сразу готовить документы на ВНЖ (для Казахстана/Молдовы).",
          "Пройти обязательную дактилоскопию и фотографирование в МВД.",
          "Пройти медицинское освидетельствование.",
          "Подать документы на ВНЖ по гражданству в ГУВМ МВД."
        ],
        details: "Граждане Беларуси имеют максимальные преференции и полностью освобождаются от большинства стандартных миграционных процедур (включая сдачу отпечатков пальцев и медкомиссию).",
        links: [
          { label: "ВНЖ для граждан Казахстана", href: "/pathways/vnzh/kazakhstan" },
          { label: "ВНЖ для граждан Беларуси", href: "/pathways/citizenship/belarus" }
        ],
        fee: "Госпошлина: 5000 руб."
      };
    }

    // 7. Regular Education
    if (education === "normal") {
      return {
        title: "Разрешение на временное проживание в целях получения образования (РВПО)",
        badge: "Для студентов российских вузов",
        desc: "Студенты очной формы обучения в государственных вузах РФ могут получить РВПО на весь срок обучения плюс 180 дней после выпуска.",
        steps: [
          "Получить справку об обучении в деканате вуза.",
          "Пройти медицинское освидетельствование.",
          "Подать заявление на РВПО.",
          "После окончания обучения вы сможете подать документы на ВНЖ напрямую в течение 3 лет после выпуска."
        ],
        details: "РВПО не требует подтверждения дохода и сдачи экзамена по языку.",
        links: [
          { label: "Правила оформления РВПО", href: "/pathways/rvp" }
        ],
        fee: "Госпошлина: 1600 руб."
      };
    }

    // 8. CIS visa-free (Work Patent)
    if (citizenship === "cis") {
      return {
        title: "Оформление патента на работу в РФ",
        badge: "Трудовая легализация",
        desc: "Поскольку у вас нет прямых семейных или профессиональных оснований для ВНЖ/РВП, основным законным способом пребывания в РФ для работы является оформление Патента.",
        steps: [
          "В течение 30 дней с момента въезда в РФ пройти медицинский осмотр.",
          "Сдать комплексный экзамен по русскому языку, истории и праву.",
          "Оформить полис добровольного медицинского страхования (ДМС).",
          "Подать заявление на патент в миграционный центр (например, ММЦ Сахарово в Москве).",
          "Ежемесячно оплачивать авансовый платеж по патенту для продления его действия."
        ],
        details: "В 2026 году стоимость патента варьируется от региона к региону (в Москве и области составляет 7500 рублей в месяц).",
        links: [
          { label: "Инструкция по оформлению патента", href: "/pathways/work/patent" },
          { label: "Расчет стоимости патента по регионам", href: "/tools/calculators" }
        ],
        fee: "Оформление: около 15 000 руб (перевод, экзамен, медкомиссия) + ежемесячный платеж."
      };
    }

    // 9. Default case: RVP by Quota / Visa
    return {
      title: "Выделение квоты на РВП (или оформление Визы)",
      badge: "Базовый сценарий легализации",
      desc: "При отсутствии льгот и оснований, гражданам визовых стран необходимо получить квоту Правительства РФ на выдачу РВП либо въехать по рабочей/учебной визе.",
      steps: [
        "Подать заявление-анкету на выделение квоты на РВП в Управление МВД вашего региона.",
        "Комиссия рассматривает заявления ежемесячно, оценивая ваше образование, стаж работы, жилье и правопослушность.",
        "В случае выделения квоты — подать документы на оформление РВП.",
        "В случае отказа — подавать анкету повторно в следующем месяце."
      ],
      details: "Количество квот ежегодно сокращается. Для визовых стран требуется обязательное предоставление справки об отсутствии судимости с легализацией/апостилем.",
      links: [
        { label: "Квота на РВП: критерии отбора", href: "/pathways/rvp/quota" }
      ],
      fee: "Подача заявления на квоту бесплатна. Госпошлина за РВП после одобрения: 1600 руб."
    };
  };

  const rec = step === 6 ? getRecommendation() : null;

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden bg-white/70 backdrop-blur-xl dark:bg-slate-900/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] -z-10"></div>
        
        {step < 6 && (
          <div className="flex justify-between items-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff2e32]">
              Шаг {step} из 5
            </span>
            <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#02629f] transition-all duration-350"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step 1: Citizenship */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <MapPinned className="h-6 w-6 text-[#02629f]" /> Гражданство какой страны вы имеете?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              Это определит режим въезда в РФ (визовый или безвизовый) и наличие базовых преференций по международным договорам.
            </p>

            <div className="grid gap-3">
              {[
                { key: "cis", title: "Безвизовые страны СНГ", desc: "Узбекистан, Таджикистан, Азербайджан, Молдова и др." },
                { key: "eeu", title: "Страны ЕАЭС и особые статусы", desc: "Беларусь, Казахстан, Армения, Кыргызстан" },
                { key: "visa", title: "Визовые страны", desc: "Страны Европы, Азии, Америки, Африки" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect("citizenship", opt.key as CitizenshipType)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    answers.citizenship === opt.key
                      ? "border-[#02629f] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#02629f]/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <strong className="block text-base font-bold text-slate-850 dark:text-slate-200">{opt.title}</strong>
                  <span className="text-xs text-slate-500 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Family */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-[#02629f]" /> Есть ли у вас близкие родственники - граждане РФ?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              Родственные связи являются наиболее сильным основанием для ускоренного получения РВП и ВНЖ в России.
            </p>

            <div className="grid gap-3">
              {[
                { key: "spouse", title: "Муж или жена — граждане РФ", desc: "С постоянной регистрацией на территории России" },
                { key: "child", title: "Дети — граждане РФ", desc: "Совершеннолетние дееспособные сын или дочь" },
                { key: "parent", title: "Родители — граждане РФ", desc: "Отец или мать с постоянной регистрацией в РФ" },
                { key: "none", title: "Нет близких родственников граждан РФ", desc: "Родственники отсутствуют или не имеют гражданства" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect("family", opt.key as FamilyType)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    answers.family === opt.key
                      ? "border-[#02629f] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#02629f]/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <strong className="block text-base font-bold text-slate-850 dark:text-slate-200">{opt.title}</strong>
                  <span className="text-xs text-slate-500 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#02629f]" /> Оканчивали ли вы учебные заведения в РФ?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              Выпускники российских колледжей и вузов имеют государственные льготы при легализации.
            </p>

            <div className="grid gap-3">
              {[
                { key: "distinction", title: "Российский вуз с отличием (Красный диплом)", desc: "Государственная аккредитация, очная форма обучения" },
                { key: "normal", title: "Обычный диплом вуза или колледжа РФ / Сейчас учусь", desc: "Аккредитованная программа в РФ" },
                { key: "none", title: "Иностранное образование или нет диплома", desc: "Окончил учебное заведение за пределами России или не имею диплома" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect("education", opt.key as EducationType)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    answers.education === opt.key
                      ? "border-[#02629f] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#02629f]/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <strong className="block text-base font-bold text-slate-850 dark:text-slate-200">{opt.title}</strong>
                  <span className="text-xs text-slate-500 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Work */}
        {step === 4 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <BriefcaseBusiness className="h-6 w-6 text-[#02629f]" /> Какова ваша профессиональная ситуация?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              РФ привлекает квалифицированных специалистов, предлагая им упрощенный ВНЖ по специальности.
            </p>

            <div className="grid gap-3">
              {[
                { key: "vks", title: "Являюсь высококвалифицированным специалистом (ВКС)", desc: "Зарплата от 250 000 руб/мес, разрешение на работу ВКС" },
                { key: "demanded", title: "Моя профессия есть в списке Минтруда РФ", desc: "Врачи, инженеры, IT-специалисты, квалифицированные рабочие" },
                { key: "normal", title: "Обычная трудовая деятельность в РФ", desc: "Работаю по патенту, обычному договору или разрешению" },
                { key: "none", title: "Не работаю в РФ / Другое", desc: "Временно не работаю или планирую только переезд" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect("work", opt.key as WorkType)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    answers.work === opt.key
                      ? "border-[#02629f] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#02629f]/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <strong className="block text-base font-bold text-slate-850 dark:text-slate-200">{opt.title}</strong>
                  <span className="text-xs text-slate-500 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Other */}
        {step === 5 && (
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#02629f]" /> Относитесь ли вы к категории соотечественников?
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
              Бывшие граждане СССР, лица с русскими корнями или родственниками, проживавшими на территории РСФСР, могут воспользоваться репатриацией.
            </p>

            <div className="grid gap-3">
              {[
                { key: "repatriation", title: "Да, подхожу под программу репатриации / переселения соотечественников", desc: "Имею предков, проживавших в границах РФ/СССР, или говорю на русском как родном" },
                { key: "none", title: "Нет, данные основания не применимы к моей ситуации", desc: "У меня нет исторических или национальных корней в России" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelect("other", opt.key as ResettlementType)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    answers.other === opt.key
                      ? "border-[#02629f] bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-[#02629f]/30"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50/50"
                  }`}
                >
                  <strong className="block text-base font-bold text-slate-850 dark:text-slate-200">{opt.title}</strong>
                  <span className="text-xs text-slate-500 mt-1 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Screen */}
        {step === 6 && rec && (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-150 text-[#02629f] font-bold text-xs uppercase tracking-wide mb-4">
              <ShieldCheck className="w-4 h-4" /> {rec.badge}
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-850 dark:text-slate-100">
              Ваш оптимальный путь: <br/><span className="text-[#02629f]">{rec.title}</span>
            </h1>
            
            <p className="text-slate-650 dark:text-slate-350 font-medium mb-8 leading-relaxed">
              {rec.desc}
            </p>

            <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/20 mb-8">
              <h3 className="font-extrabold text-lg mb-4 text-slate-800 dark:text-slate-200">Пошаговый план действий:</h3>
              <ol className="space-y-3.5 list-decimal pl-5 text-sm text-slate-700 dark:text-slate-305 leading-relaxed">
                {rec.steps.map((s, idx) => (
                  <li key={idx} className="pl-1">
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            {rec.details && (
              <div className="flex gap-3 rounded-2xl bg-amber-500/7 border border-amber-500/20 p-5 text-sm text-amber-800 dark:text-amber-200 mb-8">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <strong className="block font-bold mb-1">Важные детали на 2026 год:</strong>
                  <p className="leading-relaxed">{rec.details}</p>
                  <p className="mt-2 font-semibold text-xs text-amber-700 dark:text-amber-300">{rec.fee}</p>
                </div>
              </div>
            )}

            {rec.links && rec.links.length > 0 && (
              <div className="mb-10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Связанные руководства</h4>
                <div className="grid gap-2">
                  {rec.links.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#02629f]/40 hover:bg-slate-50/30 text-sm font-bold transition-all text-[#02629f]"
                    >
                      {link.label}
                      <ArrowRight className="w-4 h-4 text-[#ff2e32]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Lead Capturing integration */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 bg-[#1f2c41] text-white">
              <h3 className="text-xl font-extrabold mb-2">Требуется помощь в оценке шансов?</h3>
              <p className="text-sm text-white/70 mb-6">
                Наши юристы бесплатно проверят ваши основания по ФЗ-115 и проконсультируют по подготовке документов. Оставьте контакты для экспресс-разбора:
              </p>
              <LeadForm 
                sourceContext={`PathFinder: ${rec.title}`} 
                defaultQuestion={`Здравствуйте, я прошел опрос на сайте. Мой оптимальный статус показан как: ${rec.title}. Мое гражданство: ${answers.citizenship === "cis" ? "СНГ" : answers.citizenship === "eeu" ? "ЕАЭС" : "Визовая страна"}. Помогите оценить шансы и составить точный список документов.`}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={resetQuiz} 
                className="button-secondary text-sm font-bold cursor-pointer"
              >
                Пройти квиз заново
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {step < 6 && (
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-850 flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
            >
              Назад
            </button>
            
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && !answers.citizenship) ||
                (step === 2 && !answers.family) ||
                (step === 3 && !answers.education) ||
                (step === 4 && !answers.work) ||
                (step === 5 && !answers.other)
              }
              className="button-primary font-bold transition-all text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#ff2e32]"
            >
              Дальше <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
