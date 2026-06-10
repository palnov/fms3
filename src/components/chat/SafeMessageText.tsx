import type { ReactNode } from "react";

interface SafeMessageTextProps {
  text: string;
  linkClassName?: string;
  paragraphClassName?: string;
}

const INLINE_MARKDOWN_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

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
}: SafeMessageTextProps) {
  return text.split("\n").map((line, index) => (
    <p key={index} className={paragraphClassName}>
      {renderInlineMarkdown(line, linkClassName)}
    </p>
  ));
}
