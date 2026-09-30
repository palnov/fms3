import Link from "next/link";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import PageHierarchyTree, { type PageHierarchyItem } from "./PageHierarchyTree";

function relationId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id === "string" || typeof record.id === "number") return String(record.id);
  if (typeof record.value === "string" || typeof record.value === "number") return String(record.value);
  return null;
}

export function PageHierarchyView({ payload }: AdminViewServerProps) {
  return loadPageHierarchy(payload);
}

async function loadPageHierarchy(payload: AdminViewServerProps["payload"]) {
  const result = await payload.find({
    collection: "pages",
    depth: 0,
    draft: true,
    limit: 1000,
    overrideAccess: true,
    select: { title: true, path: true, kind: true, _status: true, parent: true, treeOrder: true },
  });

  const pages = (result.docs as unknown as Array<Record<string, unknown>>).map((page): PageHierarchyItem => ({
    id: String(page.id),
    title: typeof page.title === "string" && page.title.trim() ? page.title : "Без названия",
    path: typeof page.path === "string" ? page.path : "",
    kind: typeof page.kind === "string" ? page.kind : "article",
    status: page._status === "published" ? "published" : "draft",
    parentId: relationId(page.parent),
    treeOrder: typeof page.treeOrder === "number" ? page.treeOrder : 0,
  }));

  return (
    <Gutter>
      <div style={{ paddingBlock: "1.5rem" }}>
        <p style={{ color: "var(--theme-elevation-600)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Материалы</p>
        <h1 style={{ marginBlock: "0.35rem 0.6rem" }}>Иерархия страниц</h1>
        <p style={{ color: "var(--theme-elevation-700)", marginBlock: "0 1.5rem", maxWidth: "52rem" }}>
          Дерево отражает редакционные связи. Публичные адреса страниц при назначении родителя не меняются.
        </p>
        {result.hasNextPage ? (
          <p role="status" style={{ border: "1px solid var(--theme-warning-500)", marginBottom: "1rem", padding: "0.75rem" }}>
            Показаны первые 1000 страниц. Используйте обычный список для полного поиска.
          </p>
        ) : null}
        <PageHierarchyTree pages={pages} />
        <p style={{ marginTop: "1rem" }}><Link href="/cms/collections/pages">Вернуться к списку страниц</Link></p>
      </div>
    </Gutter>
  );
}
