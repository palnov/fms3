# Payload CMS import map fix

## Context

The production Payload dashboard at `/cms` returns “Не удалось открыть раздел” after the first administrator is created. The server log identifies the failure as an attempt to resolve `@payloadcms/next/rsc#CollectionCards` through an undefined import map.

The current Payload route handlers are working, but the generated admin view is rendered without the import map required by Payload 3.88.0.

## Design

Use Payload’s supported build-time import-map flow:

1. Generate `src/app/(payload)/cms/importMap.js` with `payload generate:importmap`.
2. Import that generated map from the Payload layout and pass it to `RootLayout`.
3. Pass the same map to `RootPage` and `NotFoundPage`.
4. Add a package script and run it automatically before every production build so the map stays synchronized with Payload config components.
5. Make the local module declarations require `importMap`, preventing this integration error from being hidden by an optional type.

The generated map remains a build artifact owned by Payload. No database changes, collection changes, content migration, URL changes, or changes to the adjacent Payload project are part of this fix.

## Runtime and deployment behavior

The generated import map is bundled into the Next.js standalone server during `npm run build`. Coolify will deploy the resulting commit through the existing GitHub integration. After deployment, verify the new container is healthy, `/cms` renders, Payload REST endpoints still respond, and the adjacent Payload container remains healthy.

If a browser retains an old Next.js client bundle, a hard refresh may be needed after deployment; this is separate from the server-side import-map failure.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- production smoke checks for `/cms`, `/api/cms/users/me`, public pages, and both Coolify containers
