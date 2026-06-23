# Security Best Practices Report

Date: 2026-06-23
Scope: Next.js 16 / React 19 app in `/Users/Macbookpro/Documents/Developing/fms3`.

## Executive Summary

The project keeps third-party API keys on the server side and `.gitignore` excludes `.env*`, so I did not find evidence that OpenRouter/Pravoved secrets are intentionally bundled into browser code. The pre-deploy blockers are different: the paid AI endpoint is easy to abuse because its quota is only cookie-based, the lead endpoint has no rate limiting, local `.env.local` contains real-looking secrets that should be rotated, and the installed Next.js version is currently affected by published security advisories.

The highest-priority fixes before deployment are: rotate the exposed local API keys, upgrade Next.js to the patched release, replace cookie-only quota with server-side rate limiting, add rate limiting to `/api/leads`, add global security headers, and reduce request amplification in the AI route.

## Remediation Status

Implemented on 2026-06-23:

- Added server-side SQLite-backed rate limiting for `/api/consultant` and `/api/leads`; consultant checks IP and anonymous client ID independently.
- Reduced the AI daily limit from 20 to 10.
- Added request body size/type validation and field length caps.
- Removed OpenRouter model fallback, removed retries on upstream `429`, added request timeouts, and sanitized upstream logging.
- Added basic production security headers in `next.config.ts`.
- Updated Next.js packages from `16.2.4` to `16.2.9`.
- Added `RATE_LIMIT_SECRET` to `.env.example` and ignored the local rate-limit database.
- Cleared local `.env.local` secret values in this working tree.

Still required outside the codebase:

- Rotate the OpenRouter/Gemini keys in their provider dashboards. Clearing `.env.local` does not invalidate already exposed keys.
- Configure real production secrets in the deployment platform.
- For multi-instance production, replace the local SQLite limiter with Redis/KV or enforce equivalent rate limits at the edge.
- `npm audit` still reports a moderate PostCSS advisory through `next@16.2.9`; the suggested automatic fix is an invalid downgrade to `next@9.3.3`, so this should be tracked until the Next.js package ships an upstream fix.

## Critical Findings

### SEC-001: Local `.env.local` contains real-looking secrets

- Rule ID: `NEXT-SECRETS-001`
- Severity: Critical
- Location: `.env.local` in the project root
- Evidence: `.env.local` exists, is ignored by `.gitignore`, and contains non-empty `GEMINI_API_KEY` and `OPENROUTER_API_KEY` values. Values are intentionally not quoted in this report.
- Impact: If this working tree, logs, terminal output, screenshots, backups, or support bundles are exposed, paid AI credentials can be abused directly outside the app. `.gitignore` prevents normal git commits but does not protect local files from operational leaks.
- Fix: Rotate the Gemini/OpenRouter keys immediately. Move production secrets to the deployment platform secret store. Keep local `.env.local` minimal and never paste it into chats, tickets, docs, or logs.
- Mitigation: Check `git log -S` / secret scanning for historical leakage before production. Add provider-side spend limits, allowed domains/referers where supported, and per-key budget alerts.
- False positive notes: `git ls-files` shows only `.env.example`, so `.env.local` is not currently tracked by git in this working tree.

## High Findings

### SEC-002: `/api/consultant` quota is only enforced by a client-held cookie

- Rule ID: `NEXT-RATE-001`
- Severity: High
- Location: `src/app/api/consultant/route.ts:206-237`, `src/app/api/consultant/route.ts:355-363`
- Evidence:

```ts
const cookiesHeader = request.headers.get("cookie") || "";
const limitCookieName = "ai_limit_token";
...
if (limitData.count >= 20) {
...
limitData.count += 1;
const nextLimitToken = signToken(limitData.count, limitData.resetTime, secretKey);
...
remainingRequests: 20 - limitData.count
response.headers.set("Set-Cookie", createLimitCookie(limitCookieName, nextLimitToken));
```

- Impact: Anyone can reset the quota by clearing cookies, using incognito mode, changing browser/profile, or scripting requests without the cookie. This directly exposes paid OpenRouter calls to abuse.
- Fix: Enforce quota server-side using a durable or shared store keyed by a combination of IP, normalized user/session fingerprint, and optionally a server-issued anonymous ID. Keep the cookie only as a UX hint, not the security boundary. Reduce the limit from 20 to 10 if that is the intended business rule.
- Mitigation: Add edge/CDN rate limiting in front of `/api/consultant`; add OpenRouter budget caps; block obvious datacenter abuse with WAF rules if available.
- False positive notes: The HMAC signature prevents users from increasing the cookie count, but it does not prevent deleting the cookie.

### SEC-003: `/api/leads` has no rate limiting or anti-spam control

- Rule ID: `NEXT-RATE-002`
- Severity: High
- Location: `src/app/api/leads/route.ts:3-70`
- Evidence:

```ts
export async function POST(request: Request) {
  const body = await request.json();
  ...
  const apiResponse = await fetch("https://leads-reception.feedot.com/api/v1/partner-leads", {
```

- Impact: Attackers can submit unlimited fake leads, create partner API costs/noise, degrade CRM quality, and potentially trigger downstream anti-fraud or account limits.
- Fix: Add server-side rate limiting per IP and per phone number, plus a lightweight bot barrier such as Turnstile/hCaptcha or a hidden honeypot field. Validate and cap input lengths before forwarding.
- Mitigation: Add provider-side throttles if Pravoved/Feedot supports them and alert on lead volume spikes.
- False positive notes: CORS blocks some browser-based cross-origin reads, but direct server-to-server requests and same-origin bot traffic remain reachable.

### SEC-004: Next.js version has active security advisories

- Rule ID: `NEXT-SUPPLY-001`
- Severity: High
- Location: `package.json:14`, `package.json:19`, `package.json:30`
- Evidence:

```json
"@next/mdx": "^16.2.4",
"next": "16.2.4",
"eslint-config-next": "16.2.4"
```

`npm audit --omit=dev --json` reports high-severity advisories for `next` with a fix available at `16.2.9`.

- Impact: Public deployment may be vulnerable to framework-level DoS, middleware/proxy bypass, cache poisoning, SSRF, or XSS issues covered by the advisories.
- Fix: Upgrade `next`, `@next/mdx`, and `eslint-config-next` to `16.2.9`, then run `npm install`, `npm audit`, `npm run lint`, and `npm run build`.
- Mitigation: Put a reverse proxy/CDN with request limits in front of the app until the upgrade is deployed.
- False positive notes: Some advisories may require features not used here, but the safe action is still to patch before deployment.

### SEC-005: AI endpoint amplifies cost and CPU per request

- Rule ID: `NEXT-DOS-001`
- Severity: High
- Location: `src/app/api/consultant/route.ts:44-91`, `src/lib/query-embedding.ts:11-67`, `src/app/api/consultant/route.ts:276-295`
- Evidence:

```ts
const models = [
  process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "openai/gpt-4o-mini"
];
```

```ts
const maxRetries = 5;
...
errorMessage.includes("429")
...
await new Promise((resolve) => setTimeout(resolve, backoffMs));
```

```ts
const allChunks = db.prepare("SELECT id, content, source_file, embedding, source_url, local_download_url FROM chunks").all() as ChunkRow[];
const allTemplates = db.prepare("SELECT id, title, file_path, sample_path, keywords FROM templates").all() as TemplateRow[];
```

- Impact: A single user request can cause one embedding call, up to six embedding attempts on transient errors, up to three chat model attempts, and a full in-process scan of a 522 MB local knowledge database. This makes DoS and budget abuse much cheaper for an attacker than for you.
- Fix: Do not retry on upstream `429` during public requests; return a controlled 503/429. Limit model fallback to one inexpensive model unless explicitly enabled. Move vector search to a pre-indexed vector store or SQLite vector extension/query that does not load all chunks into memory per request.
- Mitigation: Add request timeout/abort controllers for OpenRouter calls, concurrency limits, and per-IP rate limits.
- False positive notes: The database is readonly, so this is not SQL injection; it is resource exhaustion and cost amplification.

## Medium Findings

### SEC-006: No global security headers are configured in app code

- Rule ID: `NEXT-HEADERS-001`
- Severity: Medium
- Location: `next.config.ts:4-7`
- Evidence:

```ts
const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  serverExternalPackages: ["pdf-parse"],
};
```

No `headers()` configuration was found for CSP, `X-Content-Type-Options`, clickjacking defense, Referrer Policy, or Permissions Policy.

- Impact: XSS/clickjacking/content-sniffing bugs have a larger blast radius if one is introduced later. The app includes an AI-generated markdown-like response renderer, so defense-in-depth matters.
- Fix: Add global headers in `next.config.ts`: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`, `Referrer-Policy`, and a restrictive `Permissions-Policy`.
- Mitigation: If the hosting/CDN layer already sets headers, verify with `curl -I https://...` and document it.
- False positive notes: Headers may be configured outside this repo; I could not verify deployment edge config from local code.

### SEC-007: Request body and field size limits are incomplete

- Rule ID: `NEXT-INPUT-001`
- Severity: Medium
- Location: `src/app/api/consultant/route.ts:185-192`, `src/app/api/leads/route.ts:5-23`, `src/components/forms/LeadForm.tsx:28-33`
- Evidence:

```ts
const { question, language = "ru" } = await request.json();
...
if (question.length > 500) {
```

```ts
const body = await request.json();
const { name, phone, question } = body;
...
formData.append("edata[question]", question);
```

- Impact: Large JSON bodies or extremely long lead fields can waste memory/CPU and forward excessive data to the partner API. Non-string values can also cause exceptions and noisy logs.
- Fix: Check `Content-Length` before parsing where possible, validate runtime types, cap `name`, `phone`, `question`, and `language`, and reject unknown content types.
- Mitigation: Add body-size enforcement at reverse proxy/CDN.
- False positive notes: Next.js/platform defaults may provide some body protection, but no explicit app-level limit is visible.

### SEC-008: Upstream error bodies are logged

- Rule ID: `NEXT-LOG-001`
- Severity: Medium
- Location: `src/app/api/consultant/route.ts:79-82`, `src/lib/query-embedding.ts:29-36`, `src/app/api/leads/route.ts:56-64`
- Evidence:

```ts
const errText = await response.text();
console.warn(`OpenRouter model ${model} failed: ${response.status} - ${errText}`);
```

```ts
throw new Error(`OpenRouter API error: ${JSON.stringify(data.error)}`);
```

```ts
console.error("Pravoved API Error:", result);
```

- Impact: Third-party responses may include request metadata, user input, partner identifiers, or other sensitive operational details. Logs often end up in external observability tools with broader access than production secrets.
- Fix: Log only status codes, provider request IDs, and sanitized error categories. Do not log raw upstream response bodies or full partner API results.
- Mitigation: Configure log redaction for keys, bearer tokens, phone numbers, and API response payloads.
- False positive notes: I did not see the local code logging the OpenRouter bearer token directly.

## Low Findings

### SEC-009: Public client-side request counter is only a UX hint

- Rule ID: `REACT-CONFIG-001`
- Severity: Low
- Location: `src/app/tools/ai-consultant/page.tsx:266-284`
- Evidence:

```ts
localStorage.setItem("ai_requests_left", data.remainingRequests.toString());
...
localStorage.setItem("ai_requests_left", "0");
```

- Impact: Users can edit browser storage. This is acceptable if it only affects UI, but it must never be used as an enforcement mechanism.
- Fix: Keep enforcement on the server only and label local storage state as display-only in code comments if future maintainers might confuse it.
- Mitigation: Remove local storage if not needed; use server response on each request as the source of truth.
- False positive notes: Current enforcement is server-side cookie based, not localStorage based.

### SEC-010: Safe areas confirmed during review

- Rule ID: `REVIEW-NOTE`
- Severity: Low / Informational
- Location: `src/components/chat/SafeMessageText.tsx:12-25`, `src/components/chat/SafeMessageText.tsx:42-49`, `src/app/page.tsx:147`
- Evidence:

```ts
return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
```

```tsx
target="_blank"
rel="noopener noreferrer"
```

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

- Impact: I did not find an immediate XSS issue here. Markdown links are filtered to relative/http/https URLs, external links use `noopener noreferrer`, and JSON-LD is generated from local static data.
- Fix: Keep this pattern. Do not replace it with raw markdown-to-HTML rendering unless a sanitizer and CSP are added.
- Mitigation: Add unit tests for `getSafeHref` if it is exported or refactored.
- False positive notes: If future AI responses add richer markdown/HTML support, this finding should be revisited.

## Recommended Fix Order

1. Rotate local Gemini/OpenRouter keys and verify secrets were never committed.
2. Upgrade Next.js packages to `16.2.9` and rerun `npm audit`, `npm run lint`, `npm run build`.
3. Implement server-side rate limiting for `/api/consultant`, reduce daily quota from 20 to 10 if desired, and make cookie/localStorage display-only.
4. Add rate limiting, field length caps, and bot protection to `/api/leads`.
5. Remove 429 retries and broad model fallback from public AI calls; add timeouts/concurrency controls.
6. Add global security headers in `next.config.ts` or verify equivalent edge/CDN headers.
7. Sanitize production logging for upstream API responses and personal data.

## Commands Run

- `rg` scans for secrets, `process.env`, route handlers, dangerous DOM sinks, storage, redirects, CORS, and rate limiting.
- `npm audit --omit=dev --json`
- `npm audit --json`
- `npm outdated --json`
- Git checks for `.env.local` tracking and ignore status.
