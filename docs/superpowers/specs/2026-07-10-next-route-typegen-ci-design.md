# Next.js route type generation in CI

## Problem

The GitHub Actions `Quality` workflow runs `tsc --noEmit` in a clean checkout before Next.js has generated `.next/types`. Route handlers that use the global `RouteContext` helper therefore fail with `Cannot find name 'RouteContext'`, even though local checks can pass when generated files already exist.

## Design

Update the `typecheck` package script to run `next typegen` before TypeScript:

```text
next typegen && tsc --noEmit
```

This follows the Next.js 16.2.9 CI guidance and keeps route-aware type checking. The GitHub Actions workflow continues calling `npm run typecheck`, so local and CI checks use the same command.

## Scope

- Change only the `typecheck` script in `package.json`.
- Do not disable GitHub Actions or failure notifications.
- Do not change Coolify deployment behavior.
- Do not replace `RouteContext` with a weaker handwritten type.

## Verification

Run `npm run typecheck` after removing generated `.next` output, then run the full `npm run check` suite. A clean environment must generate route types and complete TypeScript validation successfully.
