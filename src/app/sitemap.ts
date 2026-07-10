import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/public-routes";
import { getSiteOrigin } from "@/lib/runtime-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteOrigin();
  return PUBLIC_ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
