import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarCheck } from "lucide-react";
import ArticleLayout from "@/components/mdx/ArticleLayout";
import LexicalRenderer from "@/components/cms/LexicalRenderer";
import HomePage from "@/legacy/pages/home/page";
import type { CmsPage } from "@/lib/cms/queries";
import { getSiteOrigin } from "@/lib/runtime-config";

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

export function cmsPageMetadata(page: CmsPage): Metadata {
  const seo = page.seo;
  const title = seo?.title || page.title;
  const description = seo?.description || page.description;
  const canonical = absoluteUrl(seo?.canonical || page.path);
  const ogImage = absoluteUrl(imageUrl(seo));

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
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

function CmsArticle({ page }: { page: CmsPage }) {
  return (
    <ArticleLayout>
      <CmsArticleMeta page={page} />
      <h1>{page.title}</h1>
      <LexicalRenderer page={page} />
    </ArticleLayout>
  );
}

function CmsPlainPage({ page }: { page: CmsPage }) {
  return (
    <div className="site-container cms-page py-12 sm:py-20">
      {page.eyebrow ? <p className="section-kicker">{page.eyebrow}</p> : null}
      <h1 className="display-title mt-4">{page.title}</h1>
      <div className="mdx-prose mt-10">
        <LexicalRenderer page={page} />
      </div>
    </div>
  );
}

export default function CmsPageRenderer({ page }: { page: CmsPage }) {
  if (page.path === "/" && page.homeContent) return <HomePage content={page.homeContent} />;
  if (page.kind === "landing" || page.kind === "policy") return <CmsPlainPage page={page} />;
  return <CmsArticle page={page} />;
}
