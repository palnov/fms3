import Link from "next/link";
import ArticleSidebar from "@/components/mdx/ArticleSidebar";

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-motion="section" className="article-shell">
      <div className="mb-4 text-sm font-semibold text-[#667287]">
        <Link href="/">Главная</Link>
        <span className="mx-2">/</span>
        <Link href="/pathways">Инструкции</Link>
      </div>
      <div className="article-frame">
        <article className="article-main mdx-prose" data-article-content>{children}</article>
        <ArticleSidebar />
      </div>
    </div>
  );
}
