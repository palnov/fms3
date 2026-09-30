import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import CmsPageRenderer, { cmsPageMetadata } from "@/components/cms/CmsPageRenderer";
import { LegacyPage } from "@/legacy/legacy-pages";
import { getPageByPath, hasCmsPageByPath } from "@/lib/cms/queries";
import { getLegacyMetadata } from "@/lib/cms/legacy-metadata";
import CmsPreviewUnavailable from "@/components/cms/CmsPreviewUnavailable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const draft = (await draftMode()).isEnabled;
  const page = await getPageByPath("/", draft);
  if (page) return cmsPageMetadata(page, draft);
  return draft ? { title: "Предпросмотр недоступен", robots: { index: false, follow: false } } : getLegacyMetadata("/") ?? {};
}

export default async function HomePage() {
  const draft = (await draftMode()).isEnabled;
  const page = await getPageByPath("/", draft);
  if (page) return <CmsPageRenderer page={page} isPreview={draft} />;
  if (draft) return <CmsPreviewUnavailable />;
  if (await hasCmsPageByPath("/")) notFound();
  return <LegacyPage path="/" />;
}
