import Link from "next/link";
import ArticleSidebar from "@/components/mdx/ArticleSidebar";

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-motion="section" className="article-shell">
      <div className="article-breadcrumbs mb-4 text-sm font-semibold text-[#667287]" aria-label="Навигация по разделам">
        <Link href="/">Главная</Link>
        <span className="mx-2" aria-hidden="true">→</span>
        <Link href="/pathways">Инструкции</Link>
      </div>
      <div className="article-frame">
        <article className="article-main mdx-prose" data-article-content>{children}</article>
        <ArticleSidebar />
      </div>
    </div>
  );
}
