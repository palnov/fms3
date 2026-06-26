import { NextResponse, type NextRequest } from "next/server";

const routes = new Set([
  "/",
  "/legal/check-ban",
  "/legal/deportation",
  "/legal/lift-ban",
  "/legal/registration",
  "/mmc-saharovo",
  "/pathways",
  "/pathways/citizenship",
  "/pathways/citizenship/belarus",
  "/pathways/citizenship/new-law",
  "/pathways/citizenship/oath",
  "/pathways/citizenship/simplified",
  "/pathways/repatriation",
  "/pathways/rvp",
  "/pathways/rvp/application-form",
  "/pathways/rvp/marriage",
  "/pathways/rvp/medical-exam",
  "/pathways/rvp/quota",
  "/pathways/vnzh",
  "/pathways/vnzh/by-marriage",
  "/pathways/vnzh/documents",
  "/pathways/vnzh/kazakhstan",
  "/pathways/vnzh/notification",
  "/pathways/vnzh/status-check",
  "/pathways/vnzh/without-rvp",
  "/pathways/work/inn",
  "/pathways/work/patent",
  "/pathways/work/patent/payment",
  "/pathways/work/vks",
  "/po-voprosam-migracii",
  "/robots.txt",
  "/sitemap.xml",
  "/tools/ai-consultant",
  "/tools/calculators",
  "/tools/check-citizenship",
  "/tools/check-passport",
  "/tools/check-patent",
  "/tools/check-rvp",
  "/tools/check-vnzh",
  "/tools/checklist-generator",
  "/tools/document-check",
  "/tools/path-finder",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    routes.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: "/:path*",
};
