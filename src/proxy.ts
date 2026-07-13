import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { serveFeedotSiteRootAsset } from "@/lib/feedot-assets";

export async function proxy(request: NextRequest) {
  let segments: string[];

  try {
    segments = request.nextUrl.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return NextResponse.next();
  }

  const response = await serveFeedotSiteRootAsset(segments, request.method === "HEAD");
  return response.status === 404 ? NextResponse.next() : response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
