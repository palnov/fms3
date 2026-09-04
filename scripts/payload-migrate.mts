import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseExpression } from "@babel/parser";
import { createProcessor } from "@mdx-js/mdx";
import { convertMarkdownToLexical } from "@payloadcms/richtext-lexical";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { getPayload } from "payload";
import { articles } from "@/lib/articles";
import { getLegacyMetadata } from "@/lib/cms/legacy-metadata";
import { DEFAULT_HOME_CONTENT } from "@/lib/home-content";
import { seedPayload } from "@/payload/seed";

type AstRecord = {
  type?: string;
  name?: string;
  depth?: number;
  value?: string;
  operator?: string;
  position?: { start?: { offset?: number }; end?: { offset?: number } };
  attributes?: unknown[];
  children?: AstRecord[];
};

type Range = { start: number; end: number; replacement: string };
type MigratedBlock = { token: string; blockType: string; fields: Record<string, unknown> };

const ROOT = process.cwd();
const MDX_ROOT = path.join(ROOT, "src", "legacy", "pages");
const processor = createProcessor().use(remarkParse).use(remarkMdx).use(remarkGfm);

const BLOCK_NAMES: Record<string, string> = {
  ArticleMeta: "articleMeta",
  QuickAnswer: "quickAnswer",
  Notice: "notice",
  Warning: "warning",
  LegalSource: "legalSource",
  FaqAccordion: "faqAccordion",
  RelatedGuide: "relatedGuide",
  LinkCardGrid: "linkCardGrid",
  ConsultationBanner: "consultationBanner",
};

const MONTHS: Record<string, string> = {
  января: "01", февраля: "02", марта: "03", апреля: "04", мая: "05", июня: "06",
  июля: "07", августа: "08", сентября: "09", октября: "10", ноября: "11", декабря: "12",
};

const STATIC_PAGES = [
  {
    path: "/",
    kind: "landing",
    title: "Как жить и работать в России законно — РВП, ВНЖ, гражданство",
    description: "Понятные инструкции для иностранных граждан: переезд в Россию, РВП, ВНЖ, гражданство, работа, документы, сроки и онлайн-проверки.",
    homeContent: DEFAULT_HOME_CONTENT,
    markdown: "Главная страница хранится в Payload как структурированный контент: hero-блок, ситуации, статусы, обновления, сервисы, инструкции, помощь и FAQ.",
  },
  {
    path: "/pathways",
    kind: "landing",
    title: "Все пути легализации в России",
    description: "Сравните РВП, ВНЖ, гражданство, патент и программу переселения. Выберите подходящий маршрут и перейдите к пошаговой инструкции.",
    markdown: `Выберите нужный документ или ситуацию. Внутри каждого раздела собраны требования, документы, сроки и связанные сервисы.

## Вид на жительство

[Открыть раздел ВНЖ](/pathways/vnzh) — бессрочный статус, работа без патента и возможность двигаться к гражданству.

## РВП

[Открыть раздел РВП](/pathways/rvp) — статус на три года по квоте или предусмотренному законом основанию.

## Гражданство

[Открыть раздел гражданства](/pathways/citizenship) — общий и упрощённый порядок, требования, сроки и основания.

## Переселение и работа

[Программа переселения](/pathways/repatriation) · [Трудовой патент](/pathways/work/patent)

## Не знаете, с чего начать?

[Подберите маршрут в навигаторе](/tools/path-finder) или задайте вопрос [ИИ-консультанту](/tools/ai-consultant).`,
  },
  {
    path: "/privacy",
    kind: "policy",
    title: "Конфиденциальность и обработка данных",
    description: "Как Миграционный справочник обрабатывает обращения, диалоги с ИИ и аналитические данные.",
    markdown: `Последнее обновление: 10 июля 2026 года.

Эта страница описывает фактическую работу сайта и не заменяет индивидуальную юридическую консультацию по требованиям к оператору персональных данных.

## Какие данные обрабатываются

- вопросы и сообщения, отправленные ИИ-консультанту;
- имя, телефон и описание ситуации, добровольно отправленные через форму связи;
- технические сведения браузера, IP-адрес, cookies и данные использования сайта, собираемые Яндекс Метрикой;
- анонимные идентификаторы, необходимые для ограничения количества запросов и сохранения диалога.

## Цели и сроки

Данные используются для ответа на вопросы, передачи заказанного обращения специалисту, защиты сервисов от злоупотреблений и улучшения интерфейса. Журнал диалогов ИИ по умолчанию хранится 60 дней. Локальная история в браузере хранится до её очистки пользователем.

## Внешние сервисы

Текст вопросов ИИ передаётся OpenRouter для формирования ответа. Контактные обращения передаются сервису приёма лидов Feedot/Правовед. Яндекс Метрика и Webvisor собирают сведения об использовании сайта.

Не отправляйте в открытом сообщении пароли, платёжные данные и сканы документов.`,
  },
  {
    path: "/editorial-policy",
    kind: "policy",
    title: "Редакционная политика",
    description: "Как Миграционный справочник проверяет сроки, суммы и требования по официальным источникам и исправляет материалы.",
    markdown: `«Миграционный справочник» — независимый информационный проект. Мы не являемся подразделением МВД, государственным сервисом или юридической фирмой.

## На каких источниках основаны материалы

- официальные публикации МВД России и его территориальных органов;
- тексты нормативных актов на официальном интернет-портале правовой информации;
- официальные разъяснения ФНС, Минтруда, Правительства России и других ведомств;
- формы заявлений и административные регламенты, действующие на дату проверки.

## Как проверяются сроки, суммы и требования

В статье указывается дата последней проверки. Изменчивые сведения перед оплатой или подачей документов следует повторно сверить с официальным ресурсом и подразделением по месту обращения. Региональные платежи, графики и перечни документов могут различаться.

## Исправления и обновления

При изменении закона, формы или официального порядка редакция обновляет текст и дату проверки. Если сведения зависят от фактов конкретного дела, статья объясняет общую норму и предлагает задать вопрос [ИИ-помощнику](/tools/ai-consultant) либо обратиться за индивидуальной консультацией.

## Границы ответственности

Публикации носят справочный характер и не заменяют анализ документов и обстоятельств конкретного человека.`,
  },
  {
    path: "/karta-sayta",
    kind: "policy",
    title: "Карта сайта",
    description: "Все инструкции и сервисы Миграционного справочника: ВНЖ, РВП, гражданство, работа, проверки и миграционные риски.",
    markdown: `Все опубликованные инструкции и практические сервисы Миграционного справочника.

## Инструкции

${articles.map((article) => `- [${article.title}](${article.href}) — ${article.description}`).join("\n")}

## Сервисы

- [ИИ-консультант](/tools/ai-consultant)
- [Навигатор статуса](/tools/path-finder)
- [Чек-листы документов](/tools/checklist-generator)
- [Калькуляторы](/tools/calculators)
- [Проверка РВП](/tools/check-rvp)
- [Проверка ВНЖ](/tools/check-vnzh)
- [Проверка гражданства](/tools/check-citizenship)
- [Проверка патента](/tools/check-patent)`,
  },
] as const;

function offset(node: AstRecord, side: "start" | "end") {
  const value = node.position?.[side]?.offset;
  return typeof value === "number" ? value : null;
}

function childSource(source: string, node: AstRecord) {
  const children = node.children ?? [];
  if (children.length === 0) return "";
  const start = offset(children[0], "start");
  const end = offset(children[children.length - 1], "end");
  return start === null || end === null ? "" : source.slice(start, end).trim();
}

function readNodeText(node: AstRecord): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(readNodeText).join("");
}

function parseLiteral(value: string): unknown {
  try {
    const ast = parseExpression(value, { sourceType: "module" }) as unknown as AstRecord & { properties?: unknown[]; elements?: unknown[]; type?: string; key?: AstRecord; computed?: boolean; value?: unknown; argument?: AstRecord };
    return readLiteralAst(ast);
  } catch {
    return undefined;
  }
}

function readLiteralAst(node: AstRecord & { properties?: unknown[]; elements?: unknown[]; key?: AstRecord; computed?: boolean; argument?: AstRecord }): unknown {
  if (node.type === "StringLiteral" || node.type === "NumericLiteral" || node.type === "BooleanLiteral") return node.value;
  if (node.type === "NullLiteral") return null;
  if (node.type === "Identifier" && (node.value === "true" || node.value === "false")) return node.value === "true";
  if (node.type === "UnaryExpression" && node.operator === "-" && node.argument) {
    const value = readLiteralAst(node.argument);
    return typeof value === "number" ? -value : undefined;
  }
  if (node.type === "ArrayExpression") return (node.elements ?? []).map((item) => item ? readLiteralAst(item as AstRecord & { properties?: unknown[]; elements?: unknown[] }) : null);
  if (node.type === "ObjectExpression") {
    const result: Record<string, unknown> = {};
    for (const property of node.properties ?? []) {
      const item = property as AstRecord & { key?: AstRecord; value?: AstRecord; type?: string; computed?: boolean };
      if (item.type !== "ObjectProperty" || item.computed || !item.key || !item.value) continue;
      const key = item.key.value ?? item.key.name;
      if (typeof key === "string") result[key] = readLiteralAst(item.value as AstRecord & { properties?: unknown[]; elements?: unknown[] });
    }
    return result;
  }
  return undefined;
}

function attributeValue(attribute: unknown): unknown {
  if (!attribute || typeof attribute !== "object") return undefined;
  const item = attribute as AstRecord & { name?: string; value?: unknown };
  if (typeof item.value === "string") return item.value;
  if (item.value && typeof item.value === "object") {
    const expressionValue = (item.value as AstRecord).value;
    return typeof expressionValue === "string" ? parseLiteral(expressionValue) : undefined;
  }
  return true;
}

function blockFields(source: string, node: AstRecord, blockType: string) {
  const fields: Record<string, unknown> = { blockType, blockName: blockType };
  for (const attribute of node.attributes ?? []) {
    if (!attribute || typeof attribute !== "object") continue;
    const name = (attribute as AstRecord).name;
    if (typeof name === "string") fields[name] = attributeValue(attribute);
  }
  if (["quickAnswer", "notice", "warning", "legalSource"].includes(blockType)) fields.content = childSource(source, node);
  return fields;
}

export function parseMdx(source: string) {
  const tree = processor.parse(source) as unknown as AstRecord;
  const ranges: Range[] = [];
  const blocks: MigratedBlock[] = [];
  for (const node of tree.children ?? []) {
    const start = offset(node, "start");
    const end = offset(node, "end");
    if (start === null || end === null) continue;
    if (node.type === "heading" && node.depth === 1) ranges.push({ start, end, replacement: "" });
    if (node.type === "mdxJsxFlowElement" && node.name && BLOCK_NAMES[node.name]) {
      const blockType = BLOCK_NAMES[node.name];
      const index = blocks.length;
      const token = `CMS_BLOCK_${index}`;
      blocks.push({ token, blockType, fields: blockFields(source, node, blockType) });
      ranges.push({ start, end, replacement: `\n\n${token}\n\n` });
    }
  }

  let markdown = source;
  for (const range of [...ranges].sort((left, right) => right.start - left.start)) markdown = `${markdown.slice(0, range.start)}${range.replacement}${markdown.slice(range.end)}`;
  return { tree, markdown, blocks };
}

function replaceBlockTokens(content: unknown, blocks: MigratedBlock[]): unknown {
  if (!content || typeof content !== "object") return content;
  const node = content as Record<string, unknown>;
  if (node.type === "paragraph" && Array.isArray(node.children) && node.children.length === 1) {
    const child = node.children[0] as Record<string, unknown>;
    const text = typeof child.text === "string" ? child.text : "";
    const block = blocks.find((candidate) => text.trim() === candidate.token);
    if (block) return { type: "block", version: 2, fields: { ...block.fields, id: `migration-${block.token.toLowerCase()}` } };
  }
  if (Array.isArray(node.children)) node.children = node.children.map((child) => replaceBlockTokens(child, blocks));
  return node;
}

function reviewedDate(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
  if (!match) return undefined;
  return `${match[3]}-${MONTHS[match[2].toLowerCase()] ?? "01"}-${match[1].padStart(2, "0")}`;
}

function getRouteFromMdx(relativeFile: string) {
  const route = relativeFile.replace(/\\/g, "/").replace(/\/page\.mdx$/, "");
  return route === "home" ? "/" : `/${route}`;
}

async function walkMdx(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkMdx(fullPath));
    else if (entry.isFile() && entry.name === "page.mdx") files.push(fullPath);
  }
  return files;
}

function stringMetadata(pathname: string, fallbackTitle: string, fallbackDescription: string) {
  const metadata = getLegacyMetadata(pathname);
  const title = typeof metadata?.title === "string" ? metadata.title : fallbackTitle;
  const description = typeof metadata?.description === "string" ? metadata.description : fallbackDescription;
  return { title, description };
}

async function upsertPage(payload: Awaited<ReturnType<typeof getPayload>>, data: Record<string, unknown>, force: boolean) {
  const existing = await payload.find({ collection: "pages", limit: 1, where: { path: { equals: data.path } }, overrideAccess: true });
  const current = existing.docs[0] as Record<string, unknown> | undefined;
  if (current && !force && typeof current.sourceKey === "string" && !current.sourceKey.startsWith("legacy:")) {
    console.log(`skip ${String(data.path)} (edited CMS document; use --force to replace)`);
    return;
  }
  if (current) {
    await payload.update({ collection: "pages", id: current.id as string, data, overrideAccess: true });
    return;
  }
  await payload.create({ collection: "pages", data, overrideAccess: true });
}

async function migrateMdxPages(payload: Awaited<ReturnType<typeof getPayload>>, force: boolean, dryRun: boolean) {
  const files = await walkMdx(MDX_ROOT);
  let blocksCount = 0;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relative = path.relative(MDX_ROOT, file);
    const route = getRouteFromMdx(relative);
    const parsed = parseMdx(source);
    const h1 = (parsed.tree.children ?? []).find((node) => node.type === "heading" && node.depth === 1);
    const titleFromSource = h1 ? readNodeText(h1) : route;
    const metadata = stringMetadata(route, titleFromSource, `Практическая инструкция по теме ${titleFromSource}.`);
    const metaBlock = parsed.blocks.find((block) => block.blockType === "articleMeta");
    const editorConfig = (payload.config.editor as { editorConfig?: Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"] }).editorConfig;
    if (!editorConfig) throw new Error("Payload Lexical editor config is unavailable.");
    const lexical = convertMarkdownToLexical({ editorConfig, markdown: parsed.markdown });
    const content = replaceBlockTokens(lexical, parsed.blocks);
    const data = {
      path: route,
      sourceKey: `legacy:${route}`,
      kind: route.startsWith("/legal/") ? "legal" : "article",
      title: titleFromSource,
      description: metadata.description,
      reviewedAt: reviewedDate(metaBlock?.fields.reviewed),
      readingTime: typeof metaBlock?.fields.readingTime === "string" ? metaBlock.fields.readingTime : undefined,
      content,
      legacyMarkdown: source,
      seo: { title: metadata.title, description: metadata.description, canonical: route },
      _status: "published",
    };
    blocksCount += parsed.blocks.length;
    if (!dryRun) await upsertPage(payload, data, force);
    console.log(`${dryRun ? "would migrate" : "migrated"} ${route} (${parsed.blocks.length} blocks)`);
  }
  return { pages: files.length, blocks: blocksCount };
}

async function migrateStaticPages(payload: Awaited<ReturnType<typeof getPayload>>, force: boolean, dryRun: boolean) {
  for (const page of STATIC_PAGES) {
    const editorConfig = (payload.config.editor as { editorConfig?: Parameters<typeof convertMarkdownToLexical>[0]["editorConfig"] }).editorConfig;
    if (!editorConfig) throw new Error("Payload Lexical editor config is unavailable.");
    const lexical = convertMarkdownToLexical({ editorConfig, markdown: page.markdown });
    const data = { ...page, sourceKey: `legacy:${page.path}`, content: lexical, legacyMarkdown: page.markdown, seo: { title: page.title, description: page.description, canonical: page.path }, _status: "published" };
    if (!dryRun) await upsertPage(payload, data, force);
    console.log(`${dryRun ? "would migrate" : "migrated"} ${page.path} (static page)`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const force = args.has("--force");
  if (!process.env.DATABASE_URL && !dryRun) throw new Error("DATABASE_URL is required. Use --dry-run to validate the content parser without a database.");

  let payload: Awaited<ReturnType<typeof getPayload>> | null = null;
  if (!dryRun) {
    // The migration runner must own schema changes; do not let development
    // push create the tables before the tracked migration runs.
    process.env.PAYLOAD_DB_PUSH = "false";
    const { default: configPromise } = await import("../src/payload.config.mjs");
    payload = await getPayload({ config: configPromise });
  }
  try {
    if (dryRun) {
      const files = await walkMdx(MDX_ROOT);
      const parsed = await Promise.all(files.map(async (file) => parseMdx(await readFile(file, "utf8"))));
      const blockCount = parsed.reduce((total, item) => total + item.blocks.length, 0);
      console.log(`MDX files discovered: ${parsed.length}; custom blocks: ${blockCount}; static pages: ${STATIC_PAGES.length}; tools: seed catalog`);
      return;
    }

    await payload!.db.migrate();
    const mdxSummary = await migrateMdxPages(payload!, force, false);
    await migrateStaticPages(payload!, force, false);
    await seedPayload(payload!, force);
    console.log(`Payload migration complete: ${mdxSummary.pages} MDX pages, ${mdxSummary.blocks} content blocks, ${STATIC_PAGES.length} static pages and seeded tools.`);
  } finally {
    await payload?.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
