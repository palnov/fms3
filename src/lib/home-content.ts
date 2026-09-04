export type HomeIconKey = "users" | "briefcase" | "graduation" | "house" | "map" | "compass" | "bot" | "list" | "calculator" | "shield" | "file";
export type HomeBlueprintType = "path" | "knowledge" | "documents" | "calendar";

export type HomeContent = {
  heroEyebrow: string;
  heroTitleLines: string[];
  heroLead: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  trustItems: Array<{ title: string; text: string }>;
  situationsEyebrow: string;
  situationsTitle: string;
  situationsText: string;
  situations: Array<{ icon: HomeIconKey; title: string; text: string; href: string }>;
  statusesEyebrow: string;
  statusesTitle: string;
  statusesText: string;
  statusPrimary: { label: string; title: string; text: string; linkLabel: string; href: string };
  statusSteps: Array<{ number: string; title: string; text: string; href: string }>;
  statusLegalLabel: string;
  statusLegalTitle: string;
  statusLegalHref: string;
  updatesEyebrow: string;
  updatesTitle: string;
  updatesText: string;
  updates: Array<{ date: string; dateTime?: string; title: string; text: string; href: string }>;
  toolsEyebrow: string;
  toolsTitle: string;
  toolsText: string;
  tools: Array<{ icon: HomeIconKey; diagram: HomeBlueprintType; label: string; title: string; text: string; href: string; featured?: boolean }>;
  checksEyebrow: string;
  checksTitle: string;
  checks: Array<{ icon: HomeIconKey; title: string; text: string; href: string }>;
  guidesEyebrow: string;
  featuredGuideTitle: string;
  featuredGuideText: string;
  featuredGuideHref: string;
  guidesLabel: string;
  guides: Array<{ href: string; title: string }>;
  helpEyebrow: string;
  helpTitle: string;
  helpText: string;
  helpHref: string;
  helpLabel: string;
  faqEyebrow: string;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow: "Миграционное право · редакция 2026",
  heroTitleLines: ["Как жить", "и работать", "в России", "законно"],
  heroLead: "Понятные инструкции для иностранных граждан: как приехать, оформить документы и остаться в России.",
  heroPrimaryLabel: "Выбрать свою ситуацию",
  heroPrimaryHref: "#situations",
  heroSecondaryLabel: "Посмотреть инструкции",
  heroSecondaryHref: "/pathways",
  trustItems: [
    { title: "2026", text: "актуальная редакция" },
    { title: "115-ФЗ", text: "правовые основания" },
    { title: "89 регионов", text: "местные особенности" },
    { title: "Без оплаты", text: "материалы и сервисы" },
  ],
  situationsEyebrow: "Начните с главного",
  situationsTitle: "Выберите свою ситуацию",
  situationsText: "Семья, работа, учёба, переезд или оформление без льгот. Мы подскажем, что можно оформить и с чего начать.",
  situations: [
    { icon: "users", title: "Семья в России", text: "Супруг, дети или родители — граждане РФ", href: "/pathways/vnzh/by-marriage" },
    { icon: "briefcase", title: "Работа и профессия", text: "Патент, квалификация и востребованная специальность", href: "/pathways/work/patent" },
    { icon: "graduation", title: "Учёба в России", text: "РВПО и оформление после российского диплома", href: "/pathways/rvpo" },
    { icon: "house", title: "Соотечественники", text: "Переселение, репатриация и упрощённое оформление", href: "/pathways/repatriation" },
    { icon: "map", title: "Другой случай", text: "Квота на РВП и оформление без льгот", href: "/pathways/rvp/quota" },
  ],
  statusesEyebrow: "РВП, ВНЖ и гражданство",
  statusesTitle: "Что можно оформить для жизни в России",
  statusesText: "Выберите нужный документ и узнайте требования, сроки и порядок оформления.",
  statusPrimary: { label: "Главный кластер", title: "Вид на жительство", text: "Основания, документы, сроки, обязанности после получения и частые ошибки.", linkLabel: "Как получить ВНЖ", href: "/pathways/vnzh" },
  statusSteps: [
    { number: "01", title: "РВП", text: "Квота, брак и другие основания для временного проживания.", href: "/pathways/rvp" },
    { number: "02", title: "Гражданство", text: "Общий и упрощённый порядок, требования и документы.", href: "/pathways/citizenship" },
    { number: "03", title: "Работа и патент", text: "Оформление, оплата и контроль сроков.", href: "/pathways/work/patent" },
    { number: "04", title: "Переселение", text: "Программа для соотечественников и репатриация.", href: "/pathways/repatriation" },
  ],
  statusLegalLabel: "Отдельный вопрос",
  statusLegalTitle: "Запреты, легальность и реестр контролируемых лиц",
  statusLegalHref: "/legal/check-ban",
  updatesEyebrow: "Следим за изменениями",
  updatesTitle: "Что важно проверить в 2026 году",
  updatesText: "Перед подачей документов сверяйте форму, сроки и региональные требования.",
  updates: [
    { date: "11 июня 2026", dateTime: "2026-06-11", title: "Формы заявлений и порядок подачи", text: "Перед обращением проверяйте действующую форму и требования подразделения МВД.", href: "/pathways/vnzh/documents" },
    { date: "2026 год", title: "Срок временного пребывания", text: "Разбираем, как считать разрешённые дни и какие статусы меняют общий порядок.", href: "/tools/calculators" },
    { date: "Актуальный разбор", title: "Реестр контролируемых лиц", text: "Что означает включение в реестр и где проверять официальную информацию.", href: "/legal/controlled-persons-register" },
  ],
  toolsEyebrow: "Практические сервисы",
  toolsTitle: "Узнайте, какие документы вам нужны",
  toolsText: "Ответьте на несколько вопросов, проверьте сроки и соберите документы для подачи.",
  tools: [
    { icon: "compass", diagram: "path", label: "С чего начать", title: "Подобрать документы и порядок действий", text: "Ответьте на несколько вопросов. Сервис подскажет, что можно оформить, какие документы собрать и что делать дальше.", href: "/tools/path-finder", featured: true },
    { icon: "bot", diagram: "knowledge", label: "ИИ-помощник", title: "Найти ответ в базе", text: "Ответы по ФЗ-115, ФЗ-138 и миграционным документам со ссылками на материалы.", href: "/tools/ai-consultant" },
    { icon: "list", diagram: "documents", label: "Чек-листы", title: "Собрать документы", text: "Персональные списки документов с отметками готовности к подаче.", href: "/tools/checklist-generator" },
    { icon: "calculator", diagram: "calendar", label: "Расчёт", title: "Посчитать сроки", text: "Калькуляторы пребывания 90/180 и стоимости трудового патента.", href: "/tools/calculators" },
  ],
  checksEyebrow: "Официальные проверки",
  checksTitle: "Документы и готовность решений",
  checks: [
    { icon: "shield", title: "Паспорт РФ", text: "Проверить действительность", href: "/tools/check-passport" },
    { icon: "file", title: "Готовность РВП", text: "Статус рассмотрения", href: "/tools/check-rvp" },
    { icon: "file", title: "Готовность ВНЖ", text: "Статус решения", href: "/tools/check-vnzh" },
    { icon: "users", title: "Гражданство", text: "Статус заявления", href: "/tools/check-citizenship" },
    { icon: "briefcase", title: "Трудовой патент", text: "Статус оформления", href: "/tools/check-patent" },
  ],
  guidesEyebrow: "Пошаговые инструкции по оформлению",
  featuredGuideTitle: "Как получить ВНЖ в России в 2026 году",
  featuredGuideText: "Основания, документы, сроки и порядок подачи в одной структурированной инструкции.",
  featuredGuideHref: "/pathways/vnzh",
  guidesLabel: "Часто читают",
  guides: [
    { href: "/pathways/rvp/quota", title: "Квота на РВП: критерии и документы" },
    { href: "/pathways/vnzh/without-rvp", title: "ВНЖ без РВП: кто может подать напрямую" },
    { href: "/pathways/vnzh/by-marriage", title: "ВНЖ по браку и близким родственникам" },
    { href: "/pathways/work/patent", title: "Патент на работу для иностранного гражданина" },
    { href: "/legal/registration", title: "Миграционный учёт: сроки и подтверждение" },
    { href: "/pathways/citizenship/simplified", title: "Гражданство в упрощённом порядке" },
  ],
  helpEyebrow: "Не знаете, с чего начать?",
  helpTitle: "Спросите правового ИИ-помощника",
  helpText: "Он работает по базе законов, официальных документов и проверенных материалов. Поможет разобраться в вашей ситуации, подскажет подходящий вариант оформления и объяснит, что делать дальше.",
  helpHref: "/tools/ai-consultant",
  helpLabel: "Найти ответ",
  faqEyebrow: "Коротко о главном",
  faqTitle: "Вопросы о справочнике",
  faqs: [
    { question: "Можно ли доверять информации?", answer: "Материалы содержат даты актуализации и ссылки на правовые основания. Перед подачей проверяйте требования своего региона." },
    { question: "Сайт относится к МВД?", answer: "Нет. Это независимый информационный справочник, который помогает разобраться в открытых официальных материалах." },
    { question: "Когда нужна консультация?", answer: "Когда факты вашей ситуации не укладываются в типовой сценарий или требуется оценка документов и рисков." },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every(isString) && value.length > 0 ? value : fallback;
}

function safeHref(value: unknown, fallback: string) {
  return typeof value === "string" && (value.startsWith("/") || value.startsWith("#")) ? value : fallback;
}

const HOME_ICON_KEYS = new Set<HomeIconKey>(["users", "briefcase", "graduation", "house", "map", "compass", "bot", "list", "calculator", "shield", "file"]);
const HOME_BLUEPRINT_KEYS = new Set<HomeBlueprintType>(["path", "knowledge", "documents", "calendar"]);

function recordWithStrings(value: unknown, fields: string[]) {
  if (!isRecord(value) || fields.some((field) => !isString(value[field]))) return null;
  return value;
}

function normalizeArray<T>(value: unknown, fallback: T[], mapper: (item: unknown) => T | null) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.map(mapper).filter((item): item is T => Boolean(item));
  return normalized.length > 0 ? normalized : fallback;
}

export function normalizeHomeContent(value: unknown): HomeContent {
  if (!isRecord(value)) return DEFAULT_HOME_CONTENT;
  const result = { ...DEFAULT_HOME_CONTENT } as HomeContent;
  for (const key of [
    "heroEyebrow", "heroLead", "heroPrimaryLabel", "heroPrimaryHref", "heroSecondaryLabel", "heroSecondaryHref",
    "situationsEyebrow", "situationsTitle", "situationsText", "statusesEyebrow", "statusesTitle", "statusesText",
    "statusLegalLabel", "statusLegalTitle", "statusLegalHref", "updatesEyebrow", "updatesTitle", "updatesText",
    "toolsEyebrow", "toolsTitle", "toolsText", "checksEyebrow", "checksTitle", "guidesEyebrow", "featuredGuideTitle",
    "featuredGuideText", "featuredGuideHref", "guidesLabel", "helpEyebrow", "helpTitle", "helpText", "helpHref",
    "helpLabel", "faqEyebrow", "faqTitle",
  ] as const) {
    if (isString(value[key])) result[key] = key.endsWith("Href") ? safeHref(value[key], result[key]) as never : value[key] as never;
  }
  result.heroTitleLines = stringArray(value.heroTitleLines, result.heroTitleLines);
  result.trustItems = normalizeArray(value.trustItems, result.trustItems, (item) => {
    const record = recordWithStrings(item, ["title", "text"]);
    return record ? { title: record.title as string, text: record.text as string } : null;
  });
  result.situations = normalizeArray(value.situations, result.situations, (item) => {
    const record = recordWithStrings(item, ["title", "text", "href"]);
    return record && typeof record.icon === "string" && HOME_ICON_KEYS.has(record.icon as HomeIconKey)
      ? { icon: record.icon as HomeIconKey, title: record.title as string, text: record.text as string, href: safeHref(record.href, "/pathways") }
      : null;
  });
  result.statusSteps = normalizeArray(value.statusSteps, result.statusSteps, (item) => {
    const record = recordWithStrings(item, ["number", "title", "text", "href"]);
    return record ? { number: record.number as string, title: record.title as string, text: record.text as string, href: safeHref(record.href, "/pathways") } : null;
  });
  result.updates = normalizeArray(value.updates, result.updates, (item) => {
    const record = recordWithStrings(item, ["date", "title", "text", "href"]);
    return record ? { date: record.date as string, dateTime: isString(record.dateTime) ? record.dateTime : undefined, title: record.title as string, text: record.text as string, href: safeHref(record.href, "/pathways") } : null;
  });
  result.tools = normalizeArray(value.tools, result.tools, (item) => {
    const record = recordWithStrings(item, ["label", "title", "text", "href"]);
    return record && typeof record.icon === "string" && HOME_ICON_KEYS.has(record.icon as HomeIconKey) && typeof record.diagram === "string" && HOME_BLUEPRINT_KEYS.has(record.diagram as HomeBlueprintType)
      ? { icon: record.icon as HomeIconKey, diagram: record.diagram as HomeBlueprintType, label: record.label as string, title: record.title as string, text: record.text as string, href: safeHref(record.href, "/tools"), featured: record.featured === true }
      : null;
  });
  result.checks = normalizeArray(value.checks, result.checks, (item) => {
    const record = recordWithStrings(item, ["title", "text", "href"]);
    return record && typeof record.icon === "string" && HOME_ICON_KEYS.has(record.icon as HomeIconKey)
      ? { icon: record.icon as HomeIconKey, title: record.title as string, text: record.text as string, href: safeHref(record.href, "/tools") }
      : null;
  });
  result.guides = normalizeArray(value.guides, result.guides, (item) => {
    const record = recordWithStrings(item, ["href", "title"]);
    return record ? { href: safeHref(record.href, "/pathways"), title: record.title as string } : null;
  });
  result.faqs = normalizeArray(value.faqs, result.faqs, (item) => {
    const record = recordWithStrings(item, ["question", "answer"]);
    return record ? { question: record.question as string, answer: record.answer as string } : null;
  });
  if (isRecord(value.statusPrimary)) {
    const status = value.statusPrimary;
    result.statusPrimary = {
      label: isString(status.label) ? status.label : result.statusPrimary.label,
      title: isString(status.title) ? status.title : result.statusPrimary.title,
      text: isString(status.text) ? status.text : result.statusPrimary.text,
      linkLabel: isString(status.linkLabel) ? status.linkLabel : result.statusPrimary.linkLabel,
      href: safeHref(status.href, result.statusPrimary.href),
    };
  }
  return result;
}
