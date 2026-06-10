import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru").replace(/\/+$/, "");

const ROUTES = [
  ["", "weekly", 1],
  ["/pathways", "weekly", 0.9],
  ["/pathways/vnzh", "weekly", 0.9],
  ["/pathways/vnzh/by-marriage", "monthly", 0.8],
  ["/pathways/vnzh/documents", "monthly", 0.8],
  ["/pathways/vnzh/without-rvp", "monthly", 0.8],
  ["/pathways/rvp", "weekly", 0.9],
  ["/pathways/rvp/marriage", "monthly", 0.8],
  ["/pathways/rvp/quota", "monthly", 0.8],
  ["/pathways/citizenship", "weekly", 0.9],
  ["/pathways/citizenship/simplified", "monthly", 0.8],
  ["/pathways/repatriation", "monthly", 0.8],
  ["/pathways/work/patent", "monthly", 0.8],
  ["/legal/check-ban", "monthly", 0.8],
  ["/tools/ai-consultant", "weekly", 0.7],
  ["/tools/calculators", "monthly", 0.7],
  ["/tools/document-check", "monthly", 0.7],
] as const satisfies ReadonlyArray<
  readonly [string, MetadataRoute.Sitemap[number]["changeFrequency"], number]
>;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
