# Training Platform — Frontend

A mobile-first, installable React + TypeScript web app for
[`training-platform-backend`](../training-platform-backend) — a B2B training-delivery
management platform. Four roles (**Sales**, **Manager**, **Instructor**, **SuperAdmin**)
manage the full lifecycle of a training engagement: providers → trainings → client
sessions → instructor assignment → attendees → QR-code surveys → auto-generated reports.
A fifth role, **Developer**, lives in its own separate area entirely outside this app —
receiving feedback from the other four roles and publishing feature announcements back to
them. The app runs equally well as an ordinary web page, an installed desktop/tablet/phone
PWA, and offline.

## Highlights

- **Four tailored experiences, one codebase** — Sales, Manager, Instructor, and SuperAdmin
  each get dashboards, navigation, and page content scoped to what they need, with a
  dedicated `/superadmin/login` and full platform-oversight tools for SuperAdmin.
- **A fifth, separate Developer area** (`/developer/login`) — its own login, its own shell,
  no sidebar or catalog nav. A Developer reads feedback the other four roles send in and
  publishes feature announcements to whichever roles they pick; each targeted user is shown
  a mandatory, star-rated popup once, and the Developer sees the aggregated ratings back.
- **Installable, native-feeling PWA** — distinct desktop, tablet, and phone shells once
  installed (title bar + sidebar on desktop, an icon rail on tablet, a bottom tab bar on
  phone), home-screen shortcuts, app badging, and offline support with a graceful
  "you're offline" fallback.
- **Bilingual out of the box** — every screen, including PWA-only surfaces, is fully
  translated in English and French, switchable instantly from the user menu.
- **Light, dark, and system theming**, a guided in-app tour that explains each page's
  sections role-by-role, and a fluid, mobile-first responsive layout tuned across five
  breakpoints from phone to large monitor.
- **Hardened for production** — strict CSP and security headers, a locked-down browser
  support matrix with a graceful redirect for anything older, and a CI/CD pipeline with
  SAST/DAST/SCA scanning, container vulnerability scanning, and CodeQL on every change.

## Stack

- React 19 + TypeScript (strict) + Vite
- `react-router-dom` v7 — routing, guarded by role
- `zustand` — persisted auth session, theme, and tour state, plus cross-cutting UI state
  (drawer, toasts) in `shared/store/uiStore.ts`
- `@tanstack/react-query` — all server data/caching
- `axios` — API client with automatic access-token refresh on 401
- `react-hook-form` + `zod` — forms/validation
- `i18next` + `react-i18next` — English/French internationalization
- `driver.js` — the in-app guided tour
- `vite-plugin-pwa` + `workbox` — service worker, offline support, push notifications
- `motion` — animation
- Plain CSS: a design-token system + `postcss-custom-media` for real, reusable breakpoints
  (no CSS framework)

## Roles at a glance

| Role | Focus |
| --- | --- |
| **Sales** | Books sessions for clients, manages the provider/training/client catalog, tracks their own pipeline |
| **Manager** | Everything Sales does, plus assigning instructors, approving new accounts, and the audit log |
| **Instructor** | Their own assigned sessions, a personal calendar, marking attendance, and a bio/skills profile that drives assignment eligibility |
| **SuperAdmin** | Platform-wide oversight — every user, every session, the full audit trail, and a dedicated login |
| **Developer** | Separate area entirely (`/developer/login`) — reads feedback from the other four roles, publishes feature announcements and sees their star ratings |

## Feature tour

### Authentication & account
Sales, Manager, and Instructor accounts sign up at `/signup` and land in a pending state
until a Manager approves them; SuperAdmin has its own dedicated `/superadmin/login`
(styled distinctly, with a brute-force cooldown after repeated failed attempts) rather
than self-service signup. Session state lives in an httpOnly cookie, silently restored on
every app load so a page refresh never bounces a signed-in user back to login. The Account
page (`/account`, every role) covers profile editing, account details, and per-device push
notification opt-in, with Instructors getting a shortcut to their skills profile.

### Dashboards
Every role lands on `/dashboard` after signing in and sees a purpose-built view: SuperAdmin
gets platform-wide stats (users, pending signups, sessions) and quick links into user
management, the sessions overview, and the audit log; Manager and Sales get
sessions-needing-attention stats and an upcoming-sessions list; Instructor sees their own
assignment load, completed sessions, and what's coming up next.

### Catalog — Providers, Trainings, Clients
Three parallel CRUD areas — training providers (with logos), the training catalog (each
tied to a provider, with a duration in hours or days), and client companies. Every role can
browse the catalog; Sales, Manager, and SuperAdmin can create and manage entries, with each
record editable by its creator or by a SuperAdmin.

### Sessions
The session list (`/sessions`) shows every booked session with its training, client,
instructor, and status; booking a session auto-computes its end date from the training's
duration. The session detail page is the richest screen in the app, adapting its action bar
by role: Manager/SuperAdmin assign or reassign an instructor (matched by skill) and can edit
dates or cancel; the assigned instructor gets a survey QR code and marks attendance; Sales,
Manager, and SuperAdmin manage the attendee list and generate the completion report.

### Instructors
Sales, Manager, and SuperAdmin browse the instructor directory with each person's skills at
a glance (Manager/SuperAdmin can edit); every Instructor manages their own bio and skill set
at `/instructors/me` — the same skills that drive who's eligible for a given session.

### Calendar
One calendar at `/calendar` with a heatmap (month grid with per-day session counts and a
click-through detail panel) and an agenda (day-by-day list) view. Sales, Manager, and
SuperAdmin see every session company-wide and can edit/cancel from the calendar itself;
Instructors see their own schedule.

### Administration
Manager and SuperAdmin review and act on pending signups; SuperAdmin additionally manages
every user account, sees a company-wide sessions overview, and reads the full audit
log — a filterable, expandable history of every create/update/delete/cancel action across
the platform, including account changes.

### Reports & surveys
A session report aggregates its post-training survey responses into an average instructor
score and NPS, downloadable as a PDF once generated. The survey itself is a fully public,
unauthenticated page reached by scanning a session's QR code — a simple, mobile-friendly
rating flow with no login required.

### Assistant & notifications
A floating chat assistant is available to every signed-in role throughout the app (a
dedicated tab in the phone PWA shell). Push notifications can be enabled per device from
the Account page, with the app proactively offering to turn them on for eligible users.

### Guided tours
A "Guide" button lives in the app's navigation on every page. Clicking it — or, the very
first time a new account reaches its dashboard, automatically — walks through that page's
sections with role-appropriate explanations, so a new SuperAdmin, Manager, Sales rep, or
Instructor gets an instant, in-context orientation wherever they are.

### Feedback & feature announcements
Every Sales, Manager, Instructor, and SuperAdmin gets a "Feedback" page (in the main nav,
not on the mobile bottom bar) to send a bug report, an enhancement idea, or a general
message straight to the Developer. Whenever the Developer publishes a new feature to one or
more of those roles, each targeted user is shown a popup — title, description, and a 1-5
star rating — the next time they use the app; it's mandatory (no Escape, no backdrop click,
no × button) and, with several pending, walks through them one at a time, unlocking "Next"
only once the current one is rated. The Developer's own area (`/developer/login`, a
separate shell with no sidebar) has an inbox of every submitted report and a dashboard for
every published announcement showing its overall rating plus a breakdown by role.

## Platform capabilities

### Progressive Web App
Installable on desktop and mobile, with a custom install prompt on Chromium browsers
(Chrome, Edge, Brave, Opera) and step-by-step manual instructions on the two platforms with
no `beforeinstallprompt` event at all: iOS Safari (Share → Add to Home Screen) and Firefox
Android (⋮ menu → Install). Once installed, the app renders a shell tailored to the device:
a native-app-style title bar and sidebar on desktop, an icon rail on tablet, and a bottom
tab bar on phone — the same routes and data throughout, just different chrome. A Workbox
service worker precaches the app shell and serves cached data with a visible offline
indicator when the network drops, with a dedicated offline page for a first-ever visit with
no connection. New versions are offered via a "Refresh" toast rather than a silent reload,
so nothing is lost mid-task. Home-screen shortcuts, adaptive app icons, device-specific
splash screens, and app-icon badging (Chrome/Edge on Windows/macOS, Safari 16.4+) round it
out. Push notification permission is only ever requested from a direct user gesture — a
click, never a mount-time effect — since iOS Safari silently drops (and can permanently
deny) a request that isn't; a one-time nudge on iOS points to the click that actually
enables it, once the app is already installed (push there requires that first).

Two platform quirks worth knowing, neither fixable from this codebase: Brave sometimes
installs a PWA as a plain home-screen shortcut instead of a full app — confirmed via
Brave's own open GitHub issues to be a Brave-side setting/bug, not a manifest gap, since
Brave uses the same installability criteria as Chrome once it decides to offer the real
path. Firefox desktop has no stable native "install this site" feature at all as of this
writing (Mozilla's "Taskbar Tabs" is still experimental/opt-in) — only Firefox *Android*
gets an install banner here, for exactly that reason.

### Internationalization
Every namespace in the app — fifteen in total, from shared UI copy to feature- and
PWA-specific strings — ships complete English and French translations. Language is
detected automatically on first visit and can be switched instantly from the user menu (or
the PWA profile screen), persisting across sessions.

### Theming
Light, dark, and "match system" modes, toggled from the same place as the language switch
and kept in sync live if the OS theme changes while "system" is selected.

### Responsive, mobile-first design
A five-step breakpoint scale (480 / 768 / 1024 / 1280 / 1536px) and a single design-token
system — color, type, spacing, radius, shadow, motion — drive every screen, so the same
components adapt cleanly from a phone in one hand to a widescreen monitor, and the same
breakpoints choose which PWA shell renders once installed.

### Browser support
Targets the last two versions of Chrome, Firefox, Safari, and Edge. A lightweight
feature-detection script runs before the app loads and redirects anything that can't run it
(including IE11) to a bilingual "please update your browser" page, rather than letting it
fail silently.

## Architecture

```
src/
├── app/            App.tsx (providers), ErrorBoundary
├── routes/         router.tsx, path constants, guards (Protected/Guest/Role/Developer)
├── layouts/        AuthLayout, AppLayout (sidebar+topbar+drawer), PublicLayout,
│                   SuperAdminAuthLayout, DeveloperAuthLayout, DeveloperLayout
├── pwa/            Installed-app shells (phone/tablet/desktop), install prompts, splash
├── styles/         tokens.css, breakpoints.css, reset.css, global.css
├── shared/         components/, hooks/, utils/, types/, lib/ (apiClient, queryClient), i18n/
└── features/
    ├── auth/           session store, login/signup, SuperAdmin/Developer login, account page
    ├── dashboard/      role-specific summary views (incl. SuperAdmin)
    ├── providers/      trainings/  clients/  — catalog CRUD (create/edit/delete)
    ├── sessions/       list/detail/create/edit/cancel, assign-instructor, attendees
    ├── instructors/    Sales/Manager/SuperAdmin list, Instructor's own profile + skills
    ├── calendar/       global (editable) vs. mine (read-only)
    ├── survey/         public QR-linked feedback form + Instructor's QR modal
    ├── reports/        score/NPS summary per session + PDF download
    ├── admin/          pending approvals, user management, sessions overview, audit log
    ├── chatbot/        floating assistant widget (n8n webhook), every signed-in role
    ├── push/           per-device push-notification opt-in
    ├── tour/           the role-aware, per-page guided tour
    ├── feedback/       the "send feedback" page (Sales/Manager/Instructor/SuperAdmin)
    ├── announcements/  the mandatory rating popup + its API/hooks (shared with developer/)
    └── developer/      the Developer-only feedback inbox + announcement dashboard pages
```

Each feature mirrors `api/ → hooks/ → components/ → pages/`. Route-level screens live in
`pages/`; `components/` stays reusable-only.

## Auth flow

Signup → account is `pending` until a Manager approves it (`/admin/pending-approvals`) →
login sets an httpOnly session cookie → `/dashboard` renders role-specific content from the
same route. A 401 triggers a single in-flight `/auth/refresh` (queued for concurrent
requests) before retrying; the session is otherwise silently restored on every app load via
one bootstrap call to `/auth/me`. SuperAdmin and Developer both skip self-service signup
entirely — each signs in at its own dedicated route (`/superadmin/login`,
`/developer/login`) and lands on its own area (`/dashboard`, `/developer`); an already
logged-in visit to the wrong login page redirects to the right area instead of showing the
form.

## Getting started

```bash
npm install
cp .env.example .env   # see below
npm run dev             # http://localhost:3000
```

`npm run dev` serves the app on port **3000** and proxies `/api/*` and
`/webhook/chatbot/message` to the backend and chatbot services (`BACKEND_UPSTREAM` /
`CHATBOT_UPSTREAM` in `.env`, defaulting to `http://localhost:4000` and
`http://localhost:5678`) — the same same-origin setup production nginx uses, so nothing
needs to change between local dev and a deployed container.

`VITE_CHATBOT_WEBHOOK_URL` points at `training-platform-chatbot-n8n`'s webhook
(`docker compose up -d` in that repo). A SuperAdmin account isn't self-service signup —
seed one in the backend with `npm run db:seed-superadmin`, then sign in at
`/superadmin/login` (not `/login`). A Developer account works the same way: seed one with
`npm run db:seed-developer` in the backend, then sign in at `/developer/login`.

```bash
npm run build       # tsc -b && vite build
npm run preview     # serve the production build
npm run lint         # oxlint
npm test              # vitest run
npm run test:watch    # vitest, watch mode
```

`npm run build` also generates `dist/sitemap.xml` and `dist/robots.txt`
(`vite-plugin-sitemap`). Only `/`, `/login`, and `/signup` are listed/allowed — everything
behind auth is disallowed, since a crawler would just get redirected to `/login` anyway.
Set `SITE_URL` in `.env` to the real production domain before deploying; it's build-time
only, not shipped to the browser.

## Testing

Component, hook, and store tests run on **Vitest** with `jsdom`, using Testing Library for
component-level tests and a shared setup (`src/test/setup.ts`) that wires up
`jest-dom` matchers and initializes i18n so translated copy renders correctly under test.
Coverage favors business-critical and logic-heavy areas — session-duration math, tour route
resolution, survey scoring, attendee handling — over exhaustively testing every component.

## Docker

```bash
docker build -t training-platform-frontend \
  --build-arg VITE_API_URL=/api \
  --build-arg VITE_CHATBOT_WEBHOOK_URL=/webhook/chatbot/message \
  --build-arg VITE_VAPID_PUBLIC_KEY=<your VAPID public key> \
  --build-arg SITE_URL=https://app.yourdomain.com \
  .

docker run -d -p 8080:8080 \
  -e BACKEND_UPSTREAM=http://backend:4000 \
  -e CHATBOT_UPSTREAM=http://chatbot:5678 \
  --name training-platform-frontend \
  training-platform-frontend
```

Two different things are configured at two different times:

- `VITE_API_URL` / `VITE_CHATBOT_WEBHOOK_URL` / `VITE_VAPID_PUBLIC_KEY` / `SITE_URL` are
  **build args** — baked into the compiled JS and `sitemap.xml`/`robots.txt`, since there's
  no server process to read an env var from at runtime. The defaults (`/api` and
  `/webhook/chatbot/message`) assume nginx is proxying those paths to the backend/chatbot,
  which is the setup below. Leave `VITE_VAPID_PUBLIC_KEY` unset to ship a build with the
  push-notification toggle hidden — set it to match the backend's `VAPID_PUBLIC_KEY`
  exactly to enable it (generate a pair with `npx web-push generate-vapid-keys` in the
  backend repo).
- `BACKEND_UPSTREAM` / `CHATBOT_UPSTREAM` are **runtime env vars** — nginx reverse-proxies
  `/api/` and `/webhook/chatbot/message` to them (`docker/default.conf.template`,
  rendered by `docker/docker-entrypoint.sh` at container start), so the exact same image
  can be pointed at any backend without a rebuild, as long as `VITE_API_URL` /
  `VITE_CHATBOT_WEBHOOK_URL` were built as same-origin paths.

The image is a two-stage build: a Node builder compiles the static bundle, then
`nginx-unprivileged` serves it (non-root, listens on 8080, no Node/npm/source in the final
image) with gzip, a year-long immutable cache on hashed `/assets/`, a full security-header
set (CSP, HSTS, X-Frame-Options, Permissions-Policy, and more) on every response, and
`public/404.html` as nginx's branded `error_page 404` for genuinely missing static files —
client-side routes are handled by the SPA itself via `try_files`.

## CI/CD

Every `feature/**` push runs lint, type-checking, SCA, SAST, and secret-scanning, then
opens (and auto-merges) a PR into `dev` once green. A pull request into `dev` or `main`
additionally runs a DAST scan and a full Docker build-and-scan (Trivy + a CycloneDX SBOM).
Promoting `dev` to `main` opens a PR for human review rather than auto-merging; once merged,
the same checks run again and the image is built, scanned, and pushed to GHCR (tagged by
commit SHA and `latest`), with the new tag rolled out via an auto-merging PR to the
project's GitOps repo. CodeQL scans both the app source and the GitHub Actions workflows
themselves, on every change and on a weekly schedule.
