"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export type PageHierarchyItem = {
  id: string;
  title: string;
  path: string;
  kind: string;
  status: "published" | "draft";
  parentId: string | null;
  treeOrder: number;
};

type PageTreeNode = PageHierarchyItem & { children: PageTreeNode[] };

function comparePages(left: PageTreeNode, right: PageTreeNode) {
  return left.treeOrder - right.treeOrder || left.title.localeCompare(right.title, "ru");
}

function createTree(pages: PageHierarchyItem[]) {
  const nodes = new Map(pages.map((page) => [page.id, { ...page, children: [] as PageTreeNode[] }]));
  const roots: PageTreeNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  }

  for (const node of nodes.values()) node.children.sort(comparePages);
  roots.sort(comparePages);
  return roots.length > 0 ? roots : [...nodes.values()].sort(comparePages);
}

function filterTree(nodes: PageTreeNode[], query: string): PageTreeNode[] {
  if (!query) return nodes;

  const normalizedQuery = query.toLocaleLowerCase("ru-RU");
  return nodes.flatMap((node) => {
    const matches = `${node.title} ${node.path}`.toLocaleLowerCase("ru-RU").includes(normalizedQuery);
    if (matches) return [node];
    const children = filterTree(node.children, query);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

function flattenTree(nodes: PageTreeNode[]) {
  const result: Array<{ node: PageTreeNode; depth: number }> = [];
  const seen = new Set<string>();

  function visit(node: PageTreeNode, depth: number) {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    result.push({ node, depth });
    node.children.forEach((child) => visit(child, depth + 1));
  }

  nodes.forEach((node) => visit(node, 0));
  return result;
}

function renderTreeNodes(nodes: PageTreeNode[], depth = 0): ReactNode {
  return nodes.map((node) => (
    <li key={node.id}>
      <div
        className="page-hierarchy-row"
        style={{ alignItems: "center", borderBottom: "1px solid var(--theme-border-color)", display: "flex", gap: "1rem", justifyContent: "space-between", padding: "0.8rem 0.5rem 0.8rem 0", paddingInlineStart: `${depth * 1.5}rem` }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <strong>{node.title}</strong>
            <span style={{ border: "1px solid var(--theme-border-color)", borderRadius: "999px", color: "var(--theme-elevation-700)", fontSize: "0.72rem", padding: "0.12rem 0.45rem" }}>
              {node.status === "published" ? "Опубликована" : "Черновик"}
            </span>
          </div>
          <code style={{ color: "var(--theme-elevation-600)", display: "block", fontSize: "0.78rem", marginTop: "0.25rem", overflowWrap: "anywhere" }}>{node.path}</code>
        </div>
        <Link href={`/cms/collections/pages/${encodeURIComponent(node.id)}`} style={{ flexShrink: 0, fontWeight: 600 }}>Редактировать</Link>
      </div>
      {node.children.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{renderTreeNodes(node.children, depth + 1)}</ul>
      ) : null}
    </li>
  ));
}

export default function PageHierarchyTree({ pages }: { pages: PageHierarchyItem[] }) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => filterTree(createTree(pages), query.trim()), [pages, query]);
  const rows = useMemo(() => flattenTree(tree), [tree]);

  return (
    <div>
      <label style={{ display: "block", marginBottom: "1rem", maxWidth: "32rem" }}>
        <span style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>Поиск по названию или URL</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Например, РВП или /pathways/rvp"
          style={{ background: "var(--theme-input-bg)", border: "1px solid var(--theme-border-color)", borderRadius: "var(--style-radius-s)", color: "var(--theme-text)", minHeight: "2.75rem", padding: "0.65rem 0.8rem", width: "100%" }}
        />
      </label>
      <p aria-live="polite" style={{ color: "var(--theme-elevation-600)", fontSize: "0.85rem", marginBottom: "0.65rem" }}>
        {query.trim() ? `Найдено в дереве: ${rows.length}` : `Страниц: ${pages.length}`}
      </p>
      {rows.length === 0 ? (
        <p style={{ border: "1px solid var(--theme-border-color)", padding: "1rem" }}>Страницы не найдены.</p>
      ) : (
        <ul aria-label="Дерево страниц" style={{ borderTop: "1px solid var(--theme-border-color)", listStyle: "none", margin: 0, padding: 0 }}>
          {renderTreeNodes(tree)}
        </ul>
      )}
    </div>
  );
}
