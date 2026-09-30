import React from "react";
import Link from "next/link";
import {
  FaqAccordion,
  LegalSource,
  LinkCardGrid,
  Notice,
  QuickAnswer,
  RelatedGuide,
  Warning,
} from "@/components/mdx/ContentBlocks";
import ConsultationBanner from "@/components/mdx/ConsultationBanner";
import { containsLegacyBlockTokens, restoreLegacyBlocks } from "@/lib/cms/legacy-blocks";
import { renderBlockText } from "@/lib/cms/render-block-text";
import type { CmsPage } from "@/lib/cms/queries";

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  format?: number | string;
  url?: string;
  newTab?: boolean;
  listType?: string;
  children?: LexicalNode[];
  fields?: Record<string, unknown>;
  blockType?: string;
  [key: string]: unknown;
};

function isSafeHref(href: string) {
  return href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || /^https?:\/\//i.test(href);
}

function safeHref(value: unknown, fallback = "#") {
  return typeof value === "string" && isSafeHref(value) ? value : fallback;
}

function renderInline(node: LexicalNode, key: string): React.ReactNode {
  if (node.type === "linebreak") return <br key={key} />;
  if (node.type === "text") {
    let content: React.ReactNode = node.text ?? "";
    const format = typeof node.format === "number" ? node.format : 0;
    if (format & 16) content = <code>{content}</code>;
    if (format & 8) content = <u>{content}</u>;
    if (format & 4) content = <s>{content}</s>;
    if (format & 2) content = <em>{content}</em>;
    if (format & 1) content = <strong>{content}</strong>;
    return <span key={key}>{content}</span>;
  }
  if (node.type === "link" || node.type === "autolink") {
    const href = typeof node.url === "string" && isSafeHref(node.url) ? node.url : "#";
    const children = (node.children ?? []).map((child, index) => renderInline(child, `${key}-${index}`));
    if (href.startsWith("/") || href.startsWith("#")) {
      return <Link key={key} href={href}>{children}</Link>;
    }
    return <a key={key} href={href} target={node.newTab === false ? undefined : "_blank"} rel="noopener noreferrer">{children}</a>;
  }
  return (node.children ?? []).map((child, index) => renderInline(child, `${key}-${index}`));
}

function relatedPageHref(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const pagePath = (value as Record<string, unknown>).path;
  return typeof pagePath === "string" ? safeHref(pagePath) : null;
}

type LinkCardItem = {
  page?: unknown;
  externalHref?: string;
  href?: string;
  title: string;
  description: string;
  label?: string;
};

function renderBlock(node: LexicalNode, key: string, path: string, isPreview: boolean) {
  const fields = node.fields ?? node;
  const blockType = typeof fields.blockType === "string" ? fields.blockType : node.blockType;

  switch (blockType) {
    case "quickAnswer":
      return <QuickAnswer key={key}>{renderBlockText(fields.content)}</QuickAnswer>;
    case "notice":
      return <Notice key={key}>{renderBlockText(fields.content)}</Notice>;
    case "warning":
      return <Warning key={key}>{renderBlockText(fields.content)}</Warning>;
    case "legalSource":
      return <LegalSource key={key} title={typeof fields.title === "string" ? fields.title : undefined}>{renderBlockText(fields.content)}</LegalSource>;
    case "faqAccordion":
      return <FaqAccordion key={key} items={Array.isArray(fields.items) ? fields.items.filter(isFaqItem) : []} />;
    case "relatedGuide":
      return <RelatedGuide
        key={key}
        href={relatedPageHref(fields.page) ?? safeHref(fields.externalHref, safeHref(fields.href, "/pathways"))}
        title={typeof fields.title === "string" ? fields.title : "Связанная инструкция"}
        description={typeof fields.description === "string" ? fields.description : "Открыть связанную инструкцию."}
      />;
    case "linkCardGrid":
      return <LinkCardGrid key={key} items={Array.isArray(fields.items) ? fields.items.filter(isLinkCard).map((item) => ({
        title: item.title,
        description: item.description,
        label: item.label,
        href: relatedPageHref(item.page) ?? safeHref(item.externalHref, safeHref(item.href)),
      })) : []} />;
    case "consultationBanner":
      return <ConsultationBanner
        key={key}
        title={typeof fields.title === "string" ? fields.title : undefined}
        description={typeof fields.description === "string" ? fields.description : undefined}
        context={typeof fields.context === "string" ? fields.context : `CMS: ${path}`}
        secondaryHref={typeof fields.secondaryHref === "string" ? safeHref(fields.secondaryHref) : undefined}
        secondaryLabel={typeof fields.secondaryLabel === "string" ? fields.secondaryLabel : undefined}
        isPreview={isPreview}
      />;
    case "articleMeta":
      return null;
    default:
      return null;
  }
}

function isFaqItem(item: unknown): item is { question: string; answer: string } {
  return Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).question === "string" && typeof (item as Record<string, unknown>).answer === "string");
}

function isLinkCard(item: unknown): item is LinkCardItem {
  if (!item || typeof item !== "object") return false;
  const card = item as Record<string, unknown>;
  return typeof card.title === "string"
    && typeof card.description === "string"
    && (typeof card.href === "string" || typeof card.externalHref === "string" || relatedPageHref(card.page) !== null);
}

function renderNode(node: LexicalNode, key: string, path: string, isPreview: boolean): React.ReactNode {
  if (node.type === "block" || node.blockType) return renderBlock(node, key, path, isPreview);
  if (node.type === "text" || node.type === "link" || node.type === "autolink" || node.type === "linebreak") return renderInline(node, key);
  if (node.type === "paragraph" && containsLegacyBlockTokens(node)) return null;

  const children = (node.children ?? []).map((child, index) => renderNode(child, `${key}-${index}`, path, isPreview));
  switch (node.type) {
    case "heading": {
      const tag = /^h[1-6]$/.test(node.tag ?? "") ? node.tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" : "h2";
      const Heading = tag;
      return <Heading key={key}>{children}</Heading>;
    }
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "quote":
      return <blockquote key={key}>{children}</blockquote>;
    case "list":
      return node.listType === "number" ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>;
    case "listitem":
      return <li key={key}>{children}</li>;
    case "horizontalrule":
      return <hr key={key} />;
    case "table":
      return (
        <div className="mdx-table-scroll" key={key} role="region" aria-label="Прокручиваемая таблица" tabIndex={0}>
          <table><tbody>{children}</tbody></table>
        </div>
      );
    case "tablerow":
      return <tr key={key}>{children}</tr>;
    case "tablecell": {
      const headerState = typeof node.headerState === "number" ? node.headerState : 0;
      const Cell = headerState > 0 ? "th" : "td";
      const scope = headerState === 1 ? "row" : "col";
      const colSpan = typeof node.colSpan === "number" && node.colSpan > 1 ? node.colSpan : undefined;
      const rowSpan = typeof node.rowSpan === "number" && node.rowSpan > 1 ? node.rowSpan : undefined;
      return <Cell key={key} scope={headerState > 0 ? scope : undefined} colSpan={colSpan} rowSpan={rowSpan}>{children}</Cell>;
    }
    case "root":
      return <>{children}</>;
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

function getRootChildren(content: unknown): LexicalNode[] {
  if (!content || typeof content !== "object") return [];
  const root = content as { root?: { children?: unknown } };
  return Array.isArray(root.root?.children) ? root.root.children as LexicalNode[] : [];
}

export default function LexicalRenderer({ page, isPreview = false }: { page: CmsPage; isPreview?: boolean }) {
  const content = restoreLegacyBlocks(page.content, page.legacyMarkdown);
  const nodes = getRootChildren(content);
  if (nodes.length > 0) return <>{nodes.map((node, index) => renderNode(node, String(index), page.path, isPreview))}</>;
  return <>{renderBlockText(page.legacyMarkdown)}</>;
}
