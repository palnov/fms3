import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-motion="section" className="article-shell">
      <div className="mb-4 text-sm font-semibold text-[#667287]">
        <Link href="/">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/pathways">Инструкции</Link>
      </div>
      <div className="article-frame">
        <article data-motion-card className="article-main mdx-prose">{children}</article>
        <aside className="article-aside" aria-label="Дополнительные материалы">
          <div data-motion-card className="article-aside-card">
            <strong className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#ff2e32]" /> Материал актуализируется</strong>
            <p>Мы указываем правовые основания и даты, но перед подачей документов проверяйте региональные требования.</p>
          </div>
          <div data-motion-card className="article-aside-card">
            <strong className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#02629f]" /> Не нашли свой случай?</strong>
            <p>ИИ-помощник найдёт ответ в базе знаний и предложит связанные инструкции.</p>
            <Link href="/tools/ai-consultant" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#02629f]">
              Задать вопрос <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
