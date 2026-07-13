import {
  FEEDOT_UPDATER_VERSION,
  processFeedotPost,
} from "@/lib/feedot-updater";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: FEEDOT_UPDATER_VERSION, feedot: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "invalidRequest", message: "Data is not valid" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = await processFeedotPost(payload);
  return Response.json(response.payload, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
