import type { Metadata } from "next";
import LexicalRenderer from "@/components/cms/LexicalRenderer";
import ToolRuntime, { type CmsRuntimeTool } from "@/components/cms/ToolRuntime";
import type { CmsTool } from "@/lib/cms/queries";
import type { DataTableDefinition } from "@/lib/no-code-runtime/types";
import { getSiteOrigin } from "@/lib/runtime-config";

function absoluteUrl(value: string | undefined) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `${getSiteOrigin()}${value.startsWith("/") ? value : `/${value}`}`;
}

export function cmsToolMetadata(tool: CmsTool): Metadata {
  const title = tool.seo?.title || tool.title;
  const description = tool.seo?.description || tool.description;
  const canonical = absoluteUrl(tool.seo?.canonical || tool.slug);
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: tool.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", url: canonical, title, description },
  };
}

export default function CmsToolPage({ tool, tables }: { tool: CmsTool; tables: DataTableDefinition[] }) {
  const runtimeTool: CmsRuntimeTool = {
    slug: tool.slug,
    toolType: tool.toolType,
    title: tool.title,
    description: tool.description,
    eyebrow: tool.eyebrow,
    fields: tool.fields,
    formulas: tool.formulas,
    steps: tool.steps,
    results: tool.results,
    uiCopy: tool.uiCopy,
    integration: tool.integration,
    ai: tool.ai,
    executionMode: tool.executionMode,
    providerKey: tool.providerKey,
  };

  return (
    <div className="tool-page">
      <div className="site-container py-12 sm:py-20">
        {tool.eyebrow ? <p className="section-kicker">{tool.eyebrow}</p> : null}
        <h1 className="display-title mt-4 max-w-4xl">{tool.title}</h1>
        {tool.description ? <p className="mt-5 max-w-3xl text-lg leading-8 text-[#667287]">{tool.description}</p> : null}
        {tool.content ? <div className="article-main mdx-prose mt-10 max-w-4xl"><LexicalRenderer page={{ id: tool.id, path: tool.slug, title: tool.title, description: tool.description || "", content: tool.content, legacyMarkdown: tool.legacyMarkdown }} /></div> : null}
        <div className="mt-10 max-w-4xl"><ToolRuntime tool={runtimeTool} tables={tables} /></div>
      </div>
    </div>
  );
}
