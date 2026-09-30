import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPageByPath } from "@/lib/cms/queries";
import { verifyCmsPagePreviewSignature } from "@/lib/cms/preview-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function denied(status: 401 | 404) {
  return new Response("CMS preview is unavailable.", {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  if (typeof path !== "string" || !verifyCmsPagePreviewSignature(path, expires, signature)) return denied(401);

  const page = await getPageByPath(path, true);
  if (!page || page.path !== path) return denied(404);

  (await draftMode()).enable();
  redirect(path);
}
