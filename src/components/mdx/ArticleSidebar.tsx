"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Bot, CheckCircle2, ChevronRight, ListTree, Network } from "lucide-react";
import { articles, type ArticleEntry } from "@/lib/articles";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

type TocGroup = {
  heading: TocItem;
  children: TocItem[];
};

type OpenTocState = {
  pathname: string;
  ids: Set<string>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getPathSegments(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

function scoreRelated(current: ArticleEntry, candidate: ArticleEntry) {
  const currentSegments = new Set(getPathSegments(current.href));
  const sharedSegments = getPathSegments(candidate.href).filter((segment) => currentSegments.has(segment)).length;
  const currentTags = new Set(current.tags);
  const sharedTags = candidate.tags.filter((tag) => currentTags.has(tag)).length;
  const sameParent =
    current.href.split("/").slice(0, -1).join("/") === candidate.href.split("/").slice(0, -1).join("/");

  return sharedSegments * 4 + sharedTags * 3 + (sameParent ? 3 : 0);
}

function useArticleToc(pathname: string) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const article = document.querySelector<HTMLElement>("[data-article-content]");
      if (!article) {
        setItems([]);
        return;
      }

      const usedIds = new Set<string>();
      const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3")).filter(
        (heading) => !heading.closest("[data-toc-exclude]")
      );
      const nextItems = headings
        .map((heading) => {
          const text = heading.textContent?.trim();
          if (!text) {
            return null;
          }

          const baseId = heading.id || slugify(text) || "section";
          let id = baseId;
          let index = 2;

          while (usedIds.has(id) || (document.getElementById(id) !== null && document.getElementById(id) !== heading)) {
            id = `${baseId}-${index}`;
            index += 1;
          }

          heading.id = id;
          usedIds.add(id);

          return {
            id,
            text,
            level: heading.tagName === "H3" ? 3 : 2,
          } satisfies TocItem;
        })
        .filter((item): item is TocItem => item !== null);

      setItems(nextItems);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return items;
}

function groupTocItems(items: TocItem[]) {
  return items.reduce<TocGroup[]>((groups, item) => {
    if (item.level === 2 || groups.length === 0) {
      groups.push({ heading: item, children: [] });
      return groups;
    }

    groups[groups.length - 1].children.push(item);
    return groups;
  }, []);
}

function useRelatedArticles(pathname: string) {
  return useMemo(() => {
    const normalizedPathname = pathname.replace(/\/$/, "") || "/";
    const current = articles.find((article) => article.href === normalizedPathname);

    if (!current) {
      return articles.slice(0, 4);
    }

    return articles
      .filter((article) => article.href !== current.href)
      .map((article) => ({ article, score: scoreRelated(current, article) }))
      .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title, "ru"))
      .slice(0, 4)
      .map(({ article }) => article);
  }, [pathname]);
}

export default function ArticleSidebar() {
  const pathname = usePathname();
  const tocItems = useArticleToc(pathname);
  const tocGroups = useMemo(() => groupTocItems(tocItems), [tocItems]);
  const [openGroups, setOpenGroups] = useState<OpenTocState>({ pathname, ids: new Set() });
  const openGroupIds = openGroups.pathname === pathname ? openGroups.ids : new Set<string>();
  const relatedArticles = useRelatedArticles(pathname);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) => {
      const next = new Set(current.pathname === pathname ? current.ids : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { pathname, ids: next };
    });
  };

  return (
    <aside className="article-aside" aria-label="Дополнительные материалы">
      {tocGroups.length > 0 && (
        <nav data-motion-card className="article-aside-card article-toc" aria-label="Содержание статьи">
          <strong className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-[#02629f]" /> Содержание
          </strong>
          <ol>
            {tocGroups.map((group) => {
              const isOpen = openGroupIds.has(group.heading.id);
              return (
                <li key={group.heading.id} className="article-toc-group">
                  <div className="article-toc-row">
                    {group.children.length > 0 ? (
                      <button
                        type="button"
                        className="article-toc-toggle"
                        aria-label={isOpen ? "Скрыть подзаголовки" : "Показать подзаголовки"}
                        aria-expanded={isOpen}
                        onClick={() => toggleGroup(group.heading.id)}
                      >
                        <ChevronRight aria-hidden="true" className={isOpen ? "article-toc-toggle-open" : undefined} />
                      </button>
                    ) : (
                      <span className="article-toc-toggle-placeholder" />
                    )}
                    <a href={`#${group.heading.id}`}>{group.heading.text}</a>
                  </div>

                  {group.children.length > 0 && (
                    <ol className={`article-toc-children ${isOpen ? "article-toc-children-open" : ""}`}>
                      <li className="article-toc-children-inner">
                        <ol>
                          {group.children.map((child) => (
                            <li key={child.id}>
                              <a href={`#${child.id}`}>{child.text}</a>
                            </li>
                          ))}
                        </ol>
                      </li>
                    </ol>
                  )}
              </li>
              );
            })}
          </ol>
        </nav>
      )}

      {relatedArticles.length > 0 && (
        <div data-motion-card className="article-aside-card article-related">
          <strong className="flex items-center gap-2">
            <Network className="h-4 w-4 text-[#ff2e32]" /> Связанные страницы
          </strong>
          <div className="article-related-list">
            {relatedArticles.map((article) => (
              <Link key={article.href} href={article.href} className="article-related-link">
                <span>{article.title}</span>
                <small>{article.description}</small>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div data-motion-card className="article-aside-card article-status-card">
        <strong className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#ff2e32]" /> Материал актуализируется
        </strong>
        <p>Мы указываем правовые основания и даты, но перед подачей документов проверяйте региональные требования.</p>
      </div>
      <div data-motion-card className="article-aside-card">
        <strong className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#02629f]" /> Не нашли свой случай?
        </strong>
        <p>ИИ-помощник найдет ответ в базе знаний и предложит связанные инструкции.</p>
        <Link href="/tools/ai-consultant" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#02629f]">
          Задать вопрос <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
