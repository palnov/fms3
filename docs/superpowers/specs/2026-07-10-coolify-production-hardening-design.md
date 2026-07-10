# Coolify Production Hardening Design

## Goal

Prepare the existing migration information portal for reliable automatic deployment from GitHub to Coolify while improving performance, security, privacy transparency, error handling, accessibility, and automated verification.

The five simulated status-check tools remain in the product until a real data source is selected. Their algorithms, generated statuses, and result copy are explicitly outside this change. Semantic form associations and theme fixes may affect those pages without changing their behavior.

## Deployment Architecture

The application runs as one Coolify-managed container built automatically from the `main` branch. A persistent volume is mounted at `/data`. A separate Redis service is provisioned in Coolify and made available to the application through `REDIS_URL`.

Runtime storage is divided by responsibility:

- `/data/knowledge.db` is a read-only SQLite knowledge database uploaded or replaced independently of the Docker image.
- `/data/ai-chat-log.db` stores the AI conversation journal and is retained across deployments.
- Redis stores global rate-limit counters for the AI consultant, lead submission, and admin authentication attempts.
- The application image contains code and public static assets only. Mutable runtime data is not baked into the image.

The deployment remains limited to one application replica because the AI conversation journal uses SQLite. The read-only knowledge database and Redis can support multiple replicas, but the journal must move to PostgreSQL or another shared database before replicas are increased.

The canonical runtime configuration is:

```env
DATA_DIR=/data
KNOWLEDGE_DB_PATH=/data/knowledge.db
AI_CHAT_LOG_DB_PATH=/data/ai-chat-log.db
REDIS_URL=redis://redis:6379
```

`.env.example` and README must describe every required and optional variable actually consumed by the application, including admin, retention, public URL, OpenRouter, Pravoved, and Redis settings.

The Docker runner uses a non-root user that can read and write the mounted data directory. Coolify checks `/api/health`. The endpoint returns `200` only when the application can reach Redis and read the knowledge database; it returns a sanitized `503` otherwise. Static public pages remain available when an AI dependency is unavailable, while AI endpoints return a clear `503` response.

## Redis Rate Limiting

The local SQLite rate-limit database is removed. A shared Redis implementation performs atomic fixed-window updates so concurrent requests and future application processes observe the same counters.

Independent namespaces and limits cover:

- AI requests by trusted client IP and anonymous browser identifier;
- lead submissions by client IP and normalized phone number;
- failed admin login attempts by client IP.

Rate-limit responses preserve standard limit, remaining, reset, and retry headers. Client IP extraction trusts only the reverse-proxy headers documented for the Coolify proxy chain and falls back safely when none is available. Redis failures fail closed for expensive or authentication-sensitive operations and produce a sanitized `503` response.

## AI Consultant Architecture

The current consultant route is decomposed into testable units with narrow responsibilities:

- runtime configuration validation;
- OpenRouter completion and embedding client;
- knowledge database repository;
- retrieval and top-K selection;
- Redis-backed quota service;
- conversation journal repository;
- prompt and response orchestration;
- HTTP route adapter.

The knowledge repository loads chunk embeddings and decodes their JSON representation once per application process. It records the knowledge database modification time and reloads the in-memory index when the file changes. Retrieval computes cosine similarity and retains the best candidates in one pass instead of sorting every chunk.

SQLite connections are deterministic and closed on failures. External requests use explicit timeouts, bounded retries for transient failures, and sanitized errors. The existing prompt behavior, language handling, lead intent behavior, answer content, and source presentation remain unchanged.

## Client Performance

The shared chat provider no longer calls the consultant status endpoint when every public page mounts. Quota status is loaded when the user first opens the floating chat, visits the dedicated consultant experience, or submits a question.

The floating widget is dynamically loaded. The provider may remain lightweight at the root to preserve shared conversation state, but it performs no network or storage-heavy work until the chat is used. Chat state remains versioned in local storage.

GSAP and ScrollTrigger are removed from the root layout. Motion needed by the home page is local to that page and implemented with CSS or a small Intersection Observer helper. Long-lived global DOM MutationObservers are removed. Reduced-motion preferences continue to disable nonessential animation.

The client distinguishes rate-limit, dependency-unavailable, validation, and network errors. The API request and response shapes are represented by shared TypeScript types or schemas.

## Security

Production configuration validates the presence and minimum strength of signing and admin secrets without logging their values. Admin login receives a Redis-backed failed-attempt limit. Cookie-authenticated admin mutations validate the request origin against the configured canonical site origin, use no-store responses, and continue to check authorization inside every route.

The lead proxy gains an outbound timeout, response-shape validation, and safe handling for non-JSON upstream errors. Request-size limits remain enforced. Server logs exclude credentials, cookies, phone numbers, chat content, and raw upstream payloads.

Security headers use an explicit production Content Security Policy covering first-party resources and the exact external origins needed by Yandex Metrika and the configured APIs. The policy does not introduce `unsafe-eval`. Existing clickjacking, MIME sniffing, referrer, and permissions protections remain in place.

Sensitive API and admin responses declare `Cache-Control: no-store`. Health responses reveal component status categories but no paths, credentials, stack traces, or infrastructure addresses.

## Analytics and Privacy

Yandex Metrika and Webvisor remain enabled by default. The site presents an analytics preference panel. If a visitor declines analytics, the site records an opt-out, disables further Metrika activity, and does not load Metrika on subsequent visits until the visitor changes the preference.

Because this is an opt-out model, the first page view may be transmitted before a visitor declines. The privacy notice states this behavior plainly.

Inputs containing names, telephone numbers, lead questions, document identifiers, and AI chat messages are marked so Webvisor cannot record their values. Chat and lead interfaces link to the privacy notice. Lead submission requires an explicit acknowledgment of personal-data processing.

The `/privacy` page describes:

- data processed by the application;
- purposes and retention periods, including the 60-day default AI conversation retention;
- functional cookies and analytics preference storage;
- OpenRouter, Yandex Metrika/Webvisor, and the external lead reception service;
- how a visitor can change analytics preferences or request data-related assistance through the published site contact.

The page is an accurate product notice, not a claim of formal legal review.

## Routing, SEO, and Error Handling

The proxy route allowlist and catch-all redirect are removed. Unknown URLs use the normal Next.js 404 response rather than redirecting to the home page.

The application adds accessible `not-found.tsx`, route `error.tsx`, and `global-error.tsx` fallbacks. Dynamic administration and AI experiences receive suitable loading or failure UI where it improves recovery.

Public route metadata is centralized so sitemap generation and route smoke tests use one canonical list. `robots.txt` disallows API and admin paths. Canonical metadata is preserved, and a valid Open Graph image is added using the supported Next.js metadata convention.

## Theme and Accessibility

The current release is explicitly light-only. Tailwind's `dark:` variant is changed to activate only under an explicit `.dark` class. Since the application does not add that class, operating-system dark preference no longer creates dark controls inside light surfaces.

Forms receive stable `id` and `name` attributes, associated `label` elements, appropriate autocomplete hints, accessible descriptions, and live regions for asynchronous status and errors. Modal and chat interactions receive correct accessible names, focus management, and keyboard behavior.

The five simulated status-check pages may receive these theme and semantic accessibility corrections only. Their algorithms, timing behavior, generated statuses, claims, and result text are not changed in this project.

## Testing and Continuous Integration

Vitest covers configuration parsing, Redis rate limiting, cookie/session behavior, retrieval ranking, and payload validation. Integration tests cover lead handling, consultant quota status, admin login throttling, and health-state responses without contacting real external APIs.

Playwright smoke tests cover:

- the home page;
- an MDX article;
- the AI consultant page;
- a genuine 404 response;
- accessible form names and status regions;
- stable light-theme contrast when the browser reports a dark operating-system preference.

Generated test expectations do not lock in the simulated status-check algorithms.

GitHub Actions runs on pull requests and pushes to `main` with the following gates:

1. `npm ci`
2. ESLint
3. TypeScript type checking
4. unit and integration tests with a Redis service container
5. production build
6. Playwright smoke tests

Package scripts expose `typecheck`, `test`, `test:e2e`, and `check`. Dependabot monitors npm and GitHub Actions dependencies.

Coolify is configured to deploy only `main`. Branch protection should require the GitHub Actions workflow before merging to `main`; Coolify deployment itself remains triggered by the existing GitHub integration.

## Operations Documentation

README documents:

- creating and attaching the `/data` volume;
- creating Redis in Coolify and setting `REDIS_URL`;
- transferring the existing `knowledge.db` to `/data/knowledge.db`;
- required file ownership and permissions;
- configuring the healthcheck;
- keeping the application at one replica;
- replacing the knowledge database without rebuilding the image;
- backing up the conversation journal and retaining a source copy of the knowledge database;
- rollback expectations for code and data.

## Acceptance Criteria

- Automatic GitHub-to-Coolify deployment continues to use the existing Docker build.
- A deployment does not erase the knowledge database or AI conversation journal.
- Redis-backed limits are shared and atomic.
- Static pages remain usable during Redis, OpenRouter, or knowledge dependency failures.
- The consultant does not make a quota-status request on unrelated page loads.
- Knowledge embeddings are not re-read and decoded on every question.
- Unknown routes return 404 instead of redirecting home.
- System dark preference does not produce light-on-light or dark-on-dark controls.
- Webvisor remains enabled by default and stops after stored analytics opt-out.
- Sensitive form and chat values are masked from Webvisor.
- Admin login is throttled and cookie-authenticated mutations validate origin.
- Lint, typecheck, unit/integration tests, production build, and browser smoke tests pass in GitHub Actions.
- Simulated status-check behavior is unchanged.

## Deferred Work

- Connecting the five status-check tools to real official data sources.
- Migrating the knowledge search to pgvector, Qdrant, or another dedicated vector index.
- Migrating the AI journal to PostgreSQL and running multiple application replicas.
- Treating the privacy notice as a substitute for jurisdiction-specific legal review.
