# Payload CMS Server Action Compatibility Fix

## Context

The production `/cms` route currently renders the generic Next.js error page. The production container logs show that Next.js rejects Payload's `handleServerFunctions` when Payload passes it to the client-side `RootProvider`:

> Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".

The public site and the separate Payload project must remain available while this CMS-only failure is corrected.

## Recommended design

Add a small local server-action adapter module that is explicitly marked with the top-level `"use server"` directive. The adapter will delegate to Payload's existing `handleServerFunctions` implementation and will be passed to Payload's `RootLayout` from `src/app/(payload)/layout.tsx`.

This keeps Payload's server-function routing and import map behavior unchanged while giving Next.js the server-function marker it requires. No collections, migrations, routes, or CMS data change.

Separately, update the runtime stage of `Dockerfile` to create `/app/.next/cache` and assign the `.next` runtime files to the `node` user after the build artifacts are copied. This removes the production `EACCES` cache warnings and allows Next.js to persist its prerender cache.

## Data flow

1. Payload `RootLayout` receives the local marked server action.
2. The Payload client provider invokes that action for its existing server-function requests.
3. The adapter forwards the request unchanged to Payload's `handleServerFunctions` implementation.
4. Payload resolves the requested function using its existing config, permissions, cookies, request, and import map context.

## Error handling and isolation

The adapter will not catch or transform Payload errors; existing Payload and Next.js error handling remains authoritative. The Docker permission change is limited to the fms3 image. The neighboring Payload container and its database are not modified.

The server is nearly full, so Docker build-cache cleanup will be performed only after the new deployment is healthy. Cleanup scope is limited to Docker's build cache (`docker builder prune`), not images, volumes, containers, or application data.

## Verification

Before deployment:

- run the repository typecheck and production build;
- verify the working tree changes are limited to the adapter, Payload layout, Dockerfile, and this design document (plus existing user changes);
- verify no migration or data files are changed.

After deployment:

- confirm the new container is healthy;
- open `/cms` and `/cms/login` and verify the Payload UI renders instead of the generic error page;
- smoke-test `/`, `/tools/path-finder`, `/tools/calculators`, `/tools/checklist-generator`, `/tools/check-passport`, `/tools/ai-consultant`, `/api/health`, `/robots.txt`, and `/sitemap.xml`;
- run the calculator API smoke test;
- inspect the new container logs for absence of the server-action serialization error and `.next/cache` permission errors;
- clean only Docker build cache after these checks succeed.
