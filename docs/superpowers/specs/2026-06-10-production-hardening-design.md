# Production Hardening Design

## Scope

Prepare the existing application for production without changing its product behavior or deciding the hosting architecture.

Included:

- Remove the hard-coded consultant cookie signing secret.
- Render model output without `dangerouslySetInnerHTML`.
- Fix React 19, TypeScript, and ESLint errors in the application, parser, and maintenance scripts.
- Add the basic Next.js metadata files required for technical SEO.
- Update project documentation to match the implemented functionality.
- Verify the result with ESLint and a production build.

Excluded:

- Parser authentication or extraction into a separate service.
- Replacing local SQLite.
- Choosing between Vercel and VPS/Coolify.
- Large UI or domain architecture refactors.

## Security

`JWT_SECRET` is required by the consultant API. The route must return a server configuration error when it is absent instead of signing cookies with a public fallback value. Token signatures are compared with a timing-safe comparison.

AI responses are untrusted text. A shared client component parses only the supported Markdown subset: paragraphs, bold text, and links. It creates React elements directly and accepts only relative links and `http`/`https` URLs. Raw HTML is always displayed as text.

## Code Quality

React state derived from language or local storage is initialized or changed from event handlers instead of synchronous effects where practical. Message identifiers use `crypto.randomUUID()` in event and request callbacks.

API payloads and JSON documents receive explicit interfaces or `unknown`-based error handling. The parser keeps its current endpoints and filesystem behavior.

ESLint excludes `.agents`, which contains external agent skill implementation files rather than shipped application code.

## SEO

The root metadata receives a title template, metadata base, canonical URL, Open Graph data, and Twitter data. `robots.ts` and `sitemap.ts` expose crawl rules and the currently implemented public routes. Internal parser routes are excluded from indexing.

The public site origin is configured by `NEXT_PUBLIC_SITE_URL`, with `https://fms3.ru` as the production default.

The production build uses webpack because Turbopack compilation hangs in the current Next.js 16.2.4 project. Google Fonts are not downloaded during build; the UI uses a system font stack so isolated VPS/container builds remain deterministic.

## Verification

- `npm run lint` completes without errors.
- `npm run build` completes successfully.
- Consultant output preserves bold text and safe links without raw HTML injection.
- The consultant route cannot issue signed quota cookies without `JWT_SECRET`.
