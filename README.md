# Swapnajatra Properties Ltd. — Website + Admin CMS

The existing public website, now backed by a real **Node.js/Express API** and **PostgreSQL**, with a secure
**admin dashboard** at `/admin/`. One source of truth: **the database**.

```
Public website ─┐
                ├─►  Express API  ─►  PostgreSQL
Admin dashboard ┘    (sessions, validation, uploads)
```

Admin changes → API → database → public website (every public request reads the database; API responses are `no-store`).

## Stack
- Frontend: your original HTML/CSS/JS (design unchanged), now loading data from `/api`
- Backend: Node.js ≥ 18, Express, `pg`, `express-session` + `connect-pg-simple` (sessions stored in PostgreSQL),
  `bcryptjs` (bcrypt hashing, cost 12), `helmet` (CSP etc.), `express-rate-limit`, `multer`
- Database: PostgreSQL 12+

## Structure
```
frontend/                public site (index.html, css/, js/, config.js) and admin/ (the CMS UI)
backend/src/             app.js, server.js, config/, middleware/, models/ (SQL), routes/, services/, utils/
backend/scripts/         migrate.js, seed.js, create-admin.js
backend/tests/           unit tests (npm test)
database/migrations/     001_init.sql  (schema)
.env.example  .gitignore  README.md
```

## Local setup
1. Install PostgreSQL, then create a database and user:
   ```sql
   CREATE USER swapnajatra WITH PASSWORD 'choose-a-password';
   CREATE DATABASE swapnajatra OWNER swapnajatra;
   ```
2. `cp .env.example .env` and set `DATABASE_URL` and `SESSION_SECRET` (generator command is in the file).
3. ```bash
   cd backend
   npm install
   npm run setup          # runs migrations + seeds default settings, content and the 5 services
   npm run create-admin   # prompts for name, login and password (never stored in code)
   npm run dev            # http://localhost:4000   admin: http://localhost:4000/admin/
   ```
4. Optional sample listings (flagged **DEMO DATA**, removable in one click in Admin → Overview):
   `npm run seed:demo`

`npm test` runs the offline unit tests. `GET /healthz` checks the DB connection.

## First admin
`npm run create-admin` (interactive, hidden password prompt). Non-interactive:
`ADMIN_NAME="Owner" ADMIN_EMAIL=owner ADMIN_PASSWORD='…' npm run create-admin`.
Running it again with an existing login resets that admin's password. Password rule: ≥ 10 chars, letters + numbers.
There is **no default password** anywhere. The old hardcoded `SWP@2026` has been removed.

## Admin dashboard (`/admin/`)
Overview (live DB counts) · Website Content (hero, about, services text, footer, contact — Bangla + English) ·
Properties (add/edit/delete, publish/unpublish/draft, feature, images, search + filters) · Projects · Services
(enable/disable, order) · Visit Requests · Enquiries (search, filter, status, delete) · Settings (company, social,
branding, preferences, property display, lead settings, maintenance mode) · Admin Account (profile, password change).

Notes on the data model:
- Property **availability** (`Available / Sold / Rented`) and **publishing** (`draft / published`) are separate fields.
  Only *published* properties appear publicly; Sold/Rented visibility is controlled in Settings.
- The public site shows **Projects** and **About** sections only once they have content.
- The ☰ menu on the public site shows one item, **Admin Login**, which opens `/admin/`. Turning the menu off in Settings
  hides it, but `/admin/` still works.

## API overview
Public (no login, published data only): `GET /api/bootstrap`, `/api/properties[/:idOrSlug]`, `/api/projects`,
`/api/services`, `/api/content`, `/api/settings`; `POST /api/enquiries`, `POST /api/visit-requests`.
Auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
Admin (session + CSRF required): `/api/admin/{properties,projects,services,enquiries,visit-requests}` (CRUD; PATCH for
quick changes), `/api/admin/content`, `/api/admin/settings`, `/api/admin/uploads`, `/api/admin/stats`,
`/api/admin/demo-data`, `/api/admin/account`, `/api/admin/account/password`.

## Security implemented
- bcrypt password hashes (cost 12), constant-time login path, generic error message, login rate limit (10 failures / 15 min / IP)
- Server-side sessions in PostgreSQL; `HttpOnly`, `SameSite=Lax`, `Secure` in production; session id rotated on login;
  idle expiry (`SESSION_MAX_HOURS`); changing the password signs out all other sessions
- CSRF token on every admin write; CORS allow-list; `helmet` with a strict CSP (no inline scripts)
- Server-side validation + whitelisting of every field (unknown fields are ignored); parameterised SQL only
- Uploads: type verified by file signature (JPG/PNG/GIF/WebP only — SVG rejected), random file names, size limit
- Output escaping everywhere (public site and admin); contact forms have a honeypot and rate limit
- Secrets only in environment variables; nothing sensitive in frontend code

## Deploy (any host with Node + PostgreSQL: Render, Railway, Fly.io, a VPS …)
1. Create a PostgreSQL database; set env vars from `.env.example` with `NODE_ENV=production`, `COOKIE_SECURE=true`,
   `TRUST_PROXY=1`, `DATABASE_SSL=true` (if the provider requires TLS), a strong `SESSION_SECRET`.
2. Build/install: `cd backend && npm ci --omit=dev` · Start: `npm start` (serves the website at `/` and admin at `/admin/`).
3. Once: `npm run setup`, then `npm run create-admin` (run from the host's shell).
4. **Uploads need persistent storage.** Many hosts wipe the disk on every deploy. Mount a persistent volume and point
   `UPLOAD_DIR` at it. If that isn't available, swap `backend/src/services/storage.js` for S3/Cloudinary
   (only `save()` and `remove()` change; the DB already stores just URLs).
5. Put it behind HTTPS (the host usually does this) and point your domain at it.

If you host the frontend separately (CDN), set `window.SWP_API_BASE` in `frontend/config.js` and add the origin to
`CORS_ORIGINS`. The admin panel must be served by the backend (same origin) for cookies/CSRF to work.

## Production checklist
- [ ] Strong unique `SESSION_SECRET`; `COOKIE_SECURE=true`; HTTPS on
- [ ] Admin created with a strong password; no other accounts needed
- [ ] `npm audit` run and dependencies updated (versions in `package.json` were set without registry access)
- [ ] Persistent upload storage configured (or S3/Cloudinary)
- [ ] Database backups enabled at the provider
- [ ] DEMO DATA removed (Admin → Overview) or never seeded
- [ ] Real email, hours, social links entered in Settings; Bangla text reviewed by a native speaker
- [ ] SMTP configured *if* you want e-mail notifications (WhatsApp notifications are not implemented)

## Known limitations
- Maintenance mode is a full-page overlay on the public site; the public JSON API stays reachable.
- Only one admin role is used in practice (an `editor` role exists in the schema but is not differentiated yet).
- The public Projects section shows each project's cover image only.
