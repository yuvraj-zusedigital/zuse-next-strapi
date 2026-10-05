# Custom Next.js admin on top of Strapi — plan

Build a Next.js 16 editing app ("Zuse CMS") that replaces day-to-day use of the Strapi admin. Strapi stays the backend: database, REST API, S3 media, draft/publish, and the existing blog AI/TTS actions. The Strapi admin remains available for developers (Content-Type Builder, roles, API tokens).

## Goals

1. A visual page builder for `page.sections`: add, reorder, edit and remove sections, with a live preview that renders the real `nextsetup` components.
2. Editing for every content type editors touch: pages, projects (incl. case-study fields), blogs, testimonials, awards, authors, project categories, Header & Footer (`global`), organization settings.
3. A media library backed by the existing S3 upload provider.
4. Draft / publish / unpublish, and publishing that refreshes the live site.
5. Blog AI summary and audio generation, moved behind authentication.

Out of scope for now: schema editing (stays in Strapi's Content-Type Builder, dev only), i18n (no content type is localized today), admin role management UI.

## Architecture

```
Browser ──> Zuse CMS (Next.js 16, cms.zusedigital.com)
               │  server actions / route handlers only — no Strapi token in the browser
               ▼
            Strapi 5  /api/cms/*  (new "cms" API, Document Service, editor-role policy)
               │
               ├── Postgres / SQLite
               ├── S3 + CloudFront (upload provider)
               └── on publish ──> nextsetup revalidate webhook / static rebuild
```

- **Hostname:** `stagingadmin.zusedigital.com` / `admin.zusedigital.com` already serve Strapi (see `nextsetup/next.config.ts` and the CORS list in `config/middlewares.js`). Use `stagingcms.zusedigital.com` / `cms.zusedigital.com` for the new app.
- **Repo:** the app lives in `zuse-cms/` inside this repo, with its own `package.json`. All CMS work stays inside this repo; changes to `nextsetup` (e.g. the preview route below) need sign-off first. `strapi develop` ignores the folder (`config/admin.js` → `watchIgnoreFiles`), and it's excluded from the Strapi Docker image and lint.
- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui, `react-hook-form` + `zod`, `@dnd-kit` for drag-and-drop, TipTap for rich text, TanStack Query only for client-side polling (TTS status, media search).

## Strapi side: the `cms` API

Everything the admin app needs goes through one new API in this repo, `src/api/cms/`, so the Next.js app never depends on Strapi's internal admin endpoints (those change between versions).

### Auth

- Editors are **users-permissions** users with a new **Editor** role (plus an **Admin** role for full access). Strapi admin accounts stay for developers.
- Login: Next.js server action calls `POST /api/auth/local`, stores the JWT in an `httpOnly`, `secure`, `sameSite=lax` cookie, and never exposes it to client JS.
- Every `/api/cms/*` route uses the `global::cms-role` policy, which checks the user's CMS role (Editor, Admin, Super Admin).
- Password reset through users-permissions' forgot-password flow (SendGrid is already configured).

### Routes (`src/api/cms/routes/cms.js`)

| Method & path | Purpose |
|---|---|
| `GET /api/cms/schema` | Allow-listed content types + all components (`strapi.contentTypes`, `strapi.components`) so the app can build forms from the schema. |
| `GET /api/cms/types/:type` | List with search, filters, sort, pagination, draft/published status. |
| `GET /api/cms/types/:type/:documentId` | One document, draft version, deep-populated (reuse the logic in `src/middlewares/deep-populate.js`). |
| `POST /api/cms/types/:type` | Create a draft. |
| `PUT /api/cms/types/:type/:documentId` | Save draft. |
| `POST /api/cms/types/:type/:documentId/publish` · `/unpublish` · `/discard` | `strapi.documents(uid).publish()` / `unpublish()` / `discardDraft()`. |
| `DELETE /api/cms/types/:type/:documentId` | Delete. |
| `GET /api/cms/media` · `POST /api/cms/media` · `DELETE /api/cms/media/:id` | Wrap the upload plugin service (goes to S3). |
| `POST /api/cms/preview-token` | Short-lived signed token for the preview route. |

`:type` is checked against an allow-list mapping to UIDs (`page → api::page.page`, …), so `user-tracking`, `subscriber` and plugin types are not writable unless added deliberately.

Services use the Document Service API (`strapi.documents(uid)`), which is public and handles draft/publish for Strapi 5.

### Blog AI / TTS routes

`/api/blogs/:id/generate-audio`, `/generate-audio-elevenlabs`, `/generate-summary` (and their status routes) are currently `auth: false` — anyone can trigger paid OpenAI/ElevenLabs calls.

Done: Editor-only equivalents `GET /api/cms/blogs/:documentId/tools`, `POST …/audio/:provider` (openai | elevenlabs), `POST …/summary`, which reuse the blog controller's actions. Done (phase 6): the Strapi admin side panels now use admin-only routes (`src/plugins/blog-tools`) and the public routes are removed.

### Publish → live site

Add a Strapi lifecycle hook / webhook on `entry.publish` / `entry.unpublish`:

- **Node deployment of `nextsetup`:** call a new `nextsetup` route `POST /api/revalidate` (shared secret) that runs `revalidateTag()` / `revalidatePath()` for the affected path.
- **Static export (`STATIC_EXPORT=1`, S3 + CloudFront):** trigger the site's build pipeline instead, and show "Publishing — live in ~N min" in the CMS.

## Next.js side: `zuse-cms`

```
zuse-cms/
  app/
    (auth)/login/page.tsx
    (cms)/layout.tsx                 sidebar, session guard
    (cms)/page.tsx                   dashboard: recent edits, drafts
    (cms)/pages/                     page list + page builder
    (cms)/[type]/                    generic list + editor for other types
    (cms)/globals/header-footer/
    (cms)/media/
    (cms)/settings/
    api/…                            thin route handlers (media upload, TTS polling)
  lib/
    strapi.ts                        server-only fetch wrapper (cookie JWT, errors)
    schema.ts                        Strapi schema → zod + field config
    session.ts
  components/
    fields/                          one component per Strapi attribute type
    builder/                         section list, section picker, drag & drop
    media/
```

- `proxy.ts` (Next 16's renamed middleware) redirects unauthenticated requests to `/login`; each server action also re-checks the session.
- All Strapi calls happen in server components, server actions or route handlers (`import 'server-only'`).

### Schema-driven forms

`lib/schema.ts` turns `/api/cms/schema` into field definitions. Field components by Strapi type:

| Strapi type | Field |
|---|---|
| string, email, uid, text | input / textarea (uid gets "generate from" button) |
| richtext, blocks, TinyMCE HTML | TipTap editor |
| integer, decimal, boolean, date, enumeration | number / switch / date picker / select |
| media (single, multiple) | media picker from the library |
| relation | async searchable combobox |
| component (single, repeatable) | nested fieldset / sortable list |
| dynamiczone | page builder (below) |
| color-picker custom field | color input |

Per-field overrides live in a small config file (labels, help text, hidden fields, "one per line" hints from `docs/page-builder.md`). New fields added in Strapi show up in the CMS without code changes.

### Page builder

- Left: section list (drag to reorder, duplicate, delete, collapse). "Add section" opens a picker with thumbnails of the 22 section types.
- Right: form for the selected section, or full-width live preview.
- Autosave the draft (debounced) with a "Saved / Unsaved" indicator. Publish button with confirm.
- Editor conventions from `docs/page-builder.md` (asterisk gradient text, one-per-line fields) get inline hints.

### Preview

**Chosen (2026-09-29): in-CMS preview**, so nothing outside this repo changes. `zuse-cms/components/preview` renders each section with its own approximate components (site colours and gradient text copied from `nextsetup`), straight from the form's current values — it updates as you type, with desktop/tablet/mobile widths and click-a-section-to-edit. Trade-off: it's a second rendering of each section, so it shows structure and content, not the real site's exact design; data the site loads itself (blog posts, all testimonials/awards, project grid) shows as placeholders.

Alternative, if exact previews become important: a draft-mode preview route in `nextsetup` (validates a CMS preview token, enables Next.js Draft Mode, fetches with `status=draft`), embedded in the CMS as an iframe. Needs changes in `nextsetup` and the Node deployment.

## Phases

| Phase | Scope | Estimate |
|---|---|---|
| 0. Foundations ✅ | `cms` API (me, schema, read-only list/findOne), Editor role, policy, allow-list; `zuse-cms` scaffold, login, encrypted session, sidebar layout, dashboard, read-only lists | done 2026-09-29 |
| 1. Generic CRUD ✅ | Create/save/publish/unpublish/discard/delete API + schema-driven editor for every CMS type (scalar fields, relations; media/components shown read-only), uid uniqueness on save | done 2026-09-29 |
| 2. Media ✅ | `/api/cms/media` (list, upload, edit details, delete with usage count); `/media` library page, picker in the editor, streamed uploads up to 100 MB; local storage in `strapi develop` without AWS credentials | done 2026-09-29 |
| 3. Page builder ✅ | Sections editor (add/insert, drag & drop, move, duplicate, remove, collapse), section picker, nested/repeatable components everywhere (Header & Footer, SEO, cards…), rich-text `blocks` editor, colour fields, nested error display. **Autosave moved to phase 4** (it drives the preview refresh) | done 2026-09-29 |
| 4. Preview & autosave ✅ | In-CMS live preview of page sections (Form / Form + preview / Preview, device widths, click to edit), draft autosave with a toggle, "unsaved" tracking that keeps focus while autosaving. **Not done:** publish → refresh the live site (needs a revalidate hook in `nextsetup` or the build pipeline) | done 2026-09-29 |
| 5. Remaining types ✅ | Blog body editor (visual + HTML tab, opens as HTML when visual editing would drop formatting), blog tools panel (AI summary, OpenAI/ElevenLabs audio with progress) on Editor-only routes, machine-managed fields hidden, projects/case studies, Header & Footer, organization settings, SEO (all via the generic editor) | done 2026-09-29 |
| 6. Hardening & rollout ✅ (code) | Legacy blog AI routes moved to admin-only `/blog-tools` and removed from the public API; CMS login endpoint with per-visitor/per-account limits (Strapi's `/auth/local` limit is per IP, i.e. per CMS server); cost/upload rate limits; activity log (dashboard + "last edited by"); unit tests (Vitest) and API smoke test; security headers; Dockerfile + [deployment runbook](cms-deployment.md). **Left for you:** staging deploy, editor trial, production (runbook steps) | code done 2026-09-29 |

Total: roughly 8–10 weeks for one developer. Phases 0–3 deliver a usable page builder first; editors can keep using Strapi's admin for the remaining types until phase 5.

## Deployment

- `zuse-cms` gets its own Dockerfile and PM2/ECS setup like the existing apps.
- Env: `STRAPI_URL`, `SESSION_SECRET`, `PREVIEW_URL`, `PREVIEW_SECRET`.
- Strapi env: `CMS_ORIGIN`, `PREVIEW_SECRET`, `SITE_REVALIDATE_URL`, `SITE_REVALIDATE_SECRET`. Add the CMS origins to the CORS list (only needed if the browser ever calls Strapi directly; the design above doesn't).

## Risks and open questions

- **Static vs Node hosting for `nextsetup`:** live preview and instant publishing need the Node deployment. Decide whether staging/production move off static export or accept rebuild-on-publish.
- **Two user systems:** editors in users-permissions, developers in Strapi admin. Acceptable, but document who goes where.
- **Rich text:** blog content is TinyMCE HTML today. TipTap must round-trip it without breaking existing posts — test on real content early.
- **Schema drift:** schema-driven forms keep up with new fields automatically; custom section UIs (thumbnails, hints) need a small update per new section.
- **Unauthenticated AI/TTS endpoints** are an existing cost/security exposure — worth fixing independently of this project.
