import { revalidatePath, revalidateTag } from "next/cache";

function safeRevalidate(callback: () => void) {
  try {
    callback();
  } catch {
    // Payload's CLI can execute hooks outside a Next request. Cache invalidation
    // is best-effort there; the next request will still read the new document.
  }
}

export function revalidatePage({ doc }: { doc: { path?: string } }) {
  if (!doc.path) return doc;
  const path = doc.path;
  safeRevalidate(() => {
    revalidateTag(`cms-page:${path}`, "max");
    revalidateTag("cms-pages", "max");
    revalidatePath(path);
  });
  return doc;
}

export function revalidateTool({ doc }: { doc: { slug?: string } }) {
  if (!doc.slug) return doc;
  const slug = doc.slug;
  safeRevalidate(() => {
    revalidateTag(`cms-tool:${slug}`, "max");
    revalidateTag("cms-tools", "max");
    revalidatePath(slug);
  });
  return doc;
}

export function revalidateDataTable({ doc }: { doc: { key?: string } }) {
  if (!doc.key) return doc;
  safeRevalidate(() => revalidateTag(`cms-data-table:${doc.key}`, "max"));
  return doc;
}
