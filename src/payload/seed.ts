import type { Payload } from "payload";
import type { DataTableDefinition, ToolDefinition } from "@/lib/no-code-runtime/types";

type ToolSeed = ToolDefinition & {
  executionMode: "runtime" | "provider";
  providerKey?: string;
  contentMarkdown: string;
  dataTableKeys?: string[];
};

const statusFields = [
  { key: "region", label: "Регион подачи", type: "select" as const, required: true, options: [{ value: "77", label: "Москва" }, { value: "50", label: "Московская область" }, { value: "78", label: "Санкт-Петербург" }, { value: "other", label: "Другой регион" }] },
  { key: "birthDate", label: "Дата рождения", type: "date" as const, required: true },
  { key: "documentNumber", label: "Номер документа", type: "text" as const, required: true, placeholder: "Введите номер по документу" },
];

const checklistItems: NonNullable<NonNullable<ToolDefinition["steps"]>[number]["checklistItems"]> = [
  { key: "rvp-m-pass", group: "РВП по браку · Личные документы", label: "Заграничный паспорт иностранного гражданина", description: "Срок действия паспорта — не менее 6 месяцев на момент подачи.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-trans", group: "РВП по браку · Личные документы", label: "Нотариально заверенный перевод всех страниц паспорта", description: "Переводятся все штампы и визы российским нотариусом.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-mig", group: "РВП по браку · Личные документы", label: "Миграционная карта и регистрация", description: "Оригиналы и копии действующих документов.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-photo", group: "РВП по браку · Личные документы", label: "Фотографии 35×45 мм — 4 шт.", description: "Цветные или чёрно-белые, на матовой бумаге.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-cert", group: "РВП по браку · Основание", label: "Свидетельство о заключении брака", description: "Для брака за границей нужны легализация/апостиль и перевод.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-spouse", group: "РВП по браку · Основание", label: "Паспорт супруга — гражданина РФ", description: "Копия страниц с отметками и подтверждением постоянной регистрации.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-child", group: "РВП по браку · Основание", label: "Подтверждение совместного проживания или общий ребёнок", description: "Подготовьте документы о совместном хозяйстве или свидетельство о рождении ребёнка.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-med", group: "РВП по браку · Справки", label: "Медицинское заключение", description: "ВИЧ-сертификат, справки из наркологии и КВД в уполномоченном медцентре.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-lang", group: "РВП по браку · Справки", label: "Сертификат о русском языке, истории и законах", description: "Не нужен при наличии советского аттестата или российского диплома.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-crim", group: "РВП по браку · Справки", label: "Справка об отсутствии судимости", description: "Для визовых стран — с легализацией/апостилем.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-app", group: "РВП по браку · Подача", label: "Заявление о выдаче РВП в 2 экземплярах", description: "Без сокращений и исправлений.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-m-fee", group: "РВП по браку · Подача", label: "Квитанция госпошлины 1600 рублей", description: "Реквизиты уточняйте в ММЦ/УМВД региона подачи.", condition: { operator: "equals", field: "procedure", value: "rvp-marriage" } },
  { key: "rvp-q-pass", group: "РВП по квоте · Личные документы", label: "Заграничный паспорт и нотариальный перевод", description: "Нужны все страницы паспорта.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-mig", group: "РВП по квоте · Личные документы", label: "Миграционная карта и регистрация", description: "С актуальным сроком действия.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-photo", group: "РВП по квоте · Личные документы", label: "Фотографии 35×45 мм — 4 шт.", description: "Матовые, без ретуши.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-decision", group: "РВП по квоте · Основание", label: "Решение о выделении квоты", description: "Уведомление УМВД региона об одобрении заявления.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-med", group: "РВП по квоте · Справки", label: "Комплексное медицинское заключение", description: "ВИЧ, туберкулёз, сифилис и наркомания.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-lang", group: "РВП по квоте · Справки", label: "Сертификат о знании русского языка", description: "Либо российский диплом/аттестат.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-crim", group: "РВП по квоте · Справки", label: "Справка об отсутствии судимости", description: "Для граждан визовых стран — с переводом и апостилем.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-app", group: "РВП по квоте · Подача", label: "Заявление о выдаче РВП в 2 экземплярах", description: "На стандартном бланке.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "rvp-q-fee", group: "РВП по квоте · Подача", label: "Квитанция госпошлины 1600 рублей", description: "Приложите оригинал платежного поручения.", condition: { operator: "equals", field: "procedure", value: "rvp-quota" } },
  { key: "vnzh-f-pass", group: "ВНЖ по родству · Личные документы", label: "Паспорт и нотариальный перевод", description: "Все страницы, заверенные российским нотариусом.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-mig", group: "ВНЖ по родству · Личные документы", label: "Миграционная карта и регистрация", description: "Оригиналы и копии.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-photo", group: "ВНЖ по родству · Личные документы", label: "Фотографии 35×45 мм — 4 шт.", description: "Матовые, на светлом фоне.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-child-cert", group: "ВНЖ по родству · Основание", label: "Свидетельство о рождении ребёнка — гражданина РФ", description: "Подтверждает родственную связь.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-parent-cert", group: "ВНЖ по родству · Основание", label: "Ваше свидетельство о рождении", description: "Для подачи по родителям-гражданам РФ; при необходимости легализуйте и переведите.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-relative-pass", group: "ВНЖ по родству · Основание", label: "Паспорт родственника — гражданина РФ", description: "Нужна отметка о постоянной регистрации в РФ.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-med", group: "ВНЖ по родству · Справки", label: "Медицинское заключение для ВНЖ", description: "Инфекции, наркомания и ВИЧ-инфекция.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-income", group: "ВНЖ по родству · Справки", label: "Подтверждение легального дохода", description: "2-НДФЛ, выписка из банка или пенсионное удостоверение.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-lang", group: "ВНЖ по родству · Справки", label: "Сертификат о знании русского языка", description: "Пенсионеры освобождаются от экзамена по возрасту.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-app", group: "ВНЖ по родству · Подача", label: "Заявление на выдачу ВНЖ — 2 экземпляра", description: "Укажите родственников и работу за последние 5 лет.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-f-fee", group: "ВНЖ по родству · Подача", label: "Квитанция госпошлины 5000 рублей", description: "Приложите оригинал чека.", condition: { operator: "equals", field: "procedure", value: "vnzh-marriage" } },
  { key: "vnzh-p-pass", group: "ВНЖ пенсионера · Личные документы", label: "Паспорт с нотариальным переводом", description: "Подготовьте все страницы.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-pension-cert", group: "ВНЖ пенсионера · Личные документы", label: "Пенсионное удостоверение с переводом", description: "Оригинал и копия документа из страны исхода.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-photo", group: "ВНЖ пенсионера · Личные документы", label: "Фотографии 35×45 мм — 4 шт.", description: "Матовые.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-child-birth", group: "ВНЖ пенсионера · Родство", label: "Свидетельство о рождении ребёнка — гражданина РФ", description: "Подтверждает родственную связь.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-child-pass", group: "ВНЖ пенсионера · Родство", label: "Паспорт ребёнка с регистрацией в РФ", description: "Копия паспорта с постоянной регистрацией.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-med", group: "ВНЖ пенсионера · Справки", label: "Медицинское заключение", description: "ВИЧ, туберкулёз и наркозависимость.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-pension-income", group: "ВНЖ пенсионера · Справки", label: "Справка о размере пенсии", description: "Из РФ или страны исхода.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-lang-ex", group: "ВНЖ пенсионера · Справки", label: "Документ об освобождении от экзамена", description: "По возрасту: мужчины от 65 лет, женщины от 60 лет.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-app", group: "ВНЖ пенсионера · Подача", label: "Заявление на ВНЖ в 2 экземплярах", description: "Укажите пенсионный статус.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-p-fee", group: "ВНЖ пенсионера · Подача", label: "Квитанция госпошлины 5000 рублей", description: "Оригинал квитанции.", condition: { operator: "equals", field: "procedure", value: "vnzh-pension" } },
  { key: "vnzh-pr-pass", group: "ВНЖ по профессии · Личные документы", label: "Паспорт и нотариальный перевод", description: "Подготовьте все страницы.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-mig", group: "ВНЖ по профессии · Личные документы", label: "Миграционная карта и регистрация", description: "Действующие бланки.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-photo", group: "ВНЖ по профессии · Личные документы", label: "Фотографии 35×45 мм — 4 шт.", description: "На матовой бумаге.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-diploma", group: "ВНЖ по профессии · Квалификация", label: "Диплом об образовании", description: "С нотариальным переводом при необходимости.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-book", group: "ВНЖ по профессии · Квалификация", label: "Трудовая книжка или сведения о трудовой деятельности", description: "Стаж в РФ по востребованной профессии — не менее 6 месяцев.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-sfr", group: "ВНЖ по профессии · Квалификация", label: "Выписка из лицевого счёта СФР", description: "Подтверждает страховые взносы работодателя.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-med", group: "ВНЖ по профессии · Справки", label: "Медицинский сертификат для ВНЖ", description: "ВИЧ, туберкулёз, сифилис и тест на наркотики.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-lang", group: "ВНЖ по профессии · Справки", label: "Сертификат о знании русского языка", description: "Либо диплом РФ/СССР.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-app", group: "ВНЖ по профессии · Подача", label: "Заявление на ВНЖ в 2 экземплярах", description: "Заполните разделы о работе.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "vnzh-pr-fee", group: "ВНЖ по профессии · Подача", label: "Квитанция госпошлины 5000 рублей", description: "Оплаченная квитанция.", condition: { operator: "equals", field: "procedure", value: "vnzh-profession" } },
  { key: "cit-s-vnzh", group: "Гражданство · Статус", label: "ВНЖ с регистрацией по месту жительства", description: "Оригинал книжки ВНЖ и копия страниц.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-pass", group: "Гражданство · Личные документы", label: "Заграничный паспорт с нотариальным переводом", description: "Перевод всех страниц.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-photo", group: "Гражданство · Личные документы", label: "Фотографии 30×40 мм — 4 шт.", description: "Цветные или чёрно-белые, на матовой бумаге.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-ground", group: "Гражданство · Основание", label: "Документы для упрощённого гражданства", description: "Брак, общий ребёнок, российский диплом, программа переселения или родство с гражданином РФ.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-lang", group: "Гражданство · Язык", label: "Документ о владении русским языком", description: "Сертификат, советский аттестат/диплом или диплом РФ.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-app", group: "Гражданство · Подача", label: "Заявление о приёме в гражданство РФ — 2 экземпляра", description: "Используйте актуальный бланк.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "cit-s-fee", group: "Гражданство · Подача", label: "Квитанция госпошлины 3500 рублей", description: "Оригинал квитанции.", condition: { operator: "equals", field: "procedure", value: "citizenship-simplified" } },
  { key: "patent-pass", group: "Патент · Документы", label: "Паспорт и нотариальный перевод", description: "Проверьте срок действия и все страницы.", condition: { operator: "equals", field: "procedure", value: "patent" } },
  { key: "patent-mig", group: "Патент · Документы", label: "Миграционная карта и регистрация", description: "С целью въезда «работа» и действующим сроком.", condition: { operator: "equals", field: "procedure", value: "patent" } },
  { key: "patent-med", group: "Патент · Справки", label: "Медицинское заключение и ДМС", description: "Уточните перечень уполномоченного миграционного центра.", condition: { operator: "equals", field: "procedure", value: "patent" } },
  { key: "patent-fee", group: "Патент · Оплата", label: "Квитанция авансового платежа", description: "Сумма зависит от региона и коэффициентов; проверьте актуальные реквизиты.", condition: { operator: "equals", field: "procedure", value: "patent" } },
];

const TOOL_SEEDS: ToolSeed[] = [
  {
    slug: "/tools/calculators",
    toolType: "calculator",
    executionMode: "runtime",
    title: "Миграционные калькуляторы",
    description: "Рассчитайте срок пребывания и ориентировочную стоимость патента по данным, которые можно менять в CMS.",
    eyebrow: "Расчёт",
    fields: [
      { key: "mode", label: "Что рассчитать", type: "radio", required: true, defaultValue: "stay", options: [{ value: "stay", label: "Срок пребывания 90/180" }, { value: "patent", label: "Стоимость патента" }] },
      { key: "entryDate", label: "Дата въезда", type: "date", required: true },
      { key: "allowedDays", label: "Разрешённое количество дней", type: "number", required: true, defaultValue: 90, min: 1, max: 180 },
      { key: "region", label: "Регион работы", type: "select", required: true, defaultValue: "Москва", options: [{ value: "Москва", label: "Москва" }, { value: "Московская область", label: "Московская область" }, { value: "Санкт-Петербург", label: "Санкт-Петербург" }, { value: "Краснодарский край", label: "Краснодарский край" }, { value: "Свердловская область", label: "Свердловская область" }, { value: "Новосибирская область", label: "Новосибирская область" }] },
      { key: "months", label: "Количество месяцев патента", type: "number", required: true, defaultValue: 1, min: 1, max: 12, step: 1 },
    ],
    formulas: [
      { key: "stayEnd", label: "Ориентировочная дата окончания", kind: "dateAddDays", left: { source: "field", field: "entryDate" }, days: { source: "field", field: "allowedDays" } },
      { key: "monthlyPrice", label: "Платёж за месяц", kind: "lookup", tableKey: "patent-regional-prices", lookupField: "region", lookupValue: { source: "field", field: "region" }, resultField: "monthly" },
      { key: "patentTotal", label: "Итоговый платёж", kind: "multiply", left: { source: "formula", formula: "monthlyPrice" }, right: { source: "field", field: "months" } },
    ],
    results: [
      { key: "stay", status: "info", title: "Ориентировочный срок пребывания", body: "При лимите {{allowedDays}} дней от даты въезда ориентировочная дата окончания — {{stayEnd}}. Фактический расчёт зависит от всех поездок и оснований пребывания.", condition: { operator: "equals", field: "mode", value: "stay" } },
      { key: "patent", status: "success", title: "Ориентировочная стоимость патента", body: "Платёж за {{months}} мес. в регионе «{{region}}»: {{patentTotal}} ₽. Проверьте актуальный коэффициент перед оплатой.", condition: { operator: "equals", field: "mode", value: "patent" } },
    ],
    uiCopy: { calculateLabel: "Рассчитать", resetLabel: "Новый расчёт", resultLabel: "Результат" },
    contentMarkdown: "Расчёты носят справочный характер. Изменяемые ставки и правила хранятся в таблицах данных Payload и могут обновляться редактором без изменения кода.\n\nДля правила 90/180 учитывайте все периоды пребывания в расчётном окне. Перед оплатой патента уточните сумму в регионе и реквизиты.",
    dataTableKeys: ["patent-regional-prices"],
  },
  {
    slug: "/tools/path-finder",
    toolType: "scenario",
    executionMode: "runtime",
    title: "Какой миграционный статус выбрать: онлайн-навигатор",
    description: "Ответьте на вопросы о гражданстве, семье, учёбе и работе — сценарий подберёт следующий шаг.",
    eyebrow: "Навигатор",
    fields: [
      { key: "citizenship", label: "Гражданство", type: "radio", required: true, options: [{ value: "cis", label: "Безвизовая страна СНГ" }, { value: "eeu", label: "ЕАЭС или особый статус" }, { value: "visa", label: "Визовая страна" }] },
      { key: "family", label: "Основание по семье", type: "radio", required: true, options: [{ value: "spouse", label: "Супруг — гражданин РФ" }, { value: "child", label: "Ребёнок — гражданин РФ" }, { value: "parent", label: "Родитель — гражданин РФ" }, { value: "none", label: "Нет" }] },
      { key: "education", label: "Учёба", type: "radio", required: true, options: [{ value: "normal", label: "Очное обучение в РФ" }, { value: "distinction", label: "Российский диплом с отличием" }, { value: "none", label: "Нет" }] },
      { key: "work", label: "Работа", type: "radio", required: true, options: [{ value: "vks", label: "Высококвалифицированный специалист" }, { value: "demanded", label: "Востребованная профессия" }, { value: "ordinary", label: "Обычная работа" }] },
      { key: "other", label: "Другие основания", type: "radio", required: true, options: [{ value: "repatriation", label: "Программа переселения соотечественников" }, { value: "none", label: "Нет" }] },
    ],
    steps: [
      { id: "citizenship", type: "question", title: "Гражданство какой страны у вас?", body: "Режим въезда и международные соглашения влияют на доступные основания.", fieldKey: "citizenship", required: true, nextStepId: "family" },
      { id: "family", type: "question", title: "Есть ли основание по семье?", fieldKey: "family", required: true, nextStepId: "education" },
      { id: "education", type: "question", title: "Есть ли основание по учёбе?", fieldKey: "education", required: true, nextStepId: "work" },
      { id: "work", type: "question", title: "Как выглядит ваша рабочая ситуация?", fieldKey: "work", required: true, nextStepId: "other" },
      { id: "other", type: "question", title: "Есть ли программа переселения или другое специальное основание?", fieldKey: "other", required: true, nextStepId: "result" },
      { id: "result", type: "result", title: "Результат подбора", body: "Сценарий собрал ответ по выбранным основаниям." },
    ],
    results: [
      { key: "repatriation", status: "success", title: "Проверьте программу переселения", body: "Участие в программе может дать РВП без квоты и упрощённый путь к гражданству.", condition: { operator: "equals", field: "other", value: "repatriation" }, links: [{ href: "/pathways/repatriation", label: "Инструкция по переселению" }] },
      { key: "family", status: "success", title: "Проверьте семейное основание", body: "Начните с инструкции по РВП или ВНЖ по семье.", condition: { operator: "in", field: "family", values: ["spouse", "child", "parent"] }, links: [{ href: "/pathways/vnzh/by-marriage", label: "Открыть семейную инструкцию" }] },
      { key: "education", status: "success", title: "Проверьте учебное основание", body: "Для очного обучения может подойти РВПО, а для отдельных выпускников — ВНЖ без РВП.", condition: { operator: "in", field: "education", values: ["normal", "distinction"] }, links: [{ href: "/pathways/rvpo", label: "Инструкция по РВПО" }] },
      { key: "work-special", status: "success", title: "Проверьте рабочее основание", body: "ВКС и востребованная профессия могут дать отдельный маршрут к ВНЖ.", condition: { operator: "in", field: "work", values: ["vks", "demanded"] }, links: [{ href: "/pathways/vnzh/without-rvp", label: "ВНЖ без РВП" }, { href: "/pathways/work/vks", label: "Правила для ВКС" }] },
      { key: "eeu", status: "success", title: "Проверьте порядок по гражданству", body: "Для граждан ЕАЭС и отдельных стран СНГ действуют специальные правила работы и оформления ВНЖ.", condition: { operator: "equals", field: "citizenship", value: "eeu" }, links: [{ href: "/pathways/vnzh/kazakhstan", label: "Инструкция по гражданству" }] },
      { key: "work", status: "info", title: "Сравните рабочие маршруты", body: "Для обычной работы проверьте патент, а для специальных категорий — ВНЖ и ВКС.", condition: { operator: "equals", field: "work", value: "ordinary" }, links: [{ href: "/pathways/work/patent", label: "Инструкция по патенту" }] },
      { key: "default", status: "warning", title: "Начните с проверки основания на РВП", body: "Если льготное основание не подтверждается, сравните квоту, визу и рабочий маршрут.", condition: { operator: "always" }, links: [{ href: "/pathways/rvp/quota", label: "Квота на РВП" }] },
    ],
    uiCopy: { nextLabel: "Дальше", resetLabel: "Пройти заново" },
    contentMarkdown: "Навигатор даёт предварительный ориентир, а не юридическое заключение. Основание подтверждается документами и проверяется подразделением МВД.\n\nЕсли обстоятельства изменились, запустите сценарий заново.",
  },
  {
    slug: "/tools/checklist-generator",
    toolType: "checklist",
    executionMode: "runtime",
    title: "Чек-лист миграционных документов онлайн",
    description: "Выберите процедуру и получите список документов с условиями отображения пунктов.",
    eyebrow: "Чек-лист",
    fields: [{ key: "procedure", label: "Процедура", type: "select", required: true, options: [{ value: "rvp-marriage", label: "РВП по браку" }, { value: "rvp-quota", label: "РВП по квоте" }, { value: "vnzh-marriage", label: "ВНЖ по близким родственникам" }, { value: "vnzh-pension", label: "ВНЖ для пенсионеров" }, { value: "vnzh-profession", label: "ВНЖ по востребованной профессии" }, { value: "citizenship-simplified", label: "Гражданство РФ в упрощённом порядке" }, { value: "patent", label: "Патент" }] }],
    steps: [
      { id: "procedure", type: "question", title: "Для какой процедуры нужен список?", fieldKey: "procedure", required: true, nextStepId: "documents" },
      { id: "documents", type: "checklist", title: "Отметьте готовые документы", body: "Список управляется редактором в Payload: новые пункты, группы и условия можно добавлять без изменения кода.", checklistItems, nextStepId: "result" },
      { id: "result", type: "result", title: "Чек-лист готов", body: "Отмечено документов: {{procedure}}." },
    ],
    results: [{ key: "done", status: "info", title: "Список документов подготовлен", body: "Проверьте каждый пункт и сверяйте актуальные требования перед подачей.", condition: { operator: "always" } }],
    uiCopy: { nextLabel: "Дальше", resetLabel: "Выбрать другую процедуру" },
    contentMarkdown: "Перечень документов зависит от основания, гражданства и региона подачи. Чек-лист помогает подготовиться, но не заменяет проверку требований МВД.\n\nРедактор может добавлять пункты, менять условия и создавать отдельные сценарии процедур в CMS.",
  },
  {
    slug: "/tools/check-passport",
    toolType: "checker",
    executionMode: "provider",
    providerKey: "simulation.passport",
    title: "Проверка действительности паспорта РФ онлайн",
    description: "Форматная демонстрационная проверка с переходом к официальным сервисам МВД.",
    fields: [{ key: "series", label: "Серия паспорта", type: "text", max: 4 }, { key: "number", label: "Номер паспорта", type: "text", required: true, max: 6 }],
    uiCopy: { calculateLabel: "Запустить проверку", resetLabel: "Проверить другой паспорт", loadingLabel: "Выполняем проверку…" },
    results: [],
    contentMarkdown: "Сторонний сайт не получает закрытый доступ к базам МВД. Результат инструмента носит справочный характер; для юридически значимой проверки используйте официальный сервис.",
  },
  ...(["check-rvp", "check-vnzh", "check-citizenship", "check-patent"] as const).map((slug) => ({
    slug: `/tools/${slug}`,
    toolType: "checker" as const,
    executionMode: "provider" as const,
    providerKey: "simulation.status-check",
    title: slug === "check-rvp" ? "Проверка готовности РВП онлайн" : slug === "check-vnzh" ? "Проверка готовности ВНЖ онлайн" : slug === "check-citizenship" ? "Проверка готовности гражданства РФ онлайн" : "Проверка готовности патента на работу онлайн",
    description: "Демонстрационный сценарий проверки данных заявления и переход к официальному источнику.",
    fields: statusFields,
    uiCopy: { calculateLabel: "Запросить сведения", resetLabel: "Проверить заново", loadingLabel: "Проверяем данные…" },
    results: [],
    contentMarkdown: "Этот инструмент не заменяет официальный ответ ведомства. Подготовьте данные заявления и затем перепроверьте статус через подразделение МВД или официальный сервис.",
  })),
  {
    slug: "/tools/document-check",
    toolType: "checker",
    executionMode: "provider",
    providerKey: "simulation.document-check",
    title: "Проверка миграционных документов",
    description: "Сценарий первичной проверки паспорта, патента или риска ограничения на въезд.",
    fields: [{ key: "documentType", label: "Документ", type: "select", required: true, options: [{ value: "passport", label: "Паспорт" }, { value: "patent", label: "Патент" }, { value: "ban", label: "Запрет на въезд" }] }, { key: "number", label: "Номер или идентификатор", type: "text", required: true }, { key: "region", label: "Регион", type: "text" }],
    uiCopy: { calculateLabel: "Проверить документ", resetLabel: "Проверить другой документ" },
    results: [],
    contentMarkdown: "Проверка помогает собрать данные и перейти к официальному источнику. Закрытые реестры МВД недоступны стороннему сайту.",
  },
  {
    slug: "/tools/ai-consultant",
    toolType: "ai",
    executionMode: "provider",
    providerKey: "ai.consultant",
    title: "ИИ-консультант по миграции",
    description: "Ответы по РВП, ВНЖ, гражданству и миграционным документам на основе локальной базы источников.",
    ai: { tone: "спокойно, структурированно и понятно", answerFormat: "Короткий вывод → применимые условия → документы и следующий шаг.", maxSources: 4, maxTokens: 1200 },
    uiCopy: { emptyLabel: "Опишите свою ситуацию" },
    contentMarkdown: "Задайте вопрос о РВП, ВНЖ, гражданстве, патенте, регистрации или документах. Ответ формируется по базе официальных материалов и не заменяет индивидуальную юридическую консультацию.\n\nРедактор может менять системную инструкцию, тон, формат ответа и фильтры источников в CMS.",
  },
];

export const DATA_TABLE_SEEDS: DataTableDefinition[] = [{
  key: "patent-regional-prices",
  title: "Ориентировочная стоимость патента по регионам",
  columns: [{ key: "region", label: "Регион", type: "text" }, { key: "monthly", label: "Платёж в месяц", type: "currency" }],
  rows: ["Москва", "Московская область", "Санкт-Петербург", "Краснодарский край", "Свердловская область", "Новосибирская область"].map((region, index) => ({ key: region.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-"), values: { region, monthly: [7500, 7500, 4600, 8100, 6900, 6200][index] } })),
}];

export const RULE_TEST_SEEDS = [
  { name: "Калькулятор патента: Москва × 2 месяца", toolSlug: "/tools/calculators", answers: { mode: "patent", entryDate: "2026-09-01", allowedDays: 90, region: "Москва", months: 2 }, expectedStatus: "success", expectedValues: { monthlyPrice: 7500, patentTotal: 15000 } },
  { name: "Калькулятор пребывания: базовый сценарий", toolSlug: "/tools/calculators", answers: { mode: "stay", entryDate: "2026-09-01", allowedDays: 90, region: "Москва", months: 1 }, expectedStatus: "info" },
] as const;

const SITE_SETTINGS_SEED = {
  siteName: "Миграционный справочник",
  siteDescription: "Понятные инструкции для иностранных граждан о жизни, работе и оформлении документов в России.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ufms-help.ru",
  defaultTitle: "Миграционный справочник — РВП, ВНЖ, гражданство и работа",
  defaultDescription: "Понятные инструкции для иностранных граждан: переезд в Россию, РВП, ВНЖ, гражданство, работа, документы, сроки и онлайн-проверки.",
  partnerPhone: process.env.NEXT_PUBLIC_PARTNER_PHONE || "8 (800) 350-84-13",
  organizationName: "Миграционный справочник",
  organizationDescription: "Независимый информационный справочник по миграционным процедурам в России.",
};

export { TOOL_SEEDS };

async function upsert(payload: Payload, collection: "tools" | "data-tables", whereField: string, whereValue: string, data: Record<string, unknown>, force = false) {
  const existing = await payload.find({ collection, limit: 1, where: { [whereField]: { equals: whereValue } }, overrideAccess: true });
  if (existing.docs[0] && !force) return existing.docs[0];
  if (existing.docs[0]) return payload.update({ collection, id: existing.docs[0].id, data, overrideAccess: true });
  return payload.create({ collection, data, overrideAccess: true });
}

function plainMarkdownToLexical(markdown: string) {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      type: "paragraph",
      version: 1,
      format: "",
      indent: 0,
      direction: "ltr",
      children: [{ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 }],
    }));

  return { root: { type: "root", version: 1, format: "", indent: 0, direction: "ltr", children: paragraphs } };
}

export async function seedPayload(payload: Payload, force = false) {
  for (const table of DATA_TABLE_SEEDS) {
    await upsert(payload, "data-tables", "key", table.key, { ...table, sourceKey: `seed:${table.key}`, sourceTitle: "Стартовые данные проекта", _status: "published" }, force);
  }

  for (const seed of TOOL_SEEDS) {
    const { contentMarkdown, steps: runtimeSteps, ...tool } = seed;
    const steps = runtimeSteps?.map(({ id: stepId, ...step }) => ({ ...step, stepId }));
    const content = plainMarkdownToLexical(contentMarkdown);
    await upsert(payload, "tools", "slug", seed.slug, { ...tool, ...(steps ? { steps } : {}), content, legacyMarkdown: contentMarkdown, sourceKey: `seed:${seed.slug}`, _status: "published" }, force);
  }

  for (const test of RULE_TEST_SEEDS) {
    const tool = await payload.find({ collection: "tools", limit: 1, where: { slug: { equals: test.toolSlug } }, overrideAccess: true });
    if (!tool.docs[0]) continue;
    const existing = await payload.find({ collection: "rule-test-cases", limit: 1, where: { name: { equals: test.name } }, overrideAccess: true });
    const data = { ...test, tool: tool.docs[0].id, sourceKey: `seed:${test.name}`, _status: "published" };
    if (existing.docs[0] && !force) continue;
    if (existing.docs[0]) await payload.update({ collection: "rule-test-cases", id: existing.docs[0].id, data, overrideAccess: true });
    else await payload.create({ collection: "rule-test-cases", data, overrideAccess: true });
  }

  const currentSettings = await payload.findGlobal({ slug: "site-settings", draft: true, overrideAccess: true });
  const hasSettings = Boolean(currentSettings.siteName && currentSettings.siteDescription && currentSettings.siteUrl && currentSettings.defaultTitle && currentSettings.defaultDescription);
  if (force || !hasSettings) {
    await payload.updateGlobal({ slug: "site-settings", data: SITE_SETTINGS_SEED, overrideAccess: true });
  }
}
