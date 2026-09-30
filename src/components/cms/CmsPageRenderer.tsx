import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarCheck } from "lucide-react";
import ArticleLayout from "@/components/mdx/ArticleLayout";
import type { ArticleBreadcrumb } from "@/components/mdx/ArticleLayout";
import LexicalRenderer from "@/components/cms/LexicalRenderer";
import HomePage from "@/legacy/pages/home/page";
import type { CmsPage, CmsPageReference } from "@/lib/cms/queries";
import { getSiteOrigin } from "@/lib/runtime-config";
import RefreshRouteOnSave from "@/components/cms/RefreshRouteOnSave";

function absoluteUrl(value: string | undefined) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${getSiteOrigin()}${value.startsWith("/") ? value : `/${value}`}`;
}

function imageUrl(value: CmsPage["seo"]) {
  if (!value || typeof value !== "object" || !("ogImage" in value)) return undefined;
  const image = value.ogImage;
  return typeof image === "string" ? image : image?.url;
}

function cmsBreadcrumbs(page: CmsPage): ArticleBreadcrumb[] {
  const parents: ArticleBreadcrumb[] = [];
  const seen = new Set([String(page.id)]);
  let current: CmsPage["parent"] = page.parent;

  for (let depth = 0; depth < 10 && current && typeof current === "object"; depth += 1) {
    const parent = current as CmsPageReference;
    const parentId = String(parent.id);
    if (seen.has(parentId)) break;
    seen.add(parentId);
    if (typeof parent.title === "string" && typeof parent.path === "string" && parent.path !== "/" && parent.path !== page.path) {
      parents.push({ label: parent.title, href: parent.path });
    }
    current = parent.parent;
  }

  return [
    { label: "Главная", href: "/" },
    ...parents.reverse(),
    { label: page.title },
  ];
}

function CmsBreadcrumbs({ page }: { page: CmsPage }) {
  if (page.path === "/") return null;
  return (
    <nav className="article-breadcrumbs mb-4 text-sm font-semibold text-[#667287]" aria-label="Навигация по разделам">
      {cmsBreadcrumbs(page).map((breadcrumb, index, items) => (
        <span key={`${breadcrumb.label}-${index}`}>
          {index > 0 ? <span className="mx-2" aria-hidden="true">→</span> : null}
          {breadcrumb.href && index < items.length - 1
            ? <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            : <span aria-current={index === items.length - 1 ? "page" : undefined}>{breadcrumb.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function CmsRelatedPages({ pages, currentPath }: { pages: CmsPage["relatedPages"]; currentPath: string }) {
  const relatedPages = (pages ?? []).filter((value): value is CmsPageReference => (
    Boolean(value && typeof value === "object" && typeof value.path === "string" && typeof value.title === "string" && value.path !== currentPath)
  ));
  if (relatedPages.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="cms-related-pages-title">
      <h2 id="cms-related-pages-title" className="!mb-5 !mt-0 !text-2xl !font-extrabold">Связанные материалы</h2>
      <div className="link-card-grid" data-toc-exclude>
        {relatedPages.map((related) => (
          <Link key={String(related.id)} href={related.path!} data-motion-card className="link-card">
            <span>Связанная инструкция</span>
            <strong>{related.title}</strong>
            <small>Открыть <span aria-hidden="true">→</span></small>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function cmsPageMetadata(page: CmsPage, isPreview = false): Metadata {
  const seo = page.seo;
  const title = seo?.title || page.title;
  const description = seo?.description || page.description;
  const canonical = absoluteUrl(seo?.canonical || page.path);
  const ogImage = absoluteUrl(imageUrl(seo));

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: isPreview || seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: page.path === "/" ? "website" : "article",
      url: canonical,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

function CmsArticleMeta({ page }: { page: CmsPage }) {
  if (!page.reviewedAt && !page.readingTime) return null;
  const reviewed = page.reviewedAt ? new Date(page.reviewedAt).toLocaleDateString("ru-RU") : null;
  return (
    <div className="article-meta" aria-label="Информация о материале">
      {reviewed ? <span><CalendarCheck aria-hidden="true" /> Проверено: <time dateTime={page.reviewedAt}>{reviewed}</time></span> : null}
      {page.readingTime ? <span><BookOpenCheck aria-hidden="true" /> {page.readingTime}</span> : null}
      <span>Подготовлено <Link href="/editorial-policy">редакцией по официальным источникам</Link></span>
    </div>
  );
}

function CmsArticle({ page, isPreview }: { page: CmsPage; isPreview: boolean }) {
  return (
    <ArticleLayout breadcrumbs={cmsBreadcrumbs(page)}>
      <CmsArticleMeta page={page} />
      <h1>{page.title}</h1>
      <LexicalRenderer page={page} isPreview={isPreview} />
      <CmsRelatedPages pages={page.relatedPages} currentPath={page.path} />
    </ArticleLayout>
  );
}

function CmsPlainPage({ page, isPreview }: { page: CmsPage; isPreview: boolean }) {
  return (
    <div className="site-container cms-page py-12 sm:py-20">
      <CmsBreadcrumbs page={page} />
      {page.eyebrow ? <p className="section-kicker">{page.eyebrow}</p> : null}
      <h1 className="display-title mt-4">{page.title}</h1>
      <div className="mdx-prose mt-10">
        <LexicalRenderer page={page} isPreview={isPreview} />
        <CmsRelatedPages pages={page.relatedPages} currentPath={page.path} />
      </div>
    </div>
  );
}

export default function CmsPageRenderer({ page, isPreview = false }: { page: CmsPage; isPreview?: boolean }) {
  const content = page.path === "/" && page.homeContent
    ? <HomePage content={page.homeContent} />
    : page.kind === "landing" || page.kind === "policy"
      ? <CmsPlainPage page={page} isPreview={isPreview} />
      : <CmsArticle page={page} isPreview={isPreview} />;

  return (
    <>
      {isPreview ? (
        <aside className="sticky top-0 z-[70] flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950" role="status">
          <span>Черновой предпросмотр · изменения появятся после автосохранения</span>
          <Link className="font-bold underline underline-offset-2" href={`/api/cms/preview/exit?path=${encodeURIComponent(page.path)}`} prefetch={false}>Закрыть предпросмотр</Link>
        </aside>
      ) : null}
      {isPreview ? <RefreshRouteOnSave serverURL={getSiteOrigin()} /> : null}
      {content}
    </>
  );
}
