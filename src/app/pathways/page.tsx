import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, House, MapPinned, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Все пути легализации в России",
  description: "Сравните РВП, ВНЖ, гражданство, патент и программу переселения. Выберите подходящий маршрут и перейдите к пошаговой инструкции.",
};

const paths = [
  {
    href: "/pathways/vnzh",
    icon: ShieldCheck,
    eyebrow: "Постоянное проживание",
    title: "Вид на жительство",
    text: "Бессрочный статус, работа без патента и возможность двигаться к гражданству.",
    links: ["Без РВП", "По семье", "Документы"],
    featured: true,
  },
  {
    href: "/pathways/rvp",
    icon: FileText,
    eyebrow: "Временное проживание",
    title: "РВП",
    text: "Статус на три года по квоте или предусмотренному законом основанию.",
    links: ["Квота", "По браку", "Общий порядок"],
  },
  {
    href: "/pathways/citizenship",
    icon: Globe2,
    eyebrow: "Паспорт России",
    title: "Гражданство",
    text: "Общий и упрощённый порядок, требования, сроки и основания.",
    links: ["Упрощённый порядок", "Документы", "Требования"],
  },
  {
    href: "/pathways/repatriation",
    icon: House,
    eyebrow: "Государственная программа",
    title: "Переселение",
    text: "Маршрут для соотечественников и репатриантов с региональными условиями.",
    links: ["Участие", "Регионы", "Выплаты"],
  },
  {
    href: "/pathways/work/patent",
    icon: BriefcaseBusiness,
    eyebrow: "Работа в России",
    title: "Трудовой патент",
    text: "Оформление, ежемесячная оплата и обязанности иностранного работника.",
    links: ["Стоимость", "Сроки", "Проверка"],
  },
  {
    href: "/legal/check-ban",
    icon: MapPinned,
    eyebrow: "Правовой риск",
    title: "Запрет на въезд",
    text: "Как проверить сведения, понять основание ограничения и выбрать следующий шаг.",
    links: ["Проверка", "Причины", "Обжалование"],
  },
];

export default function PathwaysHub() {
  return (
    <div className="site-container py-12 sm:py-20">
      <header className="grid items-end gap-6 lg:grid-cols-[1fr_30rem]">
        <div>
          <p className="section-kicker">Каталог инструкций</p>
          <h1 className="display-title mt-4 max-w-[12ch]">Выберите путь легализации</h1>
        </div>
        <p className="text-lg leading-8 text-[#667287]">
          Начните со статуса или жизненной ситуации. Внутри каждого раздела собраны основания, документы, сроки и связанные сервисы.
        </p>
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {paths.map((path) => (
          <Link
            key={path.href}
            href={path.href}
            className={`group flex min-h-72 flex-col rounded-[1.6rem] p-6 transition-transform hover:-translate-y-1 sm:p-8 ${
              path.featured ? "bg-[#02629f] text-white" : "surface-card"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${path.featured ? "bg-white/14" : "bg-[#edf2fd] text-[#02629f]"}`}>
                <path.icon className="h-6 w-6" />
              </span>
              <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${path.featured ? "text-[#ff8588]" : "text-[#ff2e32]"}`} />
            </div>
            <span className={`mt-8 text-xs font-extrabold uppercase tracking-[0.08em] ${path.featured ? "text-white/55" : "text-[#ff2e32]"}`}>{path.eyebrow}</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.045em]">{path.title}</h2>
            <p className={`mt-3 min-h-12 max-w-xl text-sm leading-6 ${path.featured ? "text-white/70" : "text-[#667287]"}`}>{path.text}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {path.links.map((item) => (
                <span key={item} className={`rounded-lg px-3 py-2 text-xs font-bold ${path.featured ? "bg-white/12" : "bg-[#f4f6fa] text-[#4f5c70]"}`}>{item}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 grid items-center gap-6 rounded-[1.6rem] bg-[#1f2c41] p-7 text-white sm:p-9 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.04em]">Не знаете, с какого статуса начать?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Опишите исходные данные ИИ-помощнику. Он найдёт подходящие разделы справочника и даст ссылки на материалы.</p>
        </div>
        <Link href="/tools/ai-consultant" className="button-primary">Подобрать маршрут <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
