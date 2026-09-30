import {
  containsLegacyBlockTokens,
  parseLegacyBlocks,
  replaceLegacyBlockTokens,
  type LegacyBlock,
} from "@/lib/cms/legacy-blocks";

type RecordValue = Record<string, unknown>;

type PageRecord = {
  id: number | string;
  path?: unknown;
  content?: unknown;
  legacyMarkdown?: unknown;
  draftVersion: boolean;
};

type TokenOccurrence = {
  token: string;
  replaceable: boolean;
};

type PagePlan = {
  page: PageRecord;
  state: "unchanged" | "ready" | "skip";
  tokens: string[];
  blocks: LegacyBlock[];
  content?: unknown;
  reason?: string;
};

const TOKEN_PATTERN = /CMS_BLOCK_\d+/gi;
const TEST_DATABASE_NAME = "fms3_stage0_verify";
const PRODUCTION_DATABASE_NAME = "fms3";
const MAX_PAGES = 1000;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function walkLexicalNodes(content: unknown, visit: (node: RecordValue, parent: RecordValue | null) => void) {
  const walk = (value: unknown, parent: RecordValue | null = null): void => {
    if (Array.isArray(value)) {
      for (const child of value) walk(child, parent);
      return;
    }
    if (!isRecord(value)) return;

    visit(value, parent);
    if (Array.isArray(value.children)) walk(value.children, value);
  };

  if (isRecord(content) && isRecord(content.root)) walk(content.root);
  else walk(content);
}

function collectTokenOccurrences(content: unknown): TokenOccurrence[] {
  const occurrences: TokenOccurrence[] = [];

  walkLexicalNodes(content, (node, parent) => {
    if (typeof node.text !== "string") return;

    const matches = [...node.text.matchAll(new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags))];
    for (const match of matches) {
      const token = match[0].toUpperCase();
      const isExactText = matches.length === 1 && node.text.trim().toUpperCase() === token;
      const isSingleTextParagraph = Boolean(
        parent
        && parent.type === "paragraph"
        && Array.isArray(parent.children)
        && parent.children.length === 1
        && parent.children[0] === node,
      );

      occurrences.push({ token, replaceable: isExactText && isSingleTextParagraph });
    }
  });

  return occurrences;
}

function collectBlockNodes(content: unknown) {
  const blocks: RecordValue[] = [];
  walkLexicalNodes(content, (node) => {
    if (node.type === "block") blocks.push(node);
  });
  return blocks;
}

function formatTypeCounts(blocks: readonly LegacyBlock[]) {
  const counts = new Map<string, number>();
  for (const block of blocks) counts.set(block.blockType, (counts.get(block.blockType) ?? 0) + 1);
  return [...counts.entries()].map(([type, count]) => `${type}:${count}`).join(",") || "-";
}

function pageLabel(page: PageRecord) {
  const path = typeof page.path === "string" && page.path.length > 0 ? page.path : `id:${page.id}`;
  return `${path} version=${page.draftVersion ? "draft" : "published"}`;
}

function publishedPageUpdateData(content: unknown) {
  return { content, _status: "published" };
}

function makePagePlan(page: PageRecord): PagePlan {
  const occurrences = collectTokenOccurrences(page.content);
  const tokens = occurrences.map(({ token }) => token);

  if (tokens.length === 0) {
    return { page, state: "unchanged", tokens, blocks: [] };
  }

  if (typeof page.legacyMarkdown !== "string" || page.legacyMarkdown.trim().length === 0) {
    return { page, state: "skip", tokens, blocks: [], reason: "missing_legacy_markdown" };
  }

  const blocks = parseLegacyBlocks(page.legacyMarkdown);
  const blockByToken = new Map<string, LegacyBlock>();
  const duplicateSourceTokens = new Set<string>();
  for (const block of blocks) {
    const token = block.token.toUpperCase();
    if (blockByToken.has(token)) duplicateSourceTokens.add(token);
    blockByToken.set(token, block);
  }

  const tokenCounts = new Map<string, number>();
  for (const token of tokens) tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);

  const unknownTokens = [...new Set(tokens)].filter((token) => !blockByToken.has(token));
  const duplicateTokens = [...tokenCounts.entries()].filter(([, count]) => count > 1).map(([token]) => token);
  const unreplaceableTokens = [...new Set(occurrences.filter(({ replaceable }) => !replaceable).map(({ token }) => token))];
  const duplicateIds = tokens
    .map((token) => `migration-${token.toLowerCase()}`)
    .filter((id, index, all) => all.indexOf(id) !== index);
  const existingIds = new Set(
    collectBlockNodes(page.content)
      .map((node) => isRecord(node.fields) ? node.fields.id : undefined)
      .filter((id): id is string => typeof id === "string"),
  );
  const conflictingIds = tokens
    .map((token) => `migration-${token.toLowerCase()}`)
    .filter((id) => existingIds.has(id));

  const reasons = [
    unknownTokens.length > 0 ? `unknown_tokens:${unknownTokens.join(",")}` : null,
    unreplaceableTokens.length > 0 ? `unsupported_token_location:${unreplaceableTokens.join(",")}` : null,
    duplicateTokens.length > 0 ? `duplicate_tokens:${duplicateTokens.join(",")}` : null,
    duplicateSourceTokens.size > 0 ? `duplicate_source_tokens:${[...duplicateSourceTokens].join(",")}` : null,
    duplicateIds.length > 0 ? `duplicate_block_ids:${[...new Set(duplicateIds)].join(",")}` : null,
    conflictingIds.length > 0 ? `existing_block_id_conflict:${[...new Set(conflictingIds)].join(",")}` : null,
  ].filter((reason): reason is string => reason !== null);

  if (reasons.length > 0) {
    return { page, state: "skip", tokens, blocks, reason: reasons.join(";") };
  }

  const content = replaceLegacyBlockTokens(page.content, blocks);
  const remainingOccurrences = collectTokenOccurrences(content);
  const blocksBefore = collectBlockNodes(page.content).length;
  const blocksAfter = collectBlockNodes(content).length;
  const expectedIds = new Map(
    tokens.map((token) => [
      `migration-${token.toLowerCase()}`,
      blockByToken.get(token)!.blockType,
    ]),
  );
  const generatedBlockNodes = collectBlockNodes(content).filter((node) => {
    const fields = isRecord(node.fields) ? node.fields : {};
    return typeof fields.id === "string" && expectedIds.has(fields.id);
  });
  const generatedTypesMatch = generatedBlockNodes.every((node) => {
    const fields = isRecord(node.fields) ? node.fields : {};
    return typeof fields.id === "string" && fields.blockType === expectedIds.get(fields.id);
  });

  if (remainingOccurrences.length > 0 || containsLegacyBlockTokens(content)) {
    return { page, state: "skip", tokens, blocks, reason: "not_all_tokens_replaced" };
  }
  if (blocksAfter - blocksBefore !== tokens.length || generatedBlockNodes.length !== tokens.length || !generatedTypesMatch) {
    return { page, state: "skip", tokens, blocks, reason: "replacement_validation_failed" };
  }

  return { page, state: "ready", tokens, blocks, content };
}

function parseTargetDatabase(databaseUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!database) throw new Error("DATABASE_URL must include a database name.");
  return { database, hostname };
}

function parseArguments(args: string[]) {
  const dryRun = args.includes("--dry-run");
  const apply = args.includes("--apply");
  const allowProduction = args.includes("--allow-production");
  const help = args.includes("--help") || args.includes("-h");
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

  if (help) {
    if (args.length !== 1) throw new Error("--help cannot be combined with other options.");
    return { help, dryRun: false, apply: false, allowProduction: false, targetDatabase: undefined };
  }
  if (dryRun === apply) throw new Error("Choose exactly one mode: --dry-run or --apply.");
  if (unknownArguments.length > 0) throw new Error(`Unknown options: ${unknownArguments.join(", ")}`);
  if (targetArgument && !targetDatabase) throw new Error("--target-db must include a database name.");
  if (apply && !targetDatabase) throw new Error("--apply requires --target-db=<database name>.");
  if (allowProduction && (!targetDatabase || targetDatabase !== PRODUCTION_DATABASE_NAME)) {
    throw new Error(`--allow-production requires --target-db=${PRODUCTION_DATABASE_NAME}.`);
  }

  return { help, dryRun, apply, allowProduction, targetDatabase };
}

function assertTarget(
  target: ReturnType<typeof parseTargetDatabase>,
  targetDatabase: string | undefined,
  allowProduction: boolean,
) {
  if (targetDatabase && target.database !== targetDatabase) {
    throw new Error("--target-db must exactly match the database name in DATABASE_URL.");
  }

  if (target.database === PRODUCTION_DATABASE_NAME) {
    if (!allowProduction || targetDatabase !== PRODUCTION_DATABASE_NAME) {
      throw new Error(`Production access requires both --target-db=${PRODUCTION_DATABASE_NAME} and --allow-production.`);
    }
    if (process.env.NODE_ENV !== "production") {
      throw new Error("Production access is allowed only when NODE_ENV=production.");
    }
    return;
  }

  if (allowProduction) {
    throw new Error(`--allow-production can only target ${PRODUCTION_DATABASE_NAME}.`);
  }
  if (!new Set(["localhost", "127.0.0.1", "::1"]).has(target.hostname)) {
    throw new Error("Non-production runs only accept a loopback database connection.");
  }
  if (target.database !== TEST_DATABASE_NAME) {
    throw new Error(`Non-production runs are allowed only on ${TEST_DATABASE_NAME}.`);
  }
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[DATABASE_URL]").slice(0, 300);
}

async function main() {
  const { help, dryRun, apply, allowProduction, targetDatabase } = parseArguments(process.argv.slice(2));
  if (help) {
    console.log("Usage: node payload-backfill-legacy-blocks.mjs (--dry-run | --apply --target-db=<name>) [--target-db=<name>] [--allow-production]");
    console.log("Production requires --target-db=fms3 --allow-production and NODE_ENV=production.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");

  process.env.PAYLOAD_DB_PUSH = "false";
  process.env.PAYLOAD_PROJECT_ROOT ||= process.cwd();
  const target = parseTargetDatabase(databaseUrl);
  assertTarget(target, targetDatabase, allowProduction);

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
      where: { _status: { equals: "published" } },
    });
    const draftResult = await payload.find({
      collection: "pages",
      depth: 0,
      draft: true,
      limit: MAX_PAGES,
      overrideAccess: true,
    });

    if (result.hasNextPage || draftResult.hasNextPage) {
      throw new Error(`Page count exceeds the safety cap of ${MAX_PAGES}; increase the cap only after review.`);
    }

    const publishedPages = (result.docs as unknown as Omit<PageRecord, "draftVersion">[])
      .map((page) => ({ ...page, draftVersion: false }));
    const draftPages = (draftResult.docs as unknown as Array<Omit<PageRecord, "draftVersion"> & { _status?: unknown }>)
      .filter((page) => page._status === "draft")
      .map((page) => ({ ...page, draftVersion: true }));
    const pages = [...publishedPages, ...draftPages];
    const plans = pages.map(makePagePlan);
    const readyPlans = plans.filter((plan) => plan.state === "ready");
    const skippedPlans = plans.filter((plan) => plan.state === "skip");
    const unchangedPlans = plans.filter((plan) => plan.state === "unchanged");
    const productionLabel = target.database === PRODUCTION_DATABASE_NAME ? " PRODUCTION" : "";
    const mode = `${dryRun ? "DRY RUN" : "APPLY"}${productionLabel}`;

    console.log(`${mode} target=${target.database} schema_push=${process.env.PAYLOAD_DB_PUSH} published_pages=${publishedPages.length} draft_versions=${draftPages.length}`);
    for (const plan of plans) {
      const blockSummary = formatTypeCounts(plan.blocks);
      const tokenSummary = [...new Set(plan.tokens)].join(",") || "-";
      console.log(`${plan.state.toUpperCase()} ${pageLabel(plan.page)} markers=${plan.tokens.length} tokens=${tokenSummary} blocks=${blockSummary}${plan.reason ? ` reason=${plan.reason}` : ""}`);
    }

    if (pages.length === 0) throw new Error("No Pages were returned from the target database.");

    let updated = 0;
    let updateFailures = 0;
    if (apply) {
      for (const plan of readyPlans) {
        try {
          const data = plan.page.draftVersion
            ? { content: plan.content }
            : publishedPageUpdateData(plan.content);
          await payload.update({
            collection: "pages",
            id: plan.page.id,
            data: data as never,
            draft: plan.page.draftVersion,
            overrideAccess: true,
          });
          updated += 1;
          console.log(`UPDATED ${pageLabel(plan.page)} blocks=${plan.tokens.length}`);
        } catch (error) {
          updateFailures += 1;
          console.error(`UPDATE_FAILED ${pageLabel(plan.page)} error=${safeErrorMessage(error)}`);
        }
      }
    }

    const blockCount = readyPlans.reduce((total, plan) => total + plan.tokens.length, 0);
    console.log(`${mode} summary scanned_variants=${pages.length} ready_variants=${readyPlans.length} ready_block_instances=${blockCount} skipped_variants=${skippedPlans.length} unchanged_variants=${unchangedPlans.length} updated_variants=${updated} update_failures=${updateFailures}`);
    if (skippedPlans.length > 0) console.log("Review skipped pages before considering the backfill complete.");
    if (updateFailures > 0) process.exitCode = 1;
  } finally {
    await payload.destroy();
  }
}

main().catch((error) => {
  console.error(`Legacy block backfill failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
}).finally(() => {
  const exitCode = process.exitCode ?? 0;
  process.stdout.write("", () => {
    process.stderr.write("", () => process.exit(exitCode));
  });
});
