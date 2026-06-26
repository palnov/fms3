import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fms3.ru").replace(/\/+$/, "");

const ROUTES = [
  ["", "weekly", 1],
  ["/po-voprosam-migracii", "weekly", 0.9],
  ["/pathways", "weekly", 0.9],
  ["/pathways/vnzh", "weekly", 0.9],
  ["/pathways/vnzh/by-marriage", "monthly", 0.8],
  ["/pathways/vnzh/documents", "monthly", 0.8],
  ["/pathways/vnzh/without-rvp", "monthly", 0.8],
  ["/pathways/vnzh/kazakhstan", "monthly", 0.75],
  ["/pathways/vnzh/notification", "monthly", 0.8],
  ["/pathways/vnzh/status-check", "monthly", 0.75],
  ["/pathways/rvp", "weekly", 0.9],
  ["/pathways/rvp/marriage", "monthly", 0.8],
  ["/pathways/rvp/quota", "monthly", 0.8],
  ["/pathways/rvp/application-form", "monthly", 0.8],
  ["/pathways/rvp/medical-exam", "monthly", 0.75],
  ["/pathways/citizenship", "weekly", 0.9],
  ["/pathways/citizenship/simplified", "monthly", 0.8],
  ["/pathways/citizenship/new-law", "monthly", 0.8],
  ["/pathways/citizenship/belarus", "monthly", 0.75],
  ["/pathways/citizenship/oath", "monthly", 0.75],
  ["/pathways/repatriation", "monthly", 0.8],
  ["/pathways/work/patent", "monthly", 0.8],
  ["/pathways/work/patent/payment", "monthly", 0.8],
  ["/pathways/work/vks", "monthly", 0.75],
  ["/pathways/work/inn", "monthly", 0.75],
  ["/legal/check-ban", "monthly", 0.8],
  ["/legal/lift-ban", "monthly", 0.8],
  ["/legal/deportation", "monthly", 0.75],
  ["/legal/registration", "monthly", 0.8],
  ["/tools/ai-consultant", "weekly", 0.7],
  ["/tools/calculators", "monthly", 0.7],
  ["/tools/check-passport", "monthly", 0.7],
  ["/tools/check-rvp", "monthly", 0.7],
  ["/tools/check-vnzh", "monthly", 0.7],
  ["/tools/check-citizenship", "monthly", 0.7],
  ["/tools/check-patent", "monthly", 0.7],
  ["/tools/checklist-generator", "monthly", 0.7],
  ["/tools/document-check", "monthly", 0.7],
  ["/tools/path-finder", "monthly", 0.7],
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
