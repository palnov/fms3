import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  resolveFeedotAssetPath,
  resolveFeedotSiteRootPath,
  type FeedotAssetFolder,
} from "@/lib/feedot-storage";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp",
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
  head = false,
) {
  try {
    const filePath = resolveFeedotAssetPath(folderName, segments);
    return await serveFeedotFile(filePath, head);
  } catch {
    return notFound();
  }
}

export async function serveFeedotSiteRootAsset(
  segments: readonly string[],
  head = false,
) {
  try {
    return await serveFeedotFile(resolveFeedotSiteRootPath(segments), head);
  } catch {
    return notFound();
  }
}

async function serveFeedotFile(filePath: string, head: boolean) {
  const fileStat = await fs.stat(filePath);
  if (!fileStat.isFile()) {
    return notFound();
  }

  const headers = {
    "Cache-Control": "no-store",
    "Content-Length": String(fileStat.size),
    "Content-Type": CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Last-Modified": fileStat.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  };

  if (head) {
    return new Response(null, { status: 200, headers });
  }

  return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, {
    status: 200,
    headers,
  });
}
