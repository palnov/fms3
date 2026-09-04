import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
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
import { normalizeHomeContent, type HomeContent, type HomeIconKey } from "@/lib/home-content";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: "Миграционный справочник", url: "https://ufms-help.ru", description: "Понятные инструкции для иностранных граждан о законной жизни, работе и оформлении документов в России." },
    { "@type": "Organization", name: "Миграционный справочник", url: "https://ufms-help.ru" },
  ],
};

type BlueprintType = "path" | "knowledge" | "documents" | "calendar";

const HOME_ICON_COMPONENTS = {
  users: Users,
  briefcase: BriefcaseBusiness,
  graduation: GraduationCap,
  house: House,
  map: MapPinned,
  compass: Compass,
  bot: Bot,
  list: ListTodo,
  calculator: Calculator,
  shield: ShieldCheck,
  file: FileCheck2,
} satisfies Record<HomeIconKey, typeof Users>;

function HomeIcon({ icon, ...props }: { icon: HomeIconKey } & React.ComponentProps<typeof Users>) {
  const Icon = HOME_ICON_COMPONENTS[icon];
  return <Icon {...props} />;
}

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

export default function Home({ content }: { content?: unknown } = {}) {
  const home: HomeContent = normalizeHomeContent(content);
  return (
    <div className={styles.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.heroShell} data-motion="home-hero">
        <div className={`${styles.hero} site-container`}>
          <div className={styles.heroCopy} data-motion="hero-copy">
            <p className={styles.eyebrow}>{home.heroEyebrow}</p>
            <h1 className={styles.heroTitle}>{home.heroTitleLines.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</h1>
            <p className={styles.heroLead}>{home.heroLead}</p>
            <div className={styles.heroActions}>
              <Link href={home.heroPrimaryHref} className={styles.primaryButton}>{home.heroPrimaryLabel} <ArrowRight aria-hidden="true" /></Link>
              <Link href={home.heroSecondaryHref} className={styles.darkButton}>{home.heroSecondaryLabel}</Link>
            </div>
          </div>
          <PassportIllustration />
        </div>

        <section className={`${styles.trustStrip} site-container`} aria-label="О справочнике">
          {home.trustItems.map((item) => <div key={item.title}><strong>{item.title}</strong><span>{item.text}</span></div>)}
        </section>
      </div>

      <section id="situations" data-motion="section" className={`${styles.section} ${styles.situationsSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>{home.situationsEyebrow}</p><h2>{home.situationsTitle}</h2></div>
            <p>{home.situationsText}</p>
          </div>
          <div className={styles.situationGrid} data-motion-stagger>
            {home.situations.map((item, index) => (
              <Link key={item.title} href={item.href} data-motion-card className={`${styles.situationLink} ${index === 0 ? styles.situationFeatured : ""}`}>
                <div className={styles.situationTop}><span>Ваша ситуация</span><span className={styles.situationIndex}>0{index + 1}</span></div>
                <div className={styles.archiveMark} aria-hidden="true"><i /><HomeIcon icon={item.icon} /></div>
                <h3>{item.title}</h3><p>{item.text}</p><ArrowRight className={styles.linkArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="statuses" data-motion="section" className={styles.section}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>{home.statusesEyebrow}</p><h2>{home.statusesTitle}</h2></div>
            <p>{home.statusesText}</p>
          </div>
          <div className={styles.statusLayout} data-motion-stagger>
            <Link href={home.statusPrimary.href} data-motion-card className={styles.statusPrimary}>
              <span className={styles.statusLabel}>{home.statusPrimary.label}</span><ShieldCheck aria-hidden="true" />
              <h3>{home.statusPrimary.title}</h3><p>{home.statusPrimary.text}</p>
              <span className={styles.textLink}>{home.statusPrimary.linkLabel} <ArrowRight aria-hidden="true" /></span>
            </Link>
            <div className={styles.statusSteps}>
              {home.statusSteps.map((item) => <Link key={item.href} href={item.href} data-motion-card><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowRight aria-hidden="true" /></Link>)}
            </div>
          </div>
          <Link href={home.statusLegalHref} className={styles.legalLine}><span>{home.statusLegalLabel}</span><strong>{home.statusLegalTitle}</strong><ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="updates" data-motion="section" className={`${styles.section} ${styles.updatesSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrowLight}>{home.updatesEyebrow}</p><h2>{home.updatesTitle}</h2></div>
            <p>{home.updatesText}</p>
          </div>
          <div className={styles.updatesList} data-motion-stagger>
            {home.updates.map((item, index) => (
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
            <div><p className={styles.eyebrowLight}>{home.toolsEyebrow}</p><h2>{home.toolsTitle}</h2></div>
            <p>{home.toolsText}</p>
          </div>
          <div className={styles.toolsGrid} data-motion-stagger>
            {home.tools.map((item) => (
              <Link key={item.href} href={item.href} data-motion-card className={`${styles.toolCard} ${item.featured ? styles.toolFeatured : ""}`}>
                <div className={styles.toolTop}><span>{item.label}</span><HomeIcon icon={item.icon} aria-hidden="true" /></div>
                <BlueprintIllustration type={item.diagram} featured={item.featured} />
                <div><h3>{item.title}</h3><p>{item.text}</p></div><span className={styles.toolAction}>Открыть сервис <ArrowRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
          <div className={styles.checksBlock}>
            <div><p className={styles.eyebrowLight}>{home.checksEyebrow}</p><h3>{home.checksTitle}</h3></div>
            <div className={styles.checksGrid} data-motion-stagger>
              {home.checks.map((item) => <Link key={item.href} href={item.href} data-motion-card><HomeIcon icon={item.icon} aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.text}</small></span><ArrowRight aria-hidden="true" /></Link>)}
            </div>
          </div>
        </div>
      </section>

      <section id="guides" data-motion="section" className={`${styles.section} ${styles.guidesSection}`}>
        <div className={`${styles.guidesLayout} site-container`} data-motion-stagger>
          <article data-motion-card className={styles.featuredGuide}>
            <p className={styles.eyebrowLight}>{home.guidesEyebrow}</p><BookOpen aria-hidden="true" />
            <h2>{home.featuredGuideTitle}</h2><p>{home.featuredGuideText}</p>
            <Link href={home.featuredGuideHref} className={styles.primaryButton}>Открыть руководство <ArrowRight aria-hidden="true" /></Link>
          </article>
          <div className={styles.guideList}>
            <p className={styles.eyebrowLight}>{home.guidesLabel}</p>
            {home.guides.map((item, index) => <Link key={item.href} href={item.href} data-motion-card><span>0{index + 1}</span><strong>{item.title}</strong><ArrowRight aria-hidden="true" /></Link>)}
          </div>
        </div>
      </section>

      <section data-motion="section" className={`${styles.section} ${styles.helpSection}`}>
        <div className={`${styles.helpPanel} site-container`} data-motion-card>
          <div><p className={styles.eyebrow}>{home.helpEyebrow}</p><h2>{home.helpTitle}</h2><p>{home.helpText}</p></div>
          <Link href={home.helpHref} className={styles.primaryButton}><Search aria-hidden="true" /> {home.helpLabel}</Link>
        </div>
      </section>

      <section id="faq" data-motion="section" className={`${styles.section} ${styles.faqSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrowLight}>{home.faqEyebrow}</p><h2>{home.faqTitle}</h2></div></div>
          <HomeFaqAccordion variant="institutional" items={home.faqs.map((item) => [item.question, item.answer])} />
        </div>
      </section>
    </div>
  );
}
