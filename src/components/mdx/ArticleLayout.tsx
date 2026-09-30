import React from "react";
import Link from "next/link";
import ArticleSidebar from "@/components/mdx/ArticleSidebar";

export type ArticleBreadcrumb = { label: string; href?: string };

export default function ArticleLayout({ children, breadcrumbs }: { children: React.ReactNode; breadcrumbs?: ArticleBreadcrumb[] }) {
  const navigation = breadcrumbs ?? [
    { label: "Главная", href: "/" },
    { label: "Инструкции", href: "/pathways" },
  ];

  return (
    <div data-motion="section" className="article-shell">
      <div className="article-breadcrumbs mb-4 text-sm font-semibold text-[#667287]" aria-label="Навигация по разделам">
        {navigation.map((breadcrumb, index) => (
          <React.Fragment key={`${breadcrumb.label}-${index}`}>
            {index > 0 ? <span className="mx-2" aria-hidden="true">→</span> : null}
            {breadcrumb.href && index < navigation.length - 1
              ? <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
              : <span aria-current={index === navigation.length - 1 ? "page" : undefined}>{breadcrumb.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="article-frame">
        <article className="article-main mdx-prose" data-article-content>{children}</article>
        <ArticleSidebar />
      </div>
    </div>
  );
}
