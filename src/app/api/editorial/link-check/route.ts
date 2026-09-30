import { getPayload } from "payload";
import configPromise from "@payload-config";
import { hasRole } from "@/payload/access";
import { LEGACY_PAGE_PATHS } from "@/lib/cms/legacy-page-paths";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function normalizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.length > 2048) return null;

  try {
    const pathname = new URL(candidate, "https://internal-link.invalid").pathname;
    return pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
      const requestURL = new URL(request.url);
      const requestHost = forwardedHost || request.headers.get("host") || requestURL.host;
      const originURL = new URL(origin);
      if (originURL.host.toLowerCase() !== requestHost.toLowerCase()) return json({ error: "Forbidden" }, 403);
    } catch {
      return json({ error: "Forbidden" }, 403);
    }
  }

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: request.headers });
  if (!hasRole(user, ["admin", "editor", "publisher"])) return json({ error: "Unauthorized" }, 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const rawPaths = body && typeof body === "object" && !Array.isArray(body)
    ? (body as { paths?: unknown }).paths
    : undefined;
  if (!Array.isArray(rawPaths)) return json({ error: "Invalid request" }, 400);
  if (rawPaths.length > 300) return json({ error: "Too many paths" }, 413);

  const paths = [...new Set(rawPaths.map(normalizePath).filter((path): path is string => path !== null))];
  if (paths.length === 0) return json({ checked: 0, missing: [] });

  const [pages, tools] = await Promise.all([
    payload.find({
      collection: "pages",
      depth: 0,
      draft: true,
      limit: 1000,
      overrideAccess: true,
      select: { path: true },
    }),
    payload.find({
      collection: "tools",
      depth: 0,
      draft: true,
      limit: 1000,
      overrideAccess: true,
      select: { slug: true },
    }),
  ]);

  const knownPaths = new Set<string>([
    ...pages.docs.map((page) => normalizePath(page.path)).filter((path): path is string => path !== null),
    ...tools.docs.map((tool) => normalizePath(tool.slug)).filter((path): path is string => path !== null),
    ...LEGACY_PAGE_PATHS,
  ]);

  return json({ checked: paths.length, missing: paths.filter((path) => !knownPaths.has(path)) });
}
