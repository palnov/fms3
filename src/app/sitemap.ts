import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/public-routes";
import { getPublishedContentPaths } from "@/lib/cms/queries";
import { getSiteOrigin } from "@/lib/runtime-config";

const LAST_MODIFIED: Partial<Record<(typeof PUBLIC_ROUTES)[number][0], string>> = {
  "": "2026-07-10",
  "/editorial-policy": "2026-07-10",
  "/karta-sayta": "2026-07-10",
  "/pathways/vnzh": "2026-07-10",
  "/pathways/vnzh/after-receiving": "2026-07-10",
  "/pathways/vnzh/replacement": "2026-07-10",
  "/pathways/rvp": "2026-07-10",
  "/pathways/rvp/after-receiving": "2026-07-10",
  "/pathways/rvp/notification": "2026-07-10",
  "/pathways/work/patent": "2026-07-10",
  "/pathways/work/patent/employment-notice": "2026-07-10",
  "/pathways/work/employer-notification": "2026-07-10",
  "/pathways/work/employment-contract": "2026-07-10",
  "/pathways/rvpo": "2026-07-10",
  "/legal/registration-expired": "2026-07-10",
  "/legal/controlled-persons-register": "2026-07-10",
  "/legal/controlled-persons-register/removal": "2026-07-10",
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteOrigin();
  const staticEntries = PUBLIC_ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: LAST_MODIFIED[path],
    changeFrequency,
    priority,
  }));
  const staticPaths = new Set<string>(PUBLIC_ROUTES.map(([path]) => path || "/"));
  const cmsPaths = await getPublishedContentPaths();
  const dynamicEntries = [...cmsPaths.pages, ...cmsPaths.tools]
    .filter(({ path }) => !staticPaths.has(path || "/"))
    .map(({ path, updatedAt }) => ({
      url: `${siteUrl}${path}`,
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: path.startsWith("/tools/") ? 0.7 : 0.6,
    }));

  return [...staticEntries, ...dynamicEntries];
}
