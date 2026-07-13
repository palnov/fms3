import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Calculator,
  Check,
  Compass,
  FileCheck2,
  GraduationCap,
  House,
  ListTodo,
  MapPinned,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Как жить и работать в России законно — РВП, ВНЖ, гражданство" },
  description:
    "Понятные инструкции для иностранных граждан: переезд в Россию, РВП, ВНЖ, гражданство, работа, документы, сроки и онлайн-проверки.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Как жить и работать в России законно",
    description: "Инструкции для иностранных граждан: переезд, работа, РВП, ВНЖ, гражданство, документы и сроки.",
  },
  twitter: {
    card: "summary",
    title: "Как жить и работать в России законно",
    description: "Понятные инструкции по РВП, ВНЖ, гражданству, работе и документам для иностранных граждан.",
  },
};

const situations = [
  { icon: Users, title: "Семья в России", text: "Супруг, дети или родители — граждане РФ", href: "/pathways/vnzh/by-marriage" },
  { icon: BriefcaseBusiness, title: "Работа и профессия", text: "Патент, квалификация и востребованная специальность", href: "/pathways/work/patent" },
  { icon: GraduationCap, title: "Учёба в России", text: "РВПО и оформление после российского диплома", href: "/pathways/rvpo" },
  { icon: House, title: "Соотечественники", text: "Переселение, репатриация и упрощённое оформление", href: "/pathways/repatriation" },
  { icon: MapPinned, title: "Другой случай", text: "Квота на РВП и оформление без льгот", href: "/pathways/rvp/quota" },
];

const updates = [
  { date: "11 июня 2026", dateTime: "2026-06-11", title: "Формы заявлений и порядок подачи", text: "Перед обращением проверяйте действующую форму и требования подразделения МВД.", href: "/pathways/vnzh/documents" },
  { date: "2026 год", title: "Срок временного пребывания", text: "Разбираем, как считать разрешённые дни и какие статусы меняют общий порядок.", href: "/tools/calculators" },
  { date: "Актуальный разбор", title: "Реестр контролируемых лиц", text: "Что означает включение в реестр и где проверять официальную информацию.", href: "/legal/controlled-persons-register" },
];

const tools = [
  { icon: Compass, diagram: "path" as const, label: "С чего начать", title: "Подобрать документы и порядок действий", text: "Ответьте на несколько вопросов. Сервис подскажет, что можно оформить, какие документы собрать и что делать дальше.", href: "/tools/path-finder", featured: true },
  { icon: Bot, diagram: "knowledge" as const, label: "ИИ-помощник", title: "Найти ответ в базе", text: "Ответы по ФЗ-115, ФЗ-138 и миграционным документам со ссылками на материалы.", href: "/tools/ai-consultant" },
  { icon: ListTodo, diagram: "documents" as const, label: "Чек-листы", title: "Собрать документы", text: "Персональные списки документов с отметками готовности к подаче.", href: "/tools/checklist-generator" },
  { icon: Calculator, diagram: "calendar" as const, label: "Расчёт", title: "Посчитать сроки", text: "Калькуляторы пребывания 90/180 и стоимости трудового патента.", href: "/tools/calculators" },
];

const checks = [
  { icon: ShieldCheck, title: "Паспорт РФ", text: "Проверить действительность", href: "/tools/check-passport" },
  { icon: FileCheck2, title: "Готовность РВП", text: "Статус рассмотрения", href: "/tools/check-rvp" },
  { icon: FileCheck2, title: "Готовность ВНЖ", text: "Статус решения", href: "/tools/check-vnzh" },
  { icon: Users, title: "Гражданство", text: "Статус заявления", href: "/tools/check-citizenship" },
  { icon: BriefcaseBusiness, title: "Трудовой патент", text: "Статус оформления", href: "/tools/check-patent" },
];

const guides = [
  ["/pathways/rvp/quota", "Квота на РВП: критерии и документы"],
  ["/pathways/vnzh/without-rvp", "ВНЖ без РВП: кто может подать напрямую"],
  ["/pathways/vnzh/by-marriage", "ВНЖ по браку и близким родственникам"],
  ["/pathways/work/patent", "Патент на работу для иностранного гражданина"],
  ["/legal/registration", "Миграционный учёт: сроки и подтверждение"],
  ["/pathways/citizenship/simplified", "Гражданство в упрощённом порядке"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: "Миграционный справочник", url: "https://ufms-help.ru", description: "Понятные инструкции для иностранных граждан о законной жизни, работе и оформлении документов в России." },
    { "@type": "Organization", name: "Миграционный справочник", url: "https://ufms-help.ru" },
  ],
};

type BlueprintType = "path" | "knowledge" | "documents" | "calendar";

function BlueprintIllustration({ type, featured = false }: { type: BlueprintType; featured?: boolean }) {
  const shared = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="0 0 240 132" aria-hidden="true" focusable="false" className={featured ? styles.blueprintFeatured : styles.blueprint}>
      <path d="M9 121H231M18 12v109M222 12v109" stroke="currentColor" strokeOpacity=".13" strokeDasharray="2 7" />
      {type === "path" ? <>
        <path d="M23 88h38l22-48h48l22 48h64" {...shared} strokeDasharray="7 7" /><circle cx="23" cy="88" r="8" {...shared} /><circle cx="83" cy="40" r="8" {...shared} /><circle cx="153" cy="88" r="8" {...shared} /><circle cx="217" cy="88" r="8" {...shared} />
        <text x="23" y="116" fill="currentColor" fontSize="8" textAnchor="middle">СИТУАЦИЯ</text><text x="83" y="22" fill="currentColor" fontSize="8" textAnchor="middle">ОСНОВАНИЕ</text><text x="153" y="116" fill="currentColor" fontSize="8" textAnchor="middle">ДОКУМЕНТЫ</text><text x="217" y="116" fill="currentColor" fontSize="8" textAnchor="middle">СТАТУС</text>
      </> : null}
      {type === "knowledge" ? <>
        <path d="M49 30h59c13 0 12 15 12 15s-1-15 12-15h59v75h-59c-13 0-12 12-12 12s1-12-12-12H49V30Z" {...shared} /><path d="M120 45v72M65 49h31M65 61h31M144 49h31M144 61h22" {...shared} strokeOpacity=".55" />
      </> : null}
      {type === "documents" ? <>
        <rect x="64" y="18" width="94" height="101" rx="4" {...shared} /><path d="M158 43h25v76H89M83 45h52M83 63h52M83 81h30" {...shared} />
        <path d="m83 98 8 8 16-19" {...shared} />
      </> : null}
      {type === "calendar" ? <>
        <rect x="48" y="29" width="144" height="88" rx="6" {...shared} /><path d="M48 53h144M82 20v19M158 20v19" {...shared} />
        <path d="M73 73h18M111 73h18M149 73h18M73 94h18M111 94h18" {...shared} strokeOpacity=".6" /><circle cx="158" cy="94" r="12" {...shared} /><path d="M158 87v8l5 3" {...shared} />
      </> : null}
    </svg>
  );
}

function PassportIllustration() {
  return (
    <div className={styles.passportStage} data-motion="hero-visual">
      <svg viewBox="0 0 560 500" role="img" aria-labelledby="passport-title" className={styles.passportSvg}>
        <title id="passport-title">Паспорт и этапы оформления документов</title>
        <defs>
          <linearGradient id="institutional-cover" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#5b3a40" />
            <stop offset=".55" stopColor="#493035" />
            <stop offset="1" stopColor="#322125" />
          </linearGradient>
          <pattern id="institutional-texture" width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M0 1h7M1 0v7" stroke="#fff" strokeOpacity=".025" strokeWidth=".55" />
          </pattern>
          <filter id="institutional-shadow" x="-45%" y="-40%" width="190%" height="210%">
            <feDropShadow dx="0" dy="30" stdDeviation="24" floodColor="#07100d" floodOpacity=".5" />
          </filter>
          <filter id="institutional-gold" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0 0 0 0 .82 0 0 0 0 .70 0 0 0 0 .44 0 0 0 1 0" />
          </filter>
        </defs>
        <path className="passport-route" d="M53 348C129 348 137 111 282 111C416 111 415 351 513 351" fill="none" stroke="#c8aa70" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 11" opacity=".52" />
        <circle cx="54" cy="348" r="5" fill="#c8aa70" />
        <circle cx="513" cy="351" r="5" fill="#c8aa70" />
        <g className="passport-float" filter="url(#institutional-shadow)">
          <g transform="translate(176 60) rotate(-7 108 160)">
            <rect width="216" height="320" rx="20" fill="url(#institutional-cover)" />
            <rect width="216" height="320" rx="20" fill="url(#institutional-texture)" />
            <rect x="10" y="10" width="196" height="300" rx="14" fill="none" stroke="#160d0f" strokeOpacity=".36" />
            <text x="108" y="42" fill="#d4b978" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="1.7">РОССИЙСКАЯ</text>
            <text x="108" y="60" fill="#d4b978" fontFamily="Georgia, serif" fontSize="12" fontWeight="700" textAnchor="middle" letterSpacing="1.7">ФЕДЕРАЦИЯ</text>
            <image href="/illustrations/russian-coat-of-arms.png" x="52" y="98" width="112" height="112" preserveAspectRatio="xMidYMid meet" filter="url(#institutional-gold)" />
            <text x="108" y="274" fill="#d4b978" fontFamily="Georgia, serif" fontSize="23" fontWeight="700" textAnchor="middle" letterSpacing="5">ПАСПОРТ</text>
          </g>
        </g>
        <ellipse className="passport-ground-shadow" cx="286" cy="430" rx="117" ry="18" fill="#050b09" opacity=".3" />
      </svg>
      <div className={`${styles.routeNote} ${styles.routeNoteTop}`}><Check aria-hidden="true" /> Подходящий вариант найден</div>
      <div className={`${styles.routeNote} ${styles.routeNoteBottom}`}><span>05</span> шагов до подачи</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className={styles.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.heroShell} data-motion="home-hero">
        <div className={`${styles.hero} site-container`}>
          <div className={styles.heroCopy} data-motion="hero-copy">
            <p className={styles.eyebrow}>Миграционное право · редакция 2026</p>
            <h1 className={styles.heroTitle}>Как жить<br />и работать<br />в России<br />законно</h1>
            <p className={styles.heroLead}>Понятные инструкции для иностранных граждан: как приехать, оформить документы и остаться в России.</p>
            <div className={styles.heroActions}>
              <Link href="#situations" className={styles.primaryButton}>Выбрать свою ситуацию <ArrowRight aria-hidden="true" /></Link>
              <Link href="/pathways" className={styles.darkButton}>Посмотреть инструкции</Link>
            </div>
          </div>
          <PassportIllustration />
        </div>

        <section className={`${styles.trustStrip} site-container`} aria-label="О справочнике">
          {[
            ["2026", "актуальная редакция"],
            ["115-ФЗ", "правовые основания"],
            ["89 регионов", "местные особенности"],
            ["Без оплаты", "материалы и сервисы"],
          ].map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
        </section>
      </div>

      <section id="situations" data-motion="section" className={`${styles.section} ${styles.situationsSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>Начните с главного</p><h2>Выберите свою ситуацию</h2></div>
            <p>Семья, работа, учёба, переезд или оформление без льгот. Мы подскажем, что можно оформить и с чего начать.</p>
          </div>
          <div className={styles.situationGrid} data-motion-stagger>
            {situations.map((item, index) => (
              <Link key={item.title} href={item.href} data-motion-card className={`${styles.situationLink} ${index === 0 ? styles.situationFeatured : ""}`}>
                <div className={styles.situationTop}><span>Ваша ситуация</span><span className={styles.situationIndex}>0{index + 1}</span></div>
                <div className={styles.archiveMark} aria-hidden="true"><i /><item.icon /></div>
                <h3>{item.title}</h3><p>{item.text}</p><ArrowRight className={styles.linkArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="statuses" data-motion="section" className={styles.section}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>РВП, ВНЖ и гражданство</p><h2>Что можно оформить для жизни в России</h2></div>
            <p>Выберите нужный документ и узнайте требования, сроки и порядок оформления.</p>
          </div>
          <div className={styles.statusLayout} data-motion-stagger>
            <Link href="/pathways/vnzh" data-motion-card className={styles.statusPrimary}>
              <span className={styles.statusLabel}>Главный кластер</span><ShieldCheck aria-hidden="true" />
              <h3>Вид на жительство</h3><p>Основания, документы, сроки, обязанности после получения и частые ошибки.</p>
              <span className={styles.textLink}>Как получить ВНЖ <ArrowRight aria-hidden="true" /></span>
            </Link>
            <div className={styles.statusSteps}>
              <Link href="/pathways/rvp" data-motion-card><span>01</span><div><h3>РВП</h3><p>Квота, брак и другие основания для временного проживания.</p></div><ArrowRight aria-hidden="true" /></Link>
              <Link href="/pathways/citizenship" data-motion-card><span>02</span><div><h3>Гражданство</h3><p>Общий и упрощённый порядок, требования и документы.</p></div><ArrowRight aria-hidden="true" /></Link>
              <Link href="/pathways/work/patent" data-motion-card><span>03</span><div><h3>Работа и патент</h3><p>Оформление, оплата и контроль сроков.</p></div><ArrowRight aria-hidden="true" /></Link>
              <Link href="/pathways/repatriation" data-motion-card><span>04</span><div><h3>Переселение</h3><p>Программа для соотечественников и репатриация.</p></div><ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
          <Link href="/legal/check-ban" className={styles.legalLine}><span>Отдельный вопрос</span><strong>Запреты, легальность и реестр контролируемых лиц</strong><ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="updates" data-motion="section" className={`${styles.section} ${styles.updatesSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>Следим за изменениями</p><h2>Что важно проверить в 2026 году</h2></div>
            <p>Перед подачей документов сверяйте форму, сроки и региональные требования.</p>
          </div>
          <div className={styles.updatesList} data-motion-stagger>
            {updates.map((item, index) => (
              <article key={item.title} data-motion-card className={styles.updateItem}>
                <div className={styles.updateMeta}><span>0{index + 1}</span>{item.dateTime ? <time dateTime={item.dateTime}>{item.date}</time> : <span>{item.date}</span>}</div>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
                <Link href={item.href} aria-label={`Читать: ${item.title}`}><ArrowRight aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" data-motion="section" className={`${styles.section} ${styles.toolsSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>Практические сервисы</p><h2>Узнайте, какие документы вам нужны</h2></div>
            <p>Ответьте на несколько вопросов, проверьте сроки и соберите документы для подачи.</p>
          </div>
          <div className={styles.toolsGrid} data-motion-stagger>
            {tools.map((item) => (
              <Link key={item.href} href={item.href} data-motion-card className={`${styles.toolCard} ${item.featured ? styles.toolFeatured : ""}`}>
                <div className={styles.toolTop}><span>{item.label}</span><item.icon aria-hidden="true" /></div>
                <BlueprintIllustration type={item.diagram} featured={item.featured} />
                <div><h3>{item.title}</h3><p>{item.text}</p></div><span className={styles.toolAction}>Открыть сервис <ArrowRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
          <div className={styles.checksBlock}>
            <div><p className={styles.eyebrowLight}>Официальные проверки</p><h3>Документы и готовность решений</h3></div>
            <div className={styles.checksGrid} data-motion-stagger>
              {checks.map((item) => <Link key={item.href} href={item.href} data-motion-card><item.icon aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.text}</small></span><ArrowRight aria-hidden="true" /></Link>)}
            </div>
          </div>
        </div>
      </section>

      <section id="guides" data-motion="section" className={`${styles.section} ${styles.guidesSection}`}>
        <div className={`${styles.guidesLayout} site-container`} data-motion-stagger>
          <article data-motion-card className={styles.featuredGuide}>
            <p className={styles.eyebrowLight}>Пошаговые инструкции по оформлению</p><BookOpen aria-hidden="true" />
            <h2>Как получить ВНЖ в России в 2026 году</h2><p>Основания, документы, сроки и порядок подачи в одной структурированной инструкции.</p>
            <Link href="/pathways/vnzh" className={styles.primaryButton}>Открыть руководство <ArrowRight aria-hidden="true" /></Link>
          </article>
          <div className={styles.guideList}>
            <p className={styles.eyebrowLight}>Часто читают</p>
            {guides.map(([href, title], index) => <Link key={href} href={href} data-motion-card><span>0{index + 1}</span><strong>{title}</strong><ArrowRight aria-hidden="true" /></Link>)}
          </div>
        </div>
      </section>

      <section data-motion="section" className={`${styles.section} ${styles.helpSection}`}>
        <div className={`${styles.helpPanel} site-container`} data-motion-card>
          <div><p className={styles.eyebrow}>Не знаете, с чего начать?</p><h2>Спросите правового ИИ-помощника</h2><p>Он работает по базе законов, официальных документов и проверенных материалов. Поможет разобраться в вашей ситуации, подскажет подходящий вариант оформления и объяснит, что делать дальше.</p></div>
          <Link href="/tools/ai-consultant" className={styles.primaryButton}><Search aria-hidden="true" /> Найти ответ</Link>
        </div>
      </section>

      <section id="faq" data-motion="section" className={`${styles.section} ${styles.faqSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrowLight}>Коротко о главном</p><h2>Вопросы о справочнике</h2></div></div>
          <HomeFaqAccordion variant="institutional" items={[
            ["Можно ли доверять информации?", "Материалы содержат даты актуализации и ссылки на правовые основания. Перед подачей проверяйте требования своего региона."],
            ["Сайт относится к МВД?", "Нет. Это независимый информационный справочник, который помогает разобраться в открытых официальных материалах."],
            ["Когда нужна консультация?", "Когда факты вашей ситуации не укладываются в типовой сценарий или требуется оценка документов и рисков."],
          ]} />
        </div>
      </section>
    </div>
  );
}
