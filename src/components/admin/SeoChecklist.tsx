"use client";

import { useFormFields } from "@payloadcms/ui";
import type { UIFieldClientComponent } from "payload";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type FieldState = { value?: unknown };
type LinkAudit = {
  key: string;
  status: "loading" | "ready" | "error";
  missing: string[];
};

const READABLE_TEXT_KEYS = new Set(["text", "content", "title", "question", "answer", "description", "label"]);
const LINK_KEYS = new Set(["href", "url", "externalHref"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePath(value: string, origin: string, pagePath: string): string | null {
  const candidate = value.trim();
  if (!candidate || candidate.startsWith("#") || candidate.startsWith("//")) return null;

  try {
    if (candidate.startsWith("/") && !candidate.startsWith("//")) {
      const url = new URL(candidate, "https://internal-link.invalid");
      return url.pathname.replace(/\/+$/, "") || "/";
    }

    if (origin) {
      const base = new URL(pagePath || "/", origin);
      const url = new URL(candidate, base);
      if (url.origin === origin) return url.pathname.replace(/\/+$/, "") || "/";
    }
  } catch {
    return null;
  }

  return null;
}

function collectInternalPaths(value: unknown, origin: string, pagePath: string): string[] {
  const paths = new Set<string>();

  function visit(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isRecord(node)) return;

    for (const [key, child] of Object.entries(node)) {
      if (LINK_KEYS.has(key) && typeof child === "string") {
        const path = normalizePath(child, origin, pagePath);
        if (path) paths.add(path);
      } else {
        visit(child);
      }
    }
  }

  visit(value);
  return [...paths].sort();
}

function collectReadableText(value: unknown, chunks: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReadableText(item, chunks));
    return chunks;
  }
  if (!isRecord(value)) return chunks;

  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && READABLE_TEXT_KEYS.has(key)) chunks.push(child);
    else collectReadableText(child, chunks);
  }
  return chunks;
}

function wordCount(value: unknown): number {
  const text = collectReadableText(value).join(" ");
  return text.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

function displayCanonical(value: string, path: string, origin: string): string {
  const candidate = value || path || "/";
  if (!origin) return candidate;

  try {
    const url = new URL(candidate, origin);
    return `${url.host}${url.pathname}`;
  } catch {
    return candidate;
  }
}

function hasUpload(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") return String(value).length > 0;
  if (!isRecord(value)) return false;
  return value.id !== undefined && value.id !== null || typeof value.url === "string";
}

const panelStyle = {
  border: "1px solid var(--theme-elevation-200)",
  borderRadius: "4px",
  display: "grid",
  gap: "0.75rem",
  marginBottom: "1.25rem",
  padding: "1rem",
} as const;

const warningStyle = {
  background: "var(--theme-warning-50)",
  border: "1px solid var(--theme-warning-300)",
  borderRadius: "4px",
  padding: "0.7rem 0.85rem",
} as const;

export const SeoChecklist: UIFieldClientComponent = () => {
  const fields = useFormFields(([formFields]) => formFields as unknown as Record<string, FieldState | undefined>);
  const origin = useSyncExternalStore(() => () => undefined, () => window.location.origin, () => "");
  const [linkAudit, setLinkAudit] = useState<LinkAudit>({ key: "", status: "loading", missing: [] });

  const value = (path: string) => fields[path]?.value;
  const title = toText(value("title"));
  const pageDescription = toText(value("description"));
  const pagePath = toText(value("path")) || "/";
  const kind = toText(value("kind"));
  const reviewedAt = toText(value("reviewedAt"));
  const seoTitle = toText(value("seo.title"));
  const seoDescription = toText(value("seo.description"));
  const canonical = toText(value("seo.canonical"));
  const noIndex = value("seo.noIndex") === true;
  const ogImage = value("seo.ogImage");
  const content = value("content");
  const homeContent = value("homeContent");
  const status = value("_status");
  const words = useMemo(() => wordCount(content), [content]);
  const internalPaths = useMemo(
    () => collectInternalPaths(content, origin, pagePath),
    [content, origin, pagePath],
  );
  const linkKey = internalPaths.join("\n");

  useEffect(() => {
    const controller = new AbortController();

    if (internalPaths.length === 0) {
      return () => controller.abort();
    }

    fetch("/api/editorial/link-check", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: internalPaths }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Link check unavailable");
        const result: unknown = await response.json();
        const missing = isRecord(result) && Array.isArray(result.missing)
          ? result.missing.filter((path): path is string => typeof path === "string")
          : [];
        setLinkAudit({ key: linkKey, status: "ready", missing });
      })
      .catch((error: unknown) => {
        if (isRecord(error) && error.name === "AbortError") return;
        setLinkAudit({ key: linkKey, status: "error", missing: [] });
      });

    return () => controller.abort();
  }, [internalPaths, linkKey]);

  const audit = internalPaths.length === 0
    ? { key: linkKey, status: "ready" as const, missing: [] }
    : linkAudit.key === linkKey
      ? linkAudit
      : { key: linkKey, status: "loading" as const, missing: [] };
  const wordsPerMinute = 200;
  const suggestedMinutes = words > 0 ? Math.max(1, Math.ceil(words / wordsPerMinute)) : 0;
  const articleKind = kind === "article" || kind === "legal";
  const warnings: string[] = [];

  if (!title) warnings.push("Заполните заголовок страницы.");
  if (!pageDescription) warnings.push("Заполните описание страницы.");
  if (!seoDescription) warnings.push("Добавьте SEO-описание: оно будет показано в поисковой выдаче.");
  if (articleKind && !reviewedAt) warnings.push("Укажите дату проверки материала.");
  if (articleKind && words === 0) warnings.push("Добавьте основной текст статьи.");
  if ((kind === "landing" || kind === "policy") && pagePath !== "/" && words === 0) {
    warnings.push("Добавьте содержание лендинга или политики.");
  }
  if (pagePath === "/" && !isRecord(homeContent)) warnings.push("Заполните разделы и карточки главной страницы.");
  if (!hasUpload(ogImage)) warnings.push("Добавьте OG-изображение для предпросмотра страницы в соцсетях.");
  if (status === "published" && noIndex) warnings.push("Страница опубликована, но закрыта от индексации.");
  if (audit.status === "ready" && audit.missing.length > 0) {
    warnings.push(`Не найдены внутренние адреса: ${audit.missing.slice(0, 5).join(", ")}${audit.missing.length > 5 ? ` и ещё ${audit.missing.length - 5}` : ""}.`);
  }
  if (audit.status === "error") warnings.push("Автоматическая проверка внутренних адресов не выполнилась. Проверьте ссылки вручную.");

  const snippetTitle = seoTitle || title || "Заголовок страницы";
  const snippetDescription = seoDescription || pageDescription || "Добавьте краткое описание страницы.";
  const canonicalDisplay = displayCanonical(canonical, pagePath, origin);
  const titleLength = Array.from(seoTitle).length;
  const descriptionLength = Array.from(seoDescription).length;

  return (
    <section style={panelStyle} aria-label="Проверка SEO перед публикацией">
      <div>
        <strong>Проверка перед публикацией</strong>
        <p style={{ color: "var(--theme-elevation-700)", margin: "0.35rem 0 0" }}>
          Подсказки обновляются по мере редактирования. Они не блокируют публикацию и не меняют поля автоматически.
        </p>
      </div>

      <div style={{ border: "1px solid var(--theme-elevation-200)", borderRadius: "4px", maxWidth: "44rem", padding: "0.85rem 1rem" }}>
        <p style={{ color: "#188038", fontSize: "0.8rem", margin: "0 0 0.25rem" }}>{canonicalDisplay}</p>
        <strong style={{ color: "#1a0dab", display: "block", fontSize: "1.1rem", fontWeight: 500 }}>{snippetTitle}</strong>
        <p style={{ color: "var(--theme-elevation-800)", lineHeight: 1.45, margin: "0.25rem 0 0" }}>{snippetDescription}</p>
      </div>

      <div style={{ color: "var(--theme-elevation-700)", display: "flex", flexWrap: "wrap", gap: "0.35rem 1rem", fontSize: "0.85rem" }}>
        <span>SEO-заголовок: {titleLength}/60 знаков</span>
        <span>SEO-описание: {descriptionLength}/160 знаков</span>
        <span>Рекомендуется: заголовок до 60, описание 120–160 знаков.</span>
      </div>

      {suggestedMinutes > 0 ? (
        <p style={{ margin: 0 }}>
          Оценка по основному тексту: {words} слов — около {suggestedMinutes} мин. при {wordsPerMinute} словах/мин.; текущее время чтения не меняется.
        </p>
      ) : null}

      {audit.status === "loading" ? (
        <p role="status" style={{ color: "var(--theme-elevation-700)", margin: 0 }}>Проверяю внутренние ссылки…</p>
      ) : null}

      {warnings.length > 0 ? (
        <ul style={{ display: "grid", gap: "0.45rem", listStyle: "none", margin: 0, padding: 0 }}>
          {warnings.map((warning) => <li key={warning} style={warningStyle}>{warning}</li>)}
        </ul>
      ) : audit.status !== "loading" ? (
        <p role="status" style={{ margin: 0 }}>Критичных замечаний не найдено.</p>
      ) : null}
    </section>
  );
};
