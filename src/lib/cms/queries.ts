import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { DataTableDefinition, InputValue, ToolDefinition } from "@/lib/no-code-runtime/types";
import { restoreLegacyBlocks } from "@/lib/cms/legacy-blocks";

export type CmsSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string | { url?: string };
};

export type CmsPage = {
  id: string;
  path: string;
  sourceKey?: string;
  kind?: "article" | "landing" | "legal" | "policy";
  title: string;
  description: string;
  eyebrow?: string;
  tags?: string[];
  reviewedAt?: string;
  readingTime?: string;
  content?: unknown;
  contentBlocks?: Array<Record<string, unknown>>;
  homeContent?: unknown;
  legacyMarkdown?: string;
  seo?: CmsSeo;
  updatedAt?: string;
};

export type CmsTool = ToolDefinition & {
  id: string;
  sourceKey?: string;
  executionMode?: "runtime" | "provider";
  providerKey?: string;
  integration?: ToolDefinition["integration"];
  content?: unknown;
  legacyMarkdown?: string;
  dataTableKeys?: string[];
  seo?: CmsSeo;
  updatedAt?: string;
};

export type CmsSiteSettings = {
  siteName?: string;
  siteDescription?: string;
  siteUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  partnerPhone?: string;
  organizationName?: string;
  organizationDescription?: string;
  defaultOgImage?: string | { url?: string };
};

export type CmsContentPath = { path: string; updatedAt?: string };

function isPayloadEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeCmsPage(value: unknown): CmsPage {
  const page = toSerializable(value) as CmsPage;
  page.content = restoreLegacyBlocks(page.content, page.legacyMarkdown);
  return page;
}

function normalizeCmsTool(value: unknown): CmsTool {
  const tool = toSerializable(value) as Record<string, unknown>;
  if (!Array.isArray(tool.steps)) return tool as unknown as CmsTool;

  const steps = tool.steps.map((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const step = value as Record<string, unknown>;
    const { stepId, ...rest } = step;
    return { ...rest, id: typeof stepId === "string" ? stepId : rest.id };
  });

  return { ...tool, steps } as unknown as CmsTool;
}

async function findPageByPath(path: string): Promise<CmsPage | null> {
  if (!isPayloadEnabled()) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "pages",
      depth: 2,
      limit: 1,
      where: { path: { equals: path }, _status: { equals: "published" } },
    });
    return result.docs[0] ? normalizeCmsPage(result.docs[0]) : null;
  } catch {
    return null;
  }
}

async function findPageDraftByPath(path: string): Promise<CmsPage | null> {
  if (!isPayloadEnabled()) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "pages",
      depth: 2,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { path: { equals: path } },
    });
    return result.docs[0] ? normalizeCmsPage(result.docs[0]) : null;
  } catch {
    return null;
  }
}

async function hasPageRecordByPath(path: string): Promise<boolean> {
  if (!isPayloadEnabled()) return false;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { path: { equals: path } },
      select: { id: true },
    });
    return result.docs.length > 0;
  } catch {
    return false;
  }
}

const getCachedPage = unstable_cache(findPageByPath, ["cms-page-by-path"], {
  revalidate: 300,
  tags: ["cms-pages"],
});

export async function getPageByPath(path: string, draft = false) {
  return draft ? findPageDraftByPath(path) : getCachedPage(path);
}

export const hasCmsPageByPath = hasPageRecordByPath;

async function findToolBySlug(slug: string): Promise<CmsTool | null> {
  if (!isPayloadEnabled()) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "tools",
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug }, _status: { equals: "published" } },
    });
    return result.docs[0] ? normalizeCmsTool(result.docs[0]) : null;
  } catch {
    return null;
  }
}

async function findToolDraftBySlug(slug: string): Promise<CmsTool | null> {
  if (!isPayloadEnabled()) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "tools",
      depth: 2,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    });
    return result.docs[0] ? normalizeCmsTool(result.docs[0]) : null;
  } catch {
    return null;
  }
}

async function hasToolRecordBySlug(slug: string): Promise<boolean> {
  if (!isPayloadEnabled()) return false;

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "tools",
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
      select: { id: true },
    });
    return result.docs.length > 0;
  } catch {
    return false;
  }
}

const getCachedTool = unstable_cache(findToolBySlug, ["cms-tool-by-slug"], {
  revalidate: 300,
  tags: ["cms-tools"],
});

export async function getToolBySlug(slug: string, draft = false) {
  return draft ? findToolDraftBySlug(slug) : getCachedTool(slug);
}

export const hasCmsToolBySlug = hasToolRecordBySlug;

async function findDataTables(keys: string[], draft = false): Promise<DataTableDefinition[]> {
  if (!isPayloadEnabled() || keys.length === 0) return [];

  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: "data-tables",
      depth: 0,
      draft,
      limit: Math.min(keys.length, 100),
      overrideAccess: draft,
      where: { key: { in: keys } },
    });
    return toSerializable(result.docs) as unknown as DataTableDefinition[];
  } catch {
    return [];
  }
}

const getCachedDataTables = unstable_cache(findDataTables, ["cms-data-tables"], {
  revalidate: 300,
  tags: ["cms-data-tables"],
});

export async function getToolDataTables(tool: CmsTool, draft = false) {
  const keys = Array.isArray(tool.dataTableKeys) ? tool.dataTableKeys.filter((key): key is string => typeof key === "string") : [];
  return draft ? findDataTables(keys, true) : getCachedDataTables(keys);
}

async function findSiteSettings(): Promise<CmsSiteSettings | null> {
  if (!isPayloadEnabled()) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({
      slug: "site-settings",
      depth: 1,
    });
    return toSerializable(settings) as unknown as CmsSiteSettings;
  } catch {
    return null;
  }
}

const getCachedSiteSettings = unstable_cache(findSiteSettings, ["cms-site-settings"], {
  revalidate: 300,
  tags: ["cms-site-settings"],
});

export const getSiteSettings = getCachedSiteSettings;

export async function getPublishedContentPaths(): Promise<{
  pages: CmsContentPath[];
  tools: CmsContentPath[];
  unpublishedPages: string[];
  unpublishedTools: string[];
}> {
  if (!isPayloadEnabled()) return { pages: [], tools: [], unpublishedPages: [], unpublishedTools: [] };

  try {
    const payload = await getPayload({ config: configPromise });
    const [publishedPages, publishedTools, allPages, allTools] = await Promise.all([
      payload.find({ collection: "pages", depth: 0, limit: 1000, where: { _status: { equals: "published" } }, select: { path: true, updatedAt: true } }),
      payload.find({ collection: "tools", depth: 0, limit: 1000, where: { _status: { equals: "published" } }, select: { slug: true, updatedAt: true } }),
      payload.find({ collection: "pages", depth: 0, draft: true, overrideAccess: true, limit: 1000, select: { path: true } }),
      payload.find({ collection: "tools", depth: 0, draft: true, overrideAccess: true, limit: 1000, select: { slug: true } }),
    ]);

    const publishedPagePaths = publishedPages.docs
      .map((page) => {
        const record = page as Record<string, unknown>;
        return {
          path: typeof record.path === "string" ? record.path : "",
          updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
        };
      })
      .filter((page) => Boolean(page.path));
    const publishedToolPaths = publishedTools.docs
      .map((tool) => {
        const record = tool as Record<string, unknown>;
        return {
          path: typeof record.slug === "string" ? record.slug : "",
          updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
        };
      })
      .filter((tool) => Boolean(tool.path));
    const allPagePaths = allPages.docs
      .map((page) => (typeof (page as Record<string, unknown>).path === "string" ? (page as Record<string, unknown>).path as string : ""))
      .filter(Boolean);
    const allToolPaths = allTools.docs
      .map((tool) => (typeof (tool as Record<string, unknown>).slug === "string" ? (tool as Record<string, unknown>).slug as string : ""))
      .filter(Boolean);
    const publishedPagePathSet = new Set(publishedPagePaths.map((page) => page.path));
    const publishedToolPathSet = new Set(publishedToolPaths.map((tool) => tool.path));

    return {
      pages: publishedPagePaths,
      tools: publishedToolPaths,
      unpublishedPages: allPagePaths.filter((path) => !publishedPagePathSet.has(path)),
      unpublishedTools: allToolPaths.filter((path) => !publishedToolPathSet.has(path)),
    };
  } catch {
    return { pages: [], tools: [], unpublishedPages: [], unpublishedTools: [] };
  }
}

export function normalizeDataTableRows(rows: unknown): DataTableDefinition["rows"] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const source = row && typeof row === "object" ? row as Record<string, unknown> : {};
    const values = source.values && typeof source.values === "object" ? source.values as Record<string, InputValue> : {};
    return {
      key: typeof source.key === "string" ? source.key : "",
      effectiveFrom: typeof source.effectiveFrom === "string" ? source.effectiveFrom : undefined,
      effectiveTo: typeof source.effectiveTo === "string" ? source.effectiveTo : undefined,
      values,
    };
  });
}
