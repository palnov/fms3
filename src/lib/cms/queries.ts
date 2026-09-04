import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { DataTableDefinition, InputValue, ToolDefinition } from "@/lib/no-code-runtime/types";

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
    return result.docs[0] ? toSerializable(result.docs[0]) as unknown as CmsPage : null;
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
    return result.docs[0] ? toSerializable(result.docs[0]) as unknown as CmsPage : null;
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
    return result.docs[0] ? toSerializable(result.docs[0]) as unknown as CmsTool : null;
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
    return result.docs[0] ? toSerializable(result.docs[0]) as unknown as CmsTool : null;
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

export async function getPublishedContentPaths(): Promise<{ pages: CmsContentPath[]; tools: CmsContentPath[] }> {
  if (!isPayloadEnabled()) return { pages: [], tools: [] };

  try {
    const payload = await getPayload({ config: configPromise });
    const [pages, tools] = await Promise.all([
      payload.find({ collection: "pages", depth: 0, limit: 1000, where: { _status: { equals: "published" } }, select: { path: true, updatedAt: true } }),
      payload.find({ collection: "tools", depth: 0, limit: 1000, where: { _status: { equals: "published" } }, select: { slug: true, updatedAt: true } }),
    ]);

    return {
      pages: pages.docs
        .map<CmsContentPath>((page) => ({
          path: typeof page.path === "string" ? page.path : "",
          updatedAt: typeof page.updatedAt === "string" ? page.updatedAt : undefined,
        }))
        .filter((page) => Boolean(page.path)),
      tools: tools.docs
        .map<CmsContentPath>((tool) => ({
          path: typeof tool.slug === "string" ? tool.slug : "",
          updatedAt: typeof tool.updatedAt === "string" ? tool.updatedAt : undefined,
        }))
        .filter((tool) => Boolean(tool.path)),
    };
  } catch {
    return { pages: [], tools: [] };
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
