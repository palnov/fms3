import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const SOURCES_PATH = path.join(process.cwd(), "knowledge/crawled-sources.json");

function getSources(): Record<string, { title: string; status: "queued" | "scanned"; parentUrl: string | null }> {
  if (!fs.existsSync(SOURCES_PATH)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(SOURCES_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveSources(sources: Record<string, any>) {
  const dir = path.dirname(SOURCES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2));
}

export async function GET() {
  try {
    const sources = getSources();
    const manifestPath = path.join(process.cwd(), "knowledge/downloads-manifest.json");
    let pendingCount = 0;
    let errorsCount = 0;
    let downloadedCount = 0;
    let indexedCount = 0;

    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        const manifestValues = Object.values(manifest) as any[];
        pendingCount = manifestValues.filter((m: any) => m.status === "downloaded" || m.status === "failed").length;
        errorsCount = manifestValues.filter((m: any) => m.status === "failed").length;
        downloadedCount = manifestValues.filter((m: any) => m.status === "downloaded").length;
        indexedCount = manifestValues.filter((m: any) => m.status === "indexed").length;
      } catch {}
    }

    const stats = {
      sourcesCount: Object.keys(sources).length,
      errorsCount,
      downloadedCount,
      indexedCount
    };

    return NextResponse.json(
      { sources, pendingCount, stats },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { url, title, status, parentUrl } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL не может быть пустым." }, { status: 400 });
    }

    const sources = getSources();
    
    // Add or update
    sources[url] = {
      title: title || url,
      status: status || "queued",
      parentUrl: parentUrl || null,
    };

    saveSources(sources);

    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL не указан." }, { status: 400 });
    }

    const sources = getSources();
    if (sources[url]) {
      delete sources[url];
      saveSources(sources);
    }

    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
