import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import CmsPageRenderer, { cmsPageMetadata } from "@/components/cms/CmsPageRenderer";
import CmsToolPage, { cmsToolMetadata } from "@/components/cms/CmsToolPage";
import { hasLegacyPage, LegacyPage } from "@/legacy/legacy-pages";
import { getLegacyMetadata } from "@/lib/cms/legacy-metadata";
import { getPageByPath, getToolBySlug, getToolDataTables, hasCmsPageByPath, hasCmsToolBySlug } from "@/lib/cms/queries";

export const dynamic = "force-dynamic";

type PublicRouteProps = { params: Promise<{ slug: string[] }> };

function getPath(slug: string[]) {
  return `/${slug.join("/")}`;
}

export async function generateMetadata({ params }: PublicRouteProps): Promise<Metadata> {
  const path = getPath((await params).slug);
  const draft = (await draftMode()).isEnabled;
  const tool = path.startsWith("/tools/") ? await getToolBySlug(path, draft) : null;
  if (tool) return cmsToolMetadata(tool);
  const page = await getPageByPath(path, draft);
  if (page) return cmsPageMetadata(page);
  const cmsRecordExists = path.startsWith("/tools/") ? await hasCmsToolBySlug(path) : await hasCmsPageByPath(path);
  if (cmsRecordExists) notFound();
  const legacyMetadata = getLegacyMetadata(path);
  if (legacyMetadata) return legacyMetadata;
  if (hasLegacyPage(path)) return {};
  notFound();
}

export default async function PublicRoute({ params }: PublicRouteProps) {
  const path = getPath((await params).slug);
  const draft = (await draftMode()).isEnabled;

  if (path.startsWith("/tools/")) {
    const tool = await getToolBySlug(path, draft);
    if (tool) return <CmsToolPage tool={tool} tables={await getToolDataTables(tool, draft)} />;
    if (await hasCmsToolBySlug(path)) notFound();
  }

  const page = await getPageByPath(path, draft);
  if (page) return <CmsPageRenderer page={page} />;
  if (await hasCmsPageByPath(path)) notFound();

  if (hasLegacyPage(path)) return <LegacyPage path={path} />;
  notFound();
}
