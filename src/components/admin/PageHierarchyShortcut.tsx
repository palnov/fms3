import Link from "next/link";

export function PageHierarchyShortcut() {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <Link href="/cms/collections/pages/hierarchy" style={{ border: "1px solid var(--theme-border-color)", borderRadius: "var(--style-radius-s)", display: "inline-flex", fontWeight: 600, padding: "0.55rem 0.8rem" }}>
        Открыть дерево страниц
      </Link>
    </div>
  );
}
