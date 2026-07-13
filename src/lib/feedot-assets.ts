import fs from "node:fs/promises";
import path from "node:path";
import { resolveFeedotAssetPath, type FeedotAssetFolder } from "@/lib/feedot-storage";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function serveFeedotAsset(
  folderName: FeedotAssetFolder,
  segments: readonly string[],
) {
  try {
    const filePath = resolveFeedotAssetPath(folderName, segments);
    const fileStat = await fs.stat(filePath);
    if (!fileStat.isFile()) {
      return notFound();
    }

    return new Response(await fs.readFile(filePath), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
