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

function renderText(value: unknown) {
  if (typeof value !== "string") return null;
  return value.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index}>{paragraph.split("\n").map((line, lineIndex) => (
      <span key={lineIndex}>{line}{lineIndex < paragraph.split("\n").length - 1 ? <br /> : null}</span>
    ))}</p>
  ));
}

function renderBlock(node: LexicalNode, key: string, path: string) {
  const fields = node.fields ?? node;
  const blockType = typeof fields.blockType === "string" ? fields.blockType : node.blockType;

  switch (blockType) {
    case "quickAnswer":
      return <QuickAnswer key={key}>{renderText(fields.content)}</QuickAnswer>;
    case "notice":
      return <Notice key={key}>{renderText(fields.content)}</Notice>;
    case "warning":
      return <Warning key={key}>{renderText(fields.content)}</Warning>;
    case "legalSource":
      return <LegalSource key={key} title={typeof fields.title === "string" ? fields.title : undefined}>{renderText(fields.content)}</LegalSource>;
    case "faqAccordion":
      return <FaqAccordion key={key} items={Array.isArray(fields.items) ? fields.items.filter(isFaqItem) : []} />;
    case "relatedGuide":
      return <RelatedGuide
        key={key}
        href={safeHref(fields.href, "/pathways")}
        title={typeof fields.title === "string" ? fields.title : "Связанная инструкция"}
        description={typeof fields.description === "string" ? fields.description : "Открыть связанную инструкцию."}
      />;
    case "linkCardGrid":
      return <LinkCardGrid key={key} items={Array.isArray(fields.items) ? fields.items.filter(isLinkCard).map((item) => ({ ...item, href: safeHref(item.href) })) : []} />;
    case "consultationBanner":
      return <ConsultationBanner
        key={key}
        title={typeof fields.title === "string" ? fields.title : undefined}
        description={typeof fields.description === "string" ? fields.description : undefined}
        context={typeof fields.context === "string" ? fields.context : `CMS: ${path}`}
        secondaryHref={typeof fields.secondaryHref === "string" ? safeHref(fields.secondaryHref) : undefined}
        secondaryLabel={typeof fields.secondaryLabel === "string" ? fields.secondaryLabel : undefined}
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

function isLinkCard(item: unknown): item is { href: string; title: string; description: string; label?: string } {
  return Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).href === "string" && typeof (item as Record<string, unknown>).title === "string" && typeof (item as Record<string, unknown>).description === "string");
}

function renderNode(node: LexicalNode, key: string, path: string): React.ReactNode {
  if (node.type === "block" || node.blockType) return renderBlock(node, key, path);
  if (node.type === "text" || node.type === "link" || node.type === "autolink" || node.type === "linebreak") return renderInline(node, key);

  const children = (node.children ?? []).map((child, index) => renderNode(child, `${key}-${index}`, path));
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
      return <table key={key}><tbody>{children}</tbody></table>;
    case "tablerow":
      return <tr key={key}>{children}</tr>;
    case "tablecell":
      return <td key={key}>{children}</td>;
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

export default function LexicalRenderer({ page }: { page: CmsPage }) {
  const nodes = getRootChildren(page.content);
  if (nodes.length > 0) return <>{nodes.map((node, index) => renderNode(node, String(index), page.path))}</>;
  return <>{renderText(page.legacyMarkdown)}</>;
}
