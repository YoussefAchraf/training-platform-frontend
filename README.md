# Training Platform — Frontend

A mobile-first, responsive React + TypeScript SaaS frontend for
[`training-platform-backend`](../training-platform-backend) — a B2B training-delivery
management platform. Four roles (**Sales**, **Manager**, **Instructor**,
**SuperAdmin**) manage providers → trainings → client sessions → instructor
assignment → attendees → QR surveys → auto-generated reports. SuperAdmin gets a
dedicated `/superadmin/login` page and full user/session/audit-log oversight;
everything else is scoped by role. An optional chat widget
(`training-platform-chatbot-n8n`) is available to all signed-in roles once
`VITE_CHATBOT_WEBHOOK_URL` is configured.

## Stack

- React 19 + TypeScript (strict) + Vite
- `react-router-dom` v7 — routing, guarded by role
- `zustand` — persisted auth session (`features/auth/authStore.ts`) + cross-cutting UI
  state (drawer, toasts) in `shared/store/uiStore.ts`
- `@tanstack/react-query` — all server data/caching
- `axios` — API client with automatic access-token refresh on 401
- `react-hook-form` + `zod` — forms/validation
- Plain CSS: design tokens + `postcss-custom-media` for real, reusable breakpoints
  (no CSS framework)

## Getting started

```bash
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:4000
npm run dev             # http://localhost:3000
```

The dev server is pinned to port **3000** to match the backend's default
`CLIENT_URL` CORS setting. The backend must be reachable at `VITE_API_URL` (no
`/api` prefix — routes are root-mounted, e.g. `/auth/login`, `/sessions`).

`VITE_CHATBOT_WEBHOOK_URL` (also in `.env.example`) points at
`training-platform-chatbot-n8n`'s webhook (`docker compose up -d` in that repo,
default `http://localhost:5678`). Leave it unset to run without the chat widget.
A SuperAdmin account isn't self-service signup — seed one in the backend with
`npm run db:seed-superadmin`, then sign in at `/superadmin/login` (not `/login`).

```bash
npm run build     # tsc -b && vite build
npm run preview   # serve the production build
npm run lint       # oxlint
```

`npm run build` also generates `dist/sitemap.xml` and `dist/robots.txt`
(`vite-plugin-sitemap`, configured in `vite.config.ts`). Only `/`, `/login`, and
`/signup` are listed/allowed — everything behind auth is disallowed, since a crawler
would just get redirected to `/login` anyway. Set `SITE_URL` in `.env` to your real
production domain before deploying; it's build-time only, not shipped to the browser.

## Architecture

```
src/
├── app/            App.tsx (providers), ErrorBoundary
├── routes/         router.tsx, path constants, guards (Protected/Guest/Role)
├── layouts/         AuthLayout, AppLayout (sidebar+topbar+drawer), PublicLayout
├── styles/          tokens.css, breakpoints.css, reset.css, global.css
├── shared/          components/, hooks/, utils/, types/, lib/ (apiClient, queryClient)
└── features/
    ├── auth/         session store, login/signup, SuperAdmin login, account page
    ├── dashboard/     role-specific summary views (incl. SuperAdmin)
    ├── providers/     trainings/  clients/   — catalog CRUD (create/edit/delete)
    ├── sessions/      list/detail/create/edit/cancel, assign-instructor, respond, attendees
    ├── instructors/   Sales/Manager/SuperAdmin list, Instructor's own profile + skills
    ├── calendar/      global (editable) vs. mine (read-only)
    ├── survey/        public QR-linked feedback form + Instructor's QR modal
    ├── reports/       score/NPS summary per session + PDF download
    ├── admin/         pending approvals, user management, sessions overview, audit log
    └── chatbot/       floating chat widget (n8n webhook), Manager/Sales/Instructor/SuperAdmin
```

Each feature mirrors `api/ → hooks/ → components/ → pages/`. Route-level screens
live in `pages/`; `components/` stays reusable-only.

## Auth flow

Signup → account is `pending` until a Manager approves it (`/admin/pending-approvals`)
→ login issues a short-lived JWT (`Authorization: Bearer`) + a rotating refresh token
→ `/dashboard` renders Manager/Sales/Instructor-specific content from the same route.
A 401 triggers a single in-flight `/auth/refresh` (queued for concurrent requests);
failure clears the session and redirects to `/login`.

## Docker

```bash
docker build -t training-platform-frontend \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  --build-arg VITE_CHATBOT_WEBHOOK_URL=https://chatbot.yourdomain.com/webhook/chatbot/message \
  --build-arg VITE_VAPID_PUBLIC_KEY=<your VAPID public key> \
  --build-arg SITE_URL=https://app.yourdomain.com \
  .

docker run -d -p 8080:8080 \
  -e API_ORIGIN=https://api.yourdomain.com \
  -e CHATBOT_ORIGIN=https://chatbot.yourdomain.com \
  --name training-platform-frontend \
  training-platform-frontend
```

Two different things are configured at two different times:

- `VITE_API_URL` / `VITE_CHATBOT_WEBHOOK_URL` / `VITE_VAPID_PUBLIC_KEY` /
  `SITE_URL` are **build args** — baked into the compiled JS and
  `sitemap.xml`/`robots.txt` respectively. There's no server process to read
  an env var from at runtime, so these have to be known at `docker build`
  time. Leave `VITE_CHATBOT_WEBHOOK_URL` unset to ship a build with the chat
  widget disabled entirely, or `VITE_VAPID_PUBLIC_KEY` unset to ship one with
  the push-notification toggle hidden (it must match the backend's
  `VAPID_PUBLIC_KEY` exactly when set - generate a pair with
  `npx web-push generate-vapid-keys` in the backend repo).
- `API_ORIGIN` / `CHATBOT_ORIGIN` are **runtime env vars** — they're only used to
  fill in the `connect-src` origins in nginx's `Content-Security-Policy` header (see
  `docker/default.conf.template` and `docker/docker-entrypoint.sh`), so the same
  image can be reused across environments without rebuilding, as long as they match
  whatever `VITE_API_URL` / `VITE_CHATBOT_WEBHOOK_URL` were actually baked in at
  build time.

The image is a two-stage build: `node:22-alpine` compiles the static bundle, then
`nginxinc/nginx-unprivileged:1.27-alpine-slim` serves it (~21 MB total) — non-root
(uid 101, listens on 8080, not 80), no Node/npm/source in the final image, gzip +
year-long immutable caching on hashed `/assets/`, security headers (CSP, HSTS,
X-Frame-Options, etc.) on every response, and `public/404.html` as nginx's branded
`error_page 404` for anything that isn't a SPA route (the app's own client-side
`NotFoundPage` handles unknown routes like `/some/bogus/path` via the SPA fallback;
nginx's 404 only fires for genuinely missing static files under `/assets/`).

## Known backend limitations (not a frontend bug)

- **No endpoint to list a session's attendees** — only `POST /sessions/:id/attendees`
  exists. The attendees panel on a session's detail page can only show attendees
  added in the current visit; it says so in the UI.
- **No PDF for reports** — `Report.pdfUrl` is always `null` server-side.
- **No forgot-password / email-verification flow** — accounts are approved manually
  by a Manager instead.
