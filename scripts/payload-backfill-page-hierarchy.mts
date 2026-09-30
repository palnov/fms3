type RecordValue = Record<string, unknown>;
type PageId = number | string;

type PageRecord = {
  id: PageId;
  path?: unknown;
  parent?: unknown;
  treeOrder?: unknown;
  content?: unknown;
  _status?: unknown;
  draftVersion: boolean;
};

type PagePlan = {
  page: PageRecord;
  state: "unchanged" | "ready";
  parentId?: PageId;
  treeOrder?: number;
  content?: unknown;
  linkStats: LinkStats;
};

type LinkStats = {
  linkedInternal: number;
  preservedExternal: number;
  unresolvedInternal: number;
  internalWithSuffix: number;
};

const PRODUCTION_DATABASE_NAME = "fms3";
const MAX_PAGES = 1000;
const PRODUCTION_ORIGIN = "https://ufms-help.ru";

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function relationId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!isRecord(value)) return null;
  if (typeof value.id === "string" || typeof value.id === "number") return String(value.id);
  if (typeof value.value === "string" || typeof value.value === "number") return String(value.value);
  return null;
}

function parseArguments(args: string[]) {
  const help = args.includes("--help") || args.includes("-h");
  if (help) {
    if (args.length !== 1) throw new Error("--help cannot be combined with other options.");
    return { help: true, dryRun: false, apply: false, targetDatabase: undefined, allowProduction: false };
  }

  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const allowProduction = args.includes("--allow-production");
  const targetArgument = args.find((argument) => argument.startsWith("--target-db="));
  const targetDatabase = targetArgument?.slice("--target-db=".length);
  const unknownArguments = args.filter((argument) =>
    argument !== "--dry-run"
    && argument !== "--apply"
    && argument !== "--allow-production"
    && argument !== "--help"
    && argument !== "-h"
    && !argument.startsWith("--target-db="),
  );

  if (dryRun === apply) throw new Error("Choose exactly one mode: --dry-run or --apply.");
  if (unknownArguments.length > 0) throw new Error(`Unknown options: ${unknownArguments.join(", ")}`);
  if (targetDatabase !== PRODUCTION_DATABASE_NAME || !allowProduction) {
    throw new Error(`Production backfill requires --target-db=${PRODUCTION_DATABASE_NAME} --allow-production.`);
  }

  return { help: false, dryRun, apply, targetDatabase, allowProduction };
}

function assertProductionDatabase(databaseUrl: string, targetDatabase: string | undefined) {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (database !== targetDatabase || database !== PRODUCTION_DATABASE_NAME) {
    throw new Error("DATABASE_URL database does not match the exact production target.");
  }
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[DATABASE_URL]").slice(0, 300);
}

function getParentPath(pathname: string) {
  if (!pathname.startsWith("/") || pathname === "/") return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  return segments.length === 1 ? "/" : `/${segments.slice(0, -1).join("/")}`;
}

function internalHrefPath(href: string, siteOrigin: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const url = new URL(trimmed, siteOrigin);
    return { path: url.pathname, suffix: `${url.search}${url.hash}` };
  }

  if (!/^https?:\/\//i.test(trimmed)) return null;
  try {
    const target = new URL(trimmed);
    const base = new URL(siteOrigin);
    if (target.hostname.replace(/^www\./i, "").toLowerCase() !== base.hostname.replace(/^www\./i, "").toLowerCase()) return null;
    return { path: target.pathname, suffix: `${target.search}${target.hash}` };
  } catch {
    return null;
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function addLinkToPage(fields: RecordValue, pageIdsByPath: Map<string, PageId[]>, siteOrigin: string, stats: LinkStats) {
  const href = typeof fields.href === "string" ? fields.href : "";
  if (!href.trim() || relationId(fields.page) || (typeof fields.externalHref === "string" && fields.externalHref.trim())) return false;

  const internal = internalHrefPath(href, siteOrigin);
  if (!internal) {
    fields.externalHref = href;
    stats.preservedExternal += 1;
    return true;
  }

  if (internal.suffix) {
    fields.externalHref = href;
    stats.internalWithSuffix += 1;
    return true;
  }

  const targets = pageIdsByPath.get(internal.path) ?? [];
  if (targets.length === 1) {
    fields.page = targets[0];
    stats.linkedInternal += 1;
    return true;
  }

  fields.externalHref = href;
  stats.unresolvedInternal += 1;
  return true;
}

function migrateBlockLinks(content: unknown, pageIdsByPath: Map<string, PageId[]>, siteOrigin: string) {
  const result = content && typeof content === "object" ? cloneJson(content) : content;
  const stats: LinkStats = { linkedInternal: 0, preservedExternal: 0, unresolvedInternal: 0, internalWithSuffix: 0 };
  let changed = false;

  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!isRecord(value)) return;

    const fields = isRecord(value.fields) ? value.fields : value;
    const blockType = typeof fields.blockType === "string" ? fields.blockType : value.blockType;
    if (blockType === "relatedGuide") {
      changed = addLinkToPage(fields, pageIdsByPath, siteOrigin, stats) || changed;
    } else if (blockType === "linkCardGrid" && Array.isArray(fields.items)) {
      for (const item of fields.items) {
        if (isRecord(item)) changed = addLinkToPage(item, pageIdsByPath, siteOrigin, stats) || changed;
      }
    }

    if (Array.isArray(value.children)) value.children.forEach(walk);
  };

  walk(result);
  return { content: result, changed, stats };
}

function publishedPathIndex(pages: PageRecord[]) {
  const index = new Map<string, PageId[]>();
  for (const page of pages) {
    if (typeof page.path !== "string" || page._status === "draft") continue;
    const values = index.get(page.path) ?? [];
    values.push(page.id);
    index.set(page.path, values);
  }
  return index;
}

function desiredParents(pages: PageRecord[], publishedIndex: Map<string, PageId[]>) {
  const byPageId = new Map<string, { id: PageId; path: string; parentId: PageId }>();
  const unmappedPaths = new Set<string>();
  const ambiguousPaths = new Set<string>();

  for (const page of pages) {
    const id = String(page.id);
    if (byPageId.has(id) || relationId(page.parent) || typeof page.path !== "string") continue;
    const parentPath = getParentPath(page.path);
    if (!parentPath) continue;
    const candidates = publishedIndex.get(parentPath) ?? [];
    if (candidates.length === 1 && String(candidates[0]) !== id) {
      byPageId.set(id, { id: page.id, path: page.path, parentId: candidates[0] });
    } else if (candidates.length > 1) {
      ambiguousPaths.add(page.path);
    } else {
      unmappedPaths.add(page.path);
    }
  }

  const groups = new Map<string, Array<{ id: PageId; path: string }>>();
  for (const item of byPageId.values()) {
    const siblings = groups.get(String(item.parentId)) ?? [];
    siblings.push({ id: item.id, path: item.path });
    groups.set(String(item.parentId), siblings);
  }

  const orders = new Map<string, number>();
  for (const siblings of groups.values()) {
    siblings.sort((left, right) => left.path.localeCompare(right.path));
    siblings.forEach((sibling, index) => orders.set(String(sibling.id), index));
  }

  return { byPageId, orders, unmappedPaths, ambiguousPaths };
}

function makePlans(
  pages: PageRecord[],
  publishedIndex: Map<string, PageId[]>,
  siteOrigin: string,
) {
  const hierarchy = desiredParents(pages, publishedIndex);
  const plans = pages.map((page): PagePlan => {
    const desired = relationId(page.parent) ? undefined : hierarchy.byPageId.get(String(page.id));
    const desiredOrder = desired ? hierarchy.orders.get(String(page.id)) : undefined;
    const pageOrder = typeof page.treeOrder === "number" ? page.treeOrder : 0;
    const linkResult = migrateBlockLinks(page.content, publishedIndex, siteOrigin);
    const needsParent = Boolean(desired && String(desired.parentId) !== String(page.id));
    const needsOrder = Boolean(needsParent && desiredOrder !== undefined && pageOrder !== desiredOrder);
    const changed = needsParent || needsOrder || linkResult.changed;

    return {
      page,
      state: changed ? "ready" : "unchanged",
      ...(needsParent ? { parentId: desired!.parentId } : {}),
      ...(needsOrder ? { treeOrder: desiredOrder } : {}),
      ...(linkResult.changed ? { content: linkResult.content } : {}),
      linkStats: linkResult.stats,
    };
  });

  return { plans, hierarchy };
}

function pageLabel(page: PageRecord) {
  const path = typeof page.path === "string" && page.path ? page.path : `id:${page.id}`;
  return `${path} version=${page.draftVersion ? "draft" : "published"}`;
}

async function main() {
  const { help, dryRun, apply, targetDatabase } = parseArguments(process.argv.slice(2));
  if (help) {
    console.log("Usage: node payload-backfill-page-hierarchy.mjs (--dry-run | --apply) --target-db=fms3 --allow-production");
    return;
  }
  if (process.env.NODE_ENV !== "production") throw new Error("Production backfill is allowed only in NODE_ENV=production.");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  assertProductionDatabase(databaseUrl, targetDatabase);

  process.env.PAYLOAD_DB_PUSH = "false";
  process.env.PAYLOAD_PROJECT_ROOT ||= process.cwd();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_ORIGIN;
  new URL(origin);

  const { getPayload } = await import("payload");
  const { default: configPromise } = await import("../src/payload.config.mjs");
  const payload = await getPayload({ config: configPromise });

  try {
    const result = await payload.find({
      collection: "pages",
      depth: 0,
      draft: false,
      limit: MAX_PAGES,
      overrideAccess: true,
      select: { id: true, path: true, parent: true, treeOrder: true, content: true, _status: true },
      where: { _status: { equals: "published" } },
    });
    const draftResult = await payload.find({
      collection: "pages",
      depth: 0,
      draft: true,
      limit: MAX_PAGES,
      overrideAccess: true,
      select: { id: true, path: true, parent: true, treeOrder: true, content: true, _status: true },
    });

    if (result.hasNextPage || draftResult.hasNextPage) {
      throw new Error(`Page count exceeds the safety cap of ${MAX_PAGES}; increase the cap only after review.`);
    }

    const publishedPages = (result.docs as unknown as Array<Omit<PageRecord, "draftVersion">>)
      .map((page) => ({ ...page, draftVersion: false }));
    const draftPages = (draftResult.docs as unknown as Array<Omit<PageRecord, "draftVersion">>)
      .filter((page) => page._status === "draft")
      .map((page) => ({ ...page, draftVersion: true }));
    const pages = [...publishedPages, ...draftPages];
    if (pages.length === 0) throw new Error("No Pages were returned from the production database.");

    const pageIdsByPath = publishedPathIndex(publishedPages);
    const { plans, hierarchy } = makePlans(pages, pageIdsByPath, origin);
    const readyPlans = plans.filter((plan) => plan.state === "ready");
    const unchangedPlans = plans.filter((plan) => plan.state === "unchanged");
    const summary = plans.reduce((total, plan) => ({
      linkedInternal: total.linkedInternal + plan.linkStats.linkedInternal,
      preservedExternal: total.preservedExternal + plan.linkStats.preservedExternal,
      unresolvedInternal: total.unresolvedInternal + plan.linkStats.unresolvedInternal,
      internalWithSuffix: total.internalWithSuffix + plan.linkStats.internalWithSuffix,
    }), { linkedInternal: 0, preservedExternal: 0, unresolvedInternal: 0, internalWithSuffix: 0 });

    console.log(`${dryRun ? "DRY RUN" : "APPLY"} PRODUCTION target=${targetDatabase} schema_push=${process.env.PAYLOAD_DB_PUSH} published_pages=${publishedPages.length} draft_versions=${draftPages.length}`);
    for (const plan of plans) {
      console.log(`${plan.state.toUpperCase()} ${pageLabel(plan.page)} parent=${plan.parentId ?? "-"} order=${plan.treeOrder ?? "-"} linked=${plan.linkStats.linkedInternal} external=${plan.linkStats.preservedExternal} unresolved=${plan.linkStats.unresolvedInternal} suffix=${plan.linkStats.internalWithSuffix}`);
    }

    let updated = 0;
    let updateFailures = 0;
    if (apply) {
      for (const plan of readyPlans) {
        const data: Record<string, unknown> = {};
        if (plan.parentId !== undefined) data.parent = plan.parentId;
        if (plan.treeOrder !== undefined) data.treeOrder = plan.treeOrder;
        if (plan.content !== undefined) data.content = plan.content;
        if (!plan.page.draftVersion) data._status = "published";

        try {
          await payload.update({
            collection: "pages",
            id: plan.page.id,
            data: data as never,
            draft: plan.page.draftVersion,
            overrideAccess: true,
          });
          updated += 1;
          console.log(`UPDATED ${pageLabel(plan.page)}`);
        } catch (error) {
          updateFailures += 1;
          console.error(`UPDATE_FAILED ${pageLabel(plan.page)} error=${safeErrorMessage(error)}`);
        }
      }
    }

    console.log(`SUMMARY scanned_variants=${pages.length} ready_variants=${readyPlans.length} unchanged_variants=${unchangedPlans.length} updated_variants=${updated} update_failures=${updateFailures} pages_with_parent=${hierarchy.byPageId.size} unresolved_parent_paths=${hierarchy.unmappedPaths.size} ambiguous_parent_paths=${hierarchy.ambiguousPaths.size} internal_links=${summary.linkedInternal} external_links=${summary.preservedExternal} unresolved_internal_links=${summary.unresolvedInternal} internal_links_with_query_or_hash=${summary.internalWithSuffix}`);
    if (updateFailures > 0) process.exitCode = 1;
  } finally {
    await payload.destroy();
  }
}

main().catch((error) => {
  console.error(`Page hierarchy backfill failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
}).finally(() => {
  const exitCode = process.exitCode ?? 0;
  process.stdout.write("", () => {
    process.stderr.write("", () => process.exit(exitCode));
  });
});
