import type { Metadata } from "next";
import Link from "next/link";
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
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";

export const metadata: Metadata = {
  title: "Как переехать и легализоваться в России в 2026 году",
  description: "Подберите путь к РВП, ВНЖ или гражданству России по своей ситуации. Пошаговые инструкции, документы, сроки, изменения законодательства и онлайн-инструменты.",
  alternates: { canonical: "/" },
};

const situations = [
  { icon: Users, title: "Семья в России", text: "Супруг, дети или родители — граждане РФ", href: "/pathways/vnzh/by-marriage" },
  { icon: BriefcaseBusiness, title: "Работа и профессия", text: "Патент, квалификация и востребованная специальность", href: "/pathways/work/patent" },
  { icon: GraduationCap, title: "Учёба в России", text: "РВПО, российский диплом и путь выпускника", href: "/pathways/rvp" },
  { icon: House, title: "Соотечественники", text: "Переселение, репатриация и ускоренный путь", href: "/pathways/repatriation" },
  { icon: MapPinned, title: "Нет особых оснований", text: "Квота, РВП и легализация с нуля", href: "/pathways/rvp/quota" },
];

const updates = [
  { date: "11 июня 2026", title: "Формы заявлений и порядок подачи", text: "Перед обращением проверяйте действующую форму и требования подразделения МВД.", href: "/pathways/vnzh/documents" },
  { date: "2026 год", title: "Срок временного пребывания", text: "Разбираем, как считать разрешённые дни и какие статусы меняют общий порядок.", href: "/tools/calculators" },
  { date: "Актуальный разбор", title: "Реестр контролируемых лиц", text: "Что означает включение в реестр и где проверять официальную информацию.", href: "/legal/check-ban" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Миграционный справочник",
      url: "https://ufms-help.ru",
      description: "Инструкции и сервисы по миграционному праву России.",
    },
    {
      "@type": "Organization",
      name: "Миграционный справочник",
      url: "https://ufms-help.ru",
    },
  ],
};

function PassportIllustration() {
  return (
    <svg viewBox="0 0 560 420" role="img" aria-labelledby="passport-title" className="h-full w-full">
      <title id="passport-title">Парящий паспорт и документы миграционного маршрута</title>
      <defs>
        <linearGradient id="passport-bg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset=".55" stopColor="#edf5fa" />
          <stop offset="1" stopColor="#dcebf4" />
        </linearGradient>
        <linearGradient id="passport-cover" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#7d2029" />
          <stop offset=".52" stopColor="#66161f" />
          <stop offset="1" stopColor="#4d1018" />
        </linearGradient>
        <pattern id="passport-texture" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 1h8M1 0v8" stroke="#fff" strokeOpacity=".025" strokeWidth=".6" />
        </pattern>
        <filter id="passport-shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#1f2c41" floodOpacity=".22" />
        </filter>
        <filter id="card-shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1f2c41" floodOpacity=".12" />
        </filter>
        <filter id="coat-gold" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              0 0 0 0 0.91
              0 0 0 0 0.77
              0 0 0 0 0.47
              0 0 0 1 0
            "
          />
          <feDropShadow dx="0" dy="1" stdDeviation=".35" floodColor="#2e060c" floodOpacity=".35" />
        </filter>
      </defs>

      <rect x="5" y="5" width="550" height="410" rx="42" fill="url(#passport-bg)" stroke="#d8dee7" />
      <circle cx="454" cy="80" r="92" fill="#02629f" opacity=".06" />
      <circle cx="98" cy="344" r="112" fill="#ff2e32" opacity=".045" />
      <path className="passport-route" d="M68 315C143 315 139 102 272 102C390 102 388 291 497 291" fill="none" stroke="#02629f" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 11" opacity=".38" />

      <g className="passport-float-card passport-float-card-left" filter="url(#card-shadow)">
        <rect x="48" y="82" width="154" height="96" rx="20" fill="#fff" stroke="#d8dee7" />
        <rect x="66" y="100" width="34" height="34" rx="10" fill="#edf2fd" />
        <path d="M77 112h12M77 119h12M77 126h8" stroke="#02629f" strokeWidth="3" strokeLinecap="round" />
        <rect x="112" y="103" width="67" height="8" rx="4" fill="#1f2c41" opacity=".85" />
        <rect x="112" y="119" width="50" height="6" rx="3" fill="#aeb8c5" />
        <rect x="66" y="150" width="112" height="7" rx="3.5" fill="#dfe5ec" />
      </g>

      <g className="passport-float-card passport-float-card-right" filter="url(#card-shadow)">
        <rect x="381" y="229" width="137" height="94" rx="20" fill="#fff" stroke="#d8dee7" />
        <circle cx="411" cy="259" r="16" fill="#fff0f0" />
        <path d="m403 259 6 6 11-13" fill="none" stroke="#ff2e32" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="438" y="252" width="57" height="8" rx="4" fill="#1f2c41" opacity=".85" />
        <rect x="438" y="268" width="43" height="6" rx="3" fill="#aeb8c5" />
        <rect x="399" y="294" width="96" height="7" rx="3.5" fill="#dfe5ec" />
      </g>

      <g className="passport-float" filter="url(#passport-shadow)">
        <g transform="translate(183 56) rotate(-7 104 151)">
          <rect x="0" y="0" width="208" height="302" rx="25" fill="url(#passport-cover)" />
          <rect x="0" y="0" width="208" height="302" rx="25" fill="url(#passport-texture)" />
          <rect x="10" y="10" width="188" height="282" rx="19" fill="none" stroke="#2f070d" strokeOpacity=".24" />

          <text x="104" y="42" fill="#e8c479" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1.7">РОССИЙСКАЯ</text>
          <text x="104" y="61" fill="#e8c479" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1.7">ФЕДЕРАЦИЯ</text>

          <image
            href="/illustrations/russian-coat-of-arms.png"
            x="50"
            y="91"
            width="108"
            height="108"
            preserveAspectRatio="xMidYMid meet"
            filter="url(#coat-gold)"
          />

          <text x="104" y="263" fill="#e8c479" fontFamily="Georgia, serif" fontSize="24" fontWeight="700" textAnchor="middle" letterSpacing="5">ПАСПОРТ</text>
        </g>
      </g>

      <ellipse className="passport-ground-shadow" cx="290" cy="375" rx="112" ry="18" fill="#1f2c41" opacity=".12" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section data-motion="home-hero" className="site-container grid gap-8 pb-12 pt-10 lg:grid-cols-[1.08fr_.92fr] lg:pb-16 lg:pt-16">
        <div data-motion="hero-copy" className="min-w-0 self-center">
          <p className="section-kicker">Правовой навигатор · обновлено 11 июня 2026</p>
          <h1 className="display-title mt-4 max-w-[13ch]">Найдите законный путь к жизни и работе в России</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#667287]">
            Выберите свою ситуацию и получите понятный маршрут: подходящий статус, порядок действий, документы, сроки и связанные инструкции.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="#situations" className="button-primary">
              Выбрать свою ситуацию <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pathways" className="button-secondary">
              Открыть все инструкции
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-[#4f5c70]">
            <span className="rounded-lg bg-white px-3 py-2">Без регистрации</span>
            <span className="rounded-lg bg-white px-3 py-2">Ссылки на источники</span>
            <span className="rounded-lg bg-white px-3 py-2">Бесплатные инструменты</span>
          </div>
        </div>
        <div data-motion="hero-visual" className="min-w-0 overflow-hidden rounded-[2rem]">
          <PassportIllustration />
        </div>
      </section>

      <section data-motion="section" className="site-container pb-10" aria-label="О справочнике">
        <div data-motion-stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["2026", "актуальная редакция материалов"],
            ["115-ФЗ", "правовые основания со ссылками"],
            ["89 регионов", "региональные особенности процедур"],
            ["Без оплаты", "доступ к статьям и сервисам"],
          ].map(([title, text]) => (
            <div key={title} data-motion-card className="rounded-2xl bg-white p-4 sm:p-5">
              <strong className="block text-xl font-extrabold tracking-[-0.04em]">{title}</strong>
              <span className="mt-1 block text-xs leading-5 text-[#667287]">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="situations" data-motion="section" className="border-y border-[#d8dee7] bg-white py-16 sm:py-20">
        <div className="site-container">
          <div className="grid items-end gap-4 md:grid-cols-[1fr_28rem]">
            <div>
              <p className="section-kicker">Начните с себя</p>
              <h2 className="section-title mt-3">Что описывает вашу ситуацию?</h2>
            </div>
            <p className="text-base leading-7 text-[#667287]">Каждый вариант ведёт в тематический кластер со статьями, документами и подходящими инструментами.</p>
          </div>
          <div data-motion-stagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {situations.map((item, index) => (
              <Link key={item.title} href={item.href} data-motion-card className="group flex min-h-56 flex-col rounded-2xl border border-[#d8dee7] bg-[#f4f6fa] p-5 transition-transform hover:-translate-y-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#02629f] text-white">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="mt-auto text-xs font-extrabold text-[#ff2e32]">0{index + 1}</span>
                <h3 className="mt-2 text-lg font-extrabold leading-5 tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#667287]">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-motion="section" className="site-container py-16 sm:py-24">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_28rem]">
          <div>
            <p className="section-kicker">Тематические хабы</p>
            <h2 className="section-title mt-3">Основные пути легализации</h2>
          </div>
          <p className="text-base leading-7 text-[#667287]">Начните с обзорной страницы, затем переходите к основанию, документам и следующему шагу.</p>
        </div>
        <div data-motion-stagger className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <Link href="/pathways/vnzh" data-motion-card className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-[#02629f] p-7 text-white sm:p-9">
            <svg aria-hidden="true" viewBox="0 0 100 112" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 text-white/10 sm:-right-18 sm:-top-20 sm:h-72 sm:w-72">
              <path d="M50 8 88 22v29c0 27-17 44-38 54C29 95 12 78 12 51V22L50 8Z" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="miter" />
              <path d="m31 55 13 13 27-32" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <span className="relative z-10 text-xs font-extrabold uppercase tracking-[0.08em] text-white/65">Главный кластер</span>
            <ShieldCheck className="relative z-10 mt-14 h-10 w-10" />
            <h3 className="relative z-10 mt-5 text-3xl font-extrabold tracking-[-0.045em]">Вид на жительство</h3>
            <p className="relative z-10 mt-3 max-w-xl text-sm leading-6 text-white/75">Основания, документы, сроки, обязанности после получения и частые ошибки.</p>
            <div className="relative z-10 mt-7 grid gap-2 text-xs font-bold sm:grid-cols-2">
              {["ВНЖ без РВП", "Документы на ВНЖ", "ВНЖ по семье", "Порядок подачи"].map((item) => (
                <span key={item} className="rounded-lg bg-white/12 px-3 py-2">{item}</span>
              ))}
            </div>
          </Link>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/pathways/rvp" data-motion-card className="surface-card group p-6">
              <span className="section-kicker">Кластер</span>
              <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.04em]">РВП</h3>
              <p className="mt-2 text-sm leading-6 text-[#667287]">Квота, брак и другие основания для временного проживания.</p>
              <ArrowRight className="mt-5 h-5 w-5 text-[#ff2e32]" />
            </Link>
            <Link href="/pathways/citizenship" data-motion-card className="surface-card group p-6">
              <span className="section-kicker">Кластер</span>
              <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.04em]">Гражданство</h3>
              <p className="mt-2 text-sm leading-6 text-[#667287]">Общий и упрощённый порядок, требования и документы.</p>
              <ArrowRight className="mt-5 h-5 w-5 text-[#ff2e32]" />
            </Link>
          </div>
        </div>
        <div data-motion-stagger className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["/pathways/work/patent", "Работа и патент", "Оформление, оплата и сроки"],
              ["/pathways/repatriation", "Переселение", "Программа для соотечественников"],
            ].map(([href, title, text]) => (
              <Link key={href} href={href} data-motion-card className="rounded-2xl border border-[#d8dee7] bg-white p-5">
                <h3 className="text-lg font-extrabold tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-sm text-[#667287]">{text}</p>
              </Link>
            ))}
          </div>
          <Link href="/legal/check-ban" data-motion-card className="rounded-2xl border border-[#d8dee7] bg-white p-5">
            <h3 className="text-lg font-extrabold tracking-[-0.03em]">Запреты и легальность</h3>
            <p className="mt-2 text-sm text-[#667287]">Проверка рисков и порядок действий</p>
          </Link>
        </div>
      </section>

      <section data-motion="section" className="bg-[#1f2c41] py-16 text-white sm:py-20">
        <div className="site-container">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#ff7b7e]">Следим за изменениями</p>
          <h2 className="section-title mt-3 max-w-3xl">Что важно проверить в 2026 году</h2>
          <div data-motion-stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {updates.map((item) => (
              <article key={item.title} data-motion-card className="rounded-2xl bg-white p-5 text-[#1f2c41]">
                <time className="text-xs font-extrabold text-[#ff2e32]">{item.date}</time>
                <h3 className="mt-5 text-xl font-extrabold leading-6 tracking-[-0.035em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667287]">{item.text}</p>
                <Link href={item.href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#02629f]">
                  Читать разбор <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-motion="section" className="site-container py-16 sm:py-24">
        <p className="section-kicker">Практические сервисы</p>
        <h2 className="section-title mt-3">Проверьте ситуацию, а затем читайте нужное</h2>
        <div data-motion-stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/tools/ai-consultant" data-motion-card className="surface-card p-6">
            <Bot className="h-8 w-8 text-[#02629f]" />
            <span className="mt-12 block text-xs font-bold uppercase tracking-[0.08em] text-[#ff2e32]">ИИ-помощник</span>
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.035em]">Консультант</h3>
            <p className="mt-3 text-sm leading-6 text-[#667287]">Ответы на вопросы по базе знаний, ФЗ-115, ФЗ-138 и шаблонам миграционных документов.</p>
          </Link>
          <Link href="/tools/path-finder" data-motion-card className="surface-card p-6">
            <Compass className="h-8 w-8 text-[#02629f]" />
            <span className="mt-12 block text-xs font-bold uppercase tracking-[0.08em] text-[#ff2e32]">Навигатор</span>
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.035em]">Подобрать путь</h3>
            <p className="mt-3 text-sm leading-6 text-[#667287]">Интерактивный квиз по подбору оптимального статуса (РВП, ВНЖ, гражданство).</p>
          </Link>
          <Link href="/tools/checklist-generator" data-motion-card className="surface-card p-6">
            <ListTodo className="h-8 w-8 text-[#02629f]" />
            <span className="mt-12 block text-xs font-bold uppercase tracking-[0.08em] text-[#ff2e32]">Чек-листы</span>
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.035em]">Списки документов</h3>
            <p className="mt-3 text-sm leading-6 text-[#667287]">Отмечайте готовые документы и готовьте идеальный пакет для подачи в МВД.</p>
          </Link>
          <Link href="/tools/calculators" data-motion-card className="surface-card p-6">
            <Calculator className="h-8 w-8 text-[#02629f]" />
            <span className="mt-12 block text-xs font-bold uppercase tracking-[0.08em] text-[#ff2e32]">Расчёт</span>
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.035em]">Сроки и платежи</h3>
            <p className="mt-3 text-sm leading-6 text-[#667287]">Калькуляторы пребывания 90/180 и стоимости трудового патента.</p>
          </Link>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-extrabold tracking-tight mb-2 text-[#1f2c41] dark:text-white">Проверки документов и статусов</h3>
          <p className="text-[#667287] text-sm mb-8">Интерактивные онлайн-проверки готовности решений и действительности документов.</p>
          
          <div data-motion-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/tools/check-passport" data-motion-card className="surface-card p-5 group flex flex-col justify-between min-h-48 hover:-translate-y-1 transition-transform">
              <div>
                <ShieldCheck className="h-6 h-6 text-[#02629f]" />
                <h4 className="mt-4 text-base font-extrabold tracking-[-0.02em] group-hover:text-primary-500 transition-colors">Действительность паспорта</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#667287]">Проверить паспорт РФ по базе недействительных документов.</p>
              </div>
              <span className="text-xs font-bold text-primary-500 mt-4 flex items-center gap-1">Открыть <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
            
            <Link href="/tools/check-rvp" data-motion-card className="surface-card p-5 group flex flex-col justify-between min-h-48 hover:-translate-y-1 transition-transform">
              <div>
                <FileCheck2 className="h-6 h-6 text-[#02629f]" />
                <h4 className="mt-4 text-base font-extrabold tracking-[-0.02em] group-hover:text-primary-500 transition-colors">Готовность РВП</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#667287]">Проверить статус рассмотрения разрешения на проживание.</p>
              </div>
              <span className="text-xs font-bold text-primary-500 mt-4 flex items-center gap-1">Открыть <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link href="/tools/check-vnzh" data-motion-card className="surface-card p-5 group flex flex-col justify-between min-h-48 hover:-translate-y-1 transition-transform">
              <div>
                <FileCheck2 className="h-6 h-6 text-[#02629f]" />
                <h4 className="mt-4 text-base font-extrabold tracking-[-0.02em] group-hover:text-primary-500 transition-colors">Готовность ВНЖ</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#667287]">Проверить готовность решения по виду на жительство.</p>
              </div>
              <span className="text-xs font-bold text-primary-500 mt-4 flex items-center gap-1">Открыть <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link href="/tools/check-citizenship" data-motion-card className="surface-card p-5 group flex flex-col justify-between min-h-48 hover:-translate-y-1 transition-transform">
              <div>
                <Users className="h-6 h-6 text-[#02629f]" />
                <h4 className="mt-4 text-base font-extrabold tracking-[-0.02em] group-hover:text-primary-500 transition-colors">Готовность гражданства</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#667287]">Статус рассмотрения заявления на прием в гражданство РФ.</p>
              </div>
              <span className="text-xs font-bold text-primary-500 mt-4 flex items-center gap-1">Открыть <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link href="/tools/check-patent" data-motion-card className="surface-card p-5 group flex flex-col justify-between min-h-48 hover:-translate-y-1 transition-transform">
              <div>
                <BriefcaseBusiness className="h-6 h-6 text-[#02629f]" />
                <h4 className="mt-4 text-base font-extrabold tracking-[-0.02em] group-hover:text-primary-500 transition-colors">Готовность патента</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#667287]">Проверка статуса оформления трудового патента.</p>
              </div>
              <span className="text-xs font-bold text-primary-500 mt-4 flex items-center gap-1">Открыть <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section data-motion="section" className="border-y border-[#d8dee7] bg-white py-16 sm:py-20">
        <div data-motion-stagger className="site-container grid gap-8 lg:grid-cols-[1fr_.8fr]">
          <div data-motion-card className="rounded-[1.6rem] bg-[#edf2fd] p-7 sm:p-9">
            <span className="section-kicker">Полное руководство</span>
            <BookOpen className="mt-12 h-9 w-9 text-[#02629f]" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.045em]">Как получить ВНЖ в России в 2026 году</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#667287]">Основания, документы, сроки и порядок подачи в одной структурированной инструкции.</p>
            <Link href="/pathways/vnzh" className="button-primary mt-7">Открыть руководство <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-2 lg:h-full lg:content-between">
            {[
              ["/pathways/rvp/quota", "Квота на РВП: критерии и документы"],
              ["/pathways/vnzh/without-rvp", "ВНЖ без РВП: кто может подать напрямую"],
              ["/pathways/vnzh/by-marriage", "ВНЖ по браку и близким родственникам"],
              ["/pathways/work/patent", "Патент на работу для иностранного гражданина"],
              ["/legal/registration", "Миграционный учёт: сроки и подтверждение"],
              ["/pathways/citizenship/simplified", "Гражданство в упрощённом порядке"],
            ].map(([href, title]) => (
              <Link key={href} href={href} data-motion-card className="flex items-center justify-between rounded-xl border border-[#d8dee7] p-4 text-sm font-bold hover:border-[#02629f]/40">
                {title}<ArrowRight className="h-4 w-4 text-[#ff2e32]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-motion="section" className="site-container py-16 sm:py-24">
        <div data-motion-card className="grid items-center gap-8 rounded-[1.75rem] bg-[#1f2c41] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#ff7b7e]">Не нашли точный ответ?</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em]">Сначала спросите ИИ-помощника</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">Он найдёт материалы по вашей ситуации. Консультация специалиста появится только если вопрос требует индивидуального разбора.</p>
          </div>
          <Link href="/tools/ai-consultant" className="button-primary">
            <Search className="h-4 w-4" /> Найти ответ
          </Link>
        </div>
      </section>

      <section data-motion="section" className="site-container pb-20">
        <HomeFaqAccordion
          items={[
            ["Можно ли доверять информации?", "Материалы содержат даты актуализации и ссылки на правовые основания. Перед подачей проверяйте требования своего региона."],
            ["Сайт относится к МВД?", "Нет. Это независимый информационный справочник, который помогает разобраться в открытых официальных материалах."],
            ["Когда нужна консультация?", "Когда факты вашей ситуации не укладываются в типовой сценарий или требуется оценка документов и рисков."],
          ]}
        />
      </section>
    </>
  );
}
