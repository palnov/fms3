import { parseExpression } from "@babel/parser";
import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";

type SourcePosition = { start?: { offset?: number }; end?: { offset?: number } };

type MdxNode = {
  type?: string;
  name?: string;
  depth?: number;
  value?: string;
  position?: SourcePosition;
  attributes?: unknown[];
  children?: MdxNode[];
};

type AstRecord = MdxNode & {
  operator?: string;
  properties?: unknown[];
  elements?: unknown[];
  key?: AstRecord;
  computed?: boolean;
  argument?: AstRecord;
  name?: string;
};

export type LegacyBlock = {
  token: string;
  blockType: string;
  fields: Record<string, unknown>;
};

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

const LEGACY_BLOCK_TOKEN = /^CMS_BLOCK_\d+$/i;

function offset(node: MdxNode, side: "start" | "end") {
  const value = node.position?.[side]?.offset;
  return typeof value === "number" ? value : null;
}

function childSource(source: string, node: MdxNode) {
  const children = node.children ?? [];
  if (children.length === 0) return "";
  const start = offset(children[0], "start");
  const end = offset(children[children.length - 1], "end");
  return start === null || end === null ? "" : source.slice(start, end).trim();
}

function readLiteralAst(node: AstRecord): unknown {
  if (node.type === "StringLiteral" || node.type === "NumericLiteral" || node.type === "BooleanLiteral" || node.type === "Literal") {
    return node.value;
  }
  if (node.type === "NullLiteral") return null;
  if (node.type === "Identifier" && ((node.name ?? node.value) === "true" || (node.name ?? node.value) === "false")) {
    return (node.name ?? node.value) === "true";
  }
  if (node.type === "UnaryExpression" && node.operator === "-" && node.argument) {
    const value = readLiteralAst(node.argument);
    return typeof value === "number" ? -value : undefined;
  }
  if (node.type === "ArrayExpression") {
    return (node.elements ?? []).map((item) => item ? readLiteralAst(item as AstRecord) : null);
  }
  if (node.type === "ObjectExpression") {
    const result: Record<string, unknown> = {};
    for (const property of node.properties ?? []) {
      const item = property as AstRecord & { value?: AstRecord };
      if (!item || !["ObjectProperty", "Property"].includes(item.type ?? "") || item.computed || !item.key || !item.value) continue;
      const key = item.key.value ?? item.key.name;
      if (typeof key === "string") result[key] = readLiteralAst(item.value);
    }
    return result;
  }
  return undefined;
}

function parseLiteral(value: string): unknown {
  try {
    return readLiteralAst(parseExpression(value, { sourceType: "module" }) as unknown as AstRecord);
  } catch {
    return undefined;
  }
}

function attributeValue(attribute: unknown): unknown {
  if (!attribute || typeof attribute !== "object") return undefined;
  const item = attribute as { value?: unknown };
  if (typeof item.value === "string") return item.value;
  if (item.value && typeof item.value === "object") {
    const expressionValue = (item.value as { value?: unknown }).value;
    return typeof expressionValue === "string" ? parseLiteral(expressionValue) : undefined;
  }
  return true;
}

function blockFields(source: string, node: MdxNode, blockType: string) {
  const fields: Record<string, unknown> = { blockType, blockName: blockType };
  for (const attribute of node.attributes ?? []) {
    if (!attribute || typeof attribute !== "object") continue;
    const name = (attribute as { name?: unknown }).name;
    if (typeof name === "string") fields[name] = attributeValue(attribute);
  }
  if (["quickAnswer", "notice", "warning", "legalSource"].includes(blockType)) fields.content = childSource(source, node);
  return fields;
}

export function parseLegacyBlocks(source: string): LegacyBlock[] {
  try {
    const tree = processor.parse(source) as unknown as MdxNode;
    const blocks: LegacyBlock[] = [];
    for (const node of tree.children ?? []) {
      if (node.type !== "mdxJsxFlowElement" || !node.name || !BLOCK_NAMES[node.name]) continue;
      const blockType = BLOCK_NAMES[node.name];
      const token = `CMS_BLOCK_${blocks.length}`;
      blocks.push({ token, blockType, fields: blockFields(source, node, blockType) });
    }
    return blocks;
  } catch {
    return [];
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function containsLegacyBlockTokens(content: unknown): boolean {
  if (Array.isArray(content)) return content.some(containsLegacyBlockTokens);
  if (!isObject(content)) return false;
  if (typeof content.text === "string" && LEGACY_BLOCK_TOKEN.test(content.text.trim())) return true;
  return containsLegacyBlockTokens(content.children) || containsLegacyBlockTokens(content.root);
}

export function replaceLegacyBlockTokens(content: unknown, blocks: readonly LegacyBlock[]): unknown {
  if (Array.isArray(content)) return content.map((node) => replaceLegacyBlockTokens(node, blocks));
  if (!isObject(content)) return content;

  if (content.type === "paragraph" && Array.isArray(content.children) && content.children.length === 1) {
    const child = content.children[0];
    const text = isObject(child) && typeof child.text === "string" ? child.text.trim() : "";
    const block = blocks.find((candidate) => candidate.token.toLowerCase() === text.toLowerCase());
    if (block) {
      return {
        type: "block",
        version: 2,
        fields: { ...block.fields, id: `migration-${block.token.toLowerCase()}` },
      };
    }
  }

  const node: Record<string, unknown> = { ...content };
  if (Array.isArray(content.children)) node.children = replaceLegacyBlockTokens(content.children, blocks);
  if (isObject(content.root)) node.root = replaceLegacyBlockTokens(content.root, blocks);
  return node;
}

export function restoreLegacyBlocks(content: unknown, legacyMarkdown: unknown): unknown {
  if (typeof legacyMarkdown !== "string" || !containsLegacyBlockTokens(content)) return content;
  const blocks = parseLegacyBlocks(legacyMarkdown);
  return blocks.length > 0 ? replaceLegacyBlockTokens(content, blocks) : content;
}
