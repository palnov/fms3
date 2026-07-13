import { serveFeedotSiteRootAsset } from "@/lib/feedot-assets";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  return serveFeedotSiteRootAsset(segments);
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  return serveFeedotSiteRootAsset(segments, true);
}
