import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Calculator,
  Compass,
  FileCheck2,
  GraduationCap,
  House,
  ListTodo,
  MapPinned,
  ShieldCheck,
  Users,
} from "lucide-react";
import HomeDocumentsIllustration from "@/components/home/HomeDocumentsIllustration";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";
import { normalizeHomeContent, type HomeContent, type HomeIconKey } from "@/lib/home-content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Как жить и работать в России законно — РВП, ВНЖ, гражданство" },
  description:
    "РВП, вид на жительство, гражданство и работа в России: основания, документы, сроки и порядок оформления для иностранных граждан.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Как жить и работать в России законно",
    description: "Инструкции по РВП, ВНЖ, гражданству, работе и миграционным документам для иностранных граждан.",
  },
  twitter: {
    card: "summary",
    title: "Как жить и работать в России законно",
    description: "Инструкции по РВП, ВНЖ, гражданству, работе и документам для иностранных граждан.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Миграционный справочник",
      url: "https://ufms-help.ru",
      description: "Понятные инструкции для иностранных граждан о законной жизни, работе и оформлении документов в России.",
    },
    { "@type": "Organization", name: "Миграционный справочник", url: "https://ufms-help.ru" },
  ],
};

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

function validDateTime(value: string | undefined) {
  return value && !Number.isNaN(Date.parse(value)) ? value : undefined;
}

export default function Home({ content }: { content?: unknown } = {}) {
  const home: HomeContent = normalizeHomeContent(content);
  const heroTitle = home.heroTitleLines.join(" ").trim();

  return (
    <div className={styles.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.heroShell} data-motion="home-hero">
        <div className={`${styles.hero} site-container`}>
          <div className={styles.heroCopy} data-motion="hero-copy">
            <p className={styles.eyebrow}>{home.heroEyebrow}</p>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroLead}>{home.heroLead}</p>
            <div className={styles.heroActions}>
              <Link href={home.heroPrimaryHref} className={styles.primaryButton}>
                {home.heroPrimaryLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href={home.heroSecondaryHref} className={styles.darkButton}>
                {home.heroSecondaryLabel}
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <HomeDocumentsIllustration />
        </div>
      </div>

      <section id="situations" data-motion="section" className={`${styles.section} ${styles.situationsSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrowLight}>{home.situationsEyebrow}</p>
              <h2>{home.situationsTitle}</h2>
            </div>
            <p>{home.situationsText}</p>
          </div>
          <div className={styles.situationGrid} data-motion-stagger>
            {home.situations.map((item) => (
              <Link key={item.title} href={item.href} data-motion-card className={styles.situationLink}>
                <span className={styles.situationIcon} aria-hidden="true">
                  <HomeIcon icon={item.icon} />
                </span>
                <span className={styles.situationContent}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <ArrowRight className={styles.situationArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" data-motion="section" className={`${styles.section} ${styles.toolsSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrowLight}>{home.toolsEyebrow}</p>
              <h2>{home.toolsTitle}</h2>
            </div>
            <p>{home.toolsText}</p>
          </div>

          <div className={styles.checksBlock}>
            <div>
              <p className={styles.eyebrowLight}>{home.checksEyebrow}</p>
              <h3>{home.checksTitle}</h3>
            </div>
            <div className={styles.checksGrid} data-motion-stagger>
              {home.checks.map((item) => (
                <Link key={item.href} href={item.href} data-motion-card>
                  <HomeIcon icon={item.icon} aria-hidden="true" />
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.toolsGrid} data-motion-stagger>
            {home.tools.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-motion-card
                className={`${styles.toolCard} ${item.featured ? styles.toolFeatured : ""}`}
              >
                <div className={styles.toolTop}>
                  <span>{item.label}</span>
                  <HomeIcon icon={item.icon} aria-hidden="true" />
                </div>
                <div className={styles.toolBody}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <span className={styles.toolAction}>
                  {item.featured ? "Подобрать путь" : "Открыть сервис"}
                  <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>

          <Link href={home.helpHref} className={styles.assistantNote}>
            <div>
              <span>{home.helpEyebrow}</span>
              <strong>{home.helpTitle}</strong>
            </div>
            <span className={styles.assistantAction}>
              {home.helpLabel}
              <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      <section id="statuses" data-motion="section" className={`${styles.section} ${styles.statusesSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrowLight}>{home.statusesEyebrow}</p>
              <h2>{home.statusesTitle}</h2>
            </div>
            <p>{home.statusesText}</p>
          </div>
          <div className={styles.statusGrid} data-motion-stagger>
            <Link href={home.statusPrimary.href} data-motion-card className={`${styles.statusCard} ${styles.statusPrimaryCard}`}>
              <div>
                <h3>{home.statusPrimary.title}</h3>
                <p>{home.statusPrimary.text}</p>
              </div>
              <span className={styles.cardAction}>
                {home.statusPrimary.linkLabel}
                <ArrowRight aria-hidden="true" />
              </span>
            </Link>
            {home.statusSteps.map((item) => (
              <Link key={item.href} href={item.href} data-motion-card className={styles.statusCard}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
            <Link
              href={home.statusLegalHref}
              data-motion-card
              className={`${styles.statusCard} ${styles.statusLegalCard}`}
            >
              <div>
                <span className={styles.statusCardLabel}>{home.statusLegalLabel}</span>
                <h3>{home.statusLegalTitle}</h3>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="guides" data-motion="section" className={`${styles.section} ${styles.guidesSection}`}>
        <div className={`${styles.guidesLayout} site-container`} data-motion-stagger>
          <article data-motion-card className={styles.featuredGuide}>
            <div className={styles.featuredGuideTop}>
              <p className={styles.eyebrowLight}>{home.guidesEyebrow}</p>
              <BookOpen aria-hidden="true" />
            </div>
            <h2>{home.featuredGuideTitle}</h2>
            <p>{home.featuredGuideText}</p>
            <Link href={home.featuredGuideHref} className={styles.primaryButton}>
              Открыть руководство
              <ArrowRight aria-hidden="true" />
            </Link>
          </article>
          <div className={styles.guideList}>
            <p className={styles.eyebrowLight}>{home.guidesLabel}</p>
            {home.guides.map((item) => (
              <Link key={item.href} href={item.href} data-motion-card>
                <strong>{item.title}</strong>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="updates" data-motion="section" className={`${styles.section} ${styles.updatesSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrowLight}>{home.updatesEyebrow}</p>
              <h2>{home.updatesTitle}</h2>
            </div>
            <p>{home.updatesText}</p>
          </div>
          <div className={styles.updatesList} data-motion-stagger>
            {home.updates.map((item) => {
              const dateTime = validDateTime(item.dateTime);
              return (
                <Link key={item.title} href={item.href} className={styles.updateItem}>
                  <div className={styles.updateMeta}>
                    {dateTime ? <time dateTime={dateTime}>{item.date}</time> : <span>{item.date}</span>}
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <ArrowRight className={styles.updateArrow} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" data-motion="section" className={`${styles.section} ${styles.faqSection}`}>
        <div className="site-container">
          <div className={styles.faqLayout}>
            <div className={styles.faqIntro}>
              <p className={styles.eyebrowLight}>{home.faqEyebrow}</p>
              <h2>{home.faqTitle}</h2>
            </div>
            <div className={styles.faqQuestions}>
              <HomeFaqAccordion variant="institutional" items={home.faqs.map((item) => [item.question, item.answer])} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
