# Payload REST Handler Initialization Fix

## Context

The Payload admin UI loads, but creating the first user fails with `An unknown error has occurred.` Production logs show that `/api/cms/users/first-register` and `/api/cms/users/me` return a function instead of a `Response`.

In Payload 3.88, the exports from `@payloadcms/next/routes` are handler factories. The application currently re-exports those factories directly from the Next route file, so Next invokes the factory with the incoming `Request` and receives another function rather than executing a route handler.

## Design

Import the existing `configPromise` in `src/app/(payload)/api/cms/[...slug]/route.ts` and initialize every Payload REST handler with it:

```ts
export const POST = REST_POST(configPromise)
```

Apply the same pattern to GET, OPTIONS, PATCH, PUT, and DELETE. Update the local module declaration so the exported types describe builders that accept a Payload config and return a Next route handler. This keeps Payload's official REST implementation, auth flow, cookies, database access, and URL structure unchanged.

## Isolation and verification

The change is limited to the Payload API route and its declaration. It does not modify collections, migrations, users, public tool routes, or the separate Payload deployment. Verification will include typecheck, tests, production build, deployment health, `/api/cms/users/me`, `/cms`, `/cms/login`, and a first-user creation retry by the user.
