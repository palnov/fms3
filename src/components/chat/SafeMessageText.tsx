import type { ReactNode } from "react";

interface SafeMessageTextProps {
  text: string;
  linkClassName?: string;
  paragraphClassName?: string;
  headingClassName?: string;
  listClassName?: string;
}

const INLINE_MARKDOWN_PATTERN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const BULLET_PATTERN = /^\s*[-*]\s+(.+)$/;
const NUMBERED_PATTERN = /^\s*(\d+[.)])\s+(.+)$/;

function getSafeHref(rawHref: string): string | null {
  const href = rawHref.trim();

  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) {
    return href;
  }

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function renderInlineMarkdown(text: string, linkClassName: string): ReactNode[] {
  return text.split(INLINE_MARKDOWN_PATTERN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    const linkMatch = part.match(LINK_PATTERN);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const href = getSafeHref(rawHref);

      if (!href) {
        return <span key={index}>{label}</span>;
      }

      return (
        <a
          key={index}
          href={href}
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      );
    }

    return part;
  });
}

export default function SafeMessageText({
  text,
  linkClassName = "font-semibold text-blue-500 underline hover:text-blue-600",
  paragraphClassName = "mb-1 min-h-[1.1rem]",
  headingClassName = "mb-2 mt-3 text-base font-extrabold leading-snug first:mt-0",
  listClassName = "mb-1 flex gap-2 leading-relaxed before:mt-[0.55em] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-current/45",
}: SafeMessageTextProps) {
  return text.split("\n").map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={index} className="h-2" aria-hidden="true" />;
    }

    const headingMatch = trimmedLine.match(HEADING_PATTERN);
    if (headingMatch) {
      return (
        <p key={index} className={headingClassName}>
          {renderInlineMarkdown(headingMatch[2], linkClassName)}
        </p>
      );
    }

    const bulletMatch = trimmedLine.match(BULLET_PATTERN);
    if (bulletMatch) {
      return (
        <p key={index} className={listClassName}>
          <span>{renderInlineMarkdown(bulletMatch[1], linkClassName)}</span>
        </p>
      );
    }

    const numberedMatch = trimmedLine.match(NUMBERED_PATTERN);
    if (numberedMatch) {
      return (
        <p key={index} className={paragraphClassName}>
          <strong>{numberedMatch[1]}</strong> {renderInlineMarkdown(numberedMatch[2], linkClassName)}
        </p>
      );
    }

    return (
      <p key={index} className={paragraphClassName}>
        {renderInlineMarkdown(trimmedLine, linkClassName)}
      </p>
    );
  });
}
