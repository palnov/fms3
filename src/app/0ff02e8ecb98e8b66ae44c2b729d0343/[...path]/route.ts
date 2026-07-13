import { serveFeedotAsset } from "@/lib/feedot-assets";
import { FEEDOT_SHARED_FOLDER_NAME } from "@/lib/feedot-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  return serveFeedotAsset(FEEDOT_SHARED_FOLDER_NAME, segments);
}
