import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isSafeCmsPagePreviewPath } from "@/lib/cms/preview-token";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestedPath = new URL(request.url).searchParams.get("path");
  const path = isSafeCmsPagePreviewPath(requestedPath) ? requestedPath : "/";

  (await draftMode()).disable();
  redirect(path);
}
