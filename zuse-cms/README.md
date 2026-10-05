# Zuse CMS

Next.js 16 editing app for zusedigital.com. Strapi (the repo root) stays the backend; this app talks to it only through the `/api/cms/*` API (`../src/api/cms`). Plan and phases: [`../docs/nextjs-admin-plan.md`](../docs/nextjs-admin-plan.md).

## Run locally

1. Start Strapi from the repo root: `npm run develop` (port 1338).
2. Create the env file and an editor account:

   ```bash
   cp .env.example .env.local                      # then set SESSION_SECRET (openssl rand -base64 32)
   cd .. && CMS_EDITOR_EMAIL=you@zusedigital.com CMS_EDITOR_PASSWORD='…' npm run cms:create-editor
   ```

3. `npm install && npm run dev` → http://localhost:3100

## How auth works

- Editors are Strapi **users-permissions** users with the **Editor** role (created and granted `/api/cms/*` on Strapi boot). Strapi admin accounts don't sign in here.
- Login posts to Strapi's `/api/cms/login` (Editor only). It's rate-limited per visitor IP and per account; the CMS forwards the visitor's IP signed with `CMS_PROXY_SECRET` (Strapi's own `/api/auth/local` limit is per IP, which for the CMS would be this one server).
- The Strapi JWT is stored in an encrypted, httpOnly cookie (`lib/session.ts`) and used only on the server (`lib/strapi.ts`).
- `proxy.ts` redirects visitors without a cookie; `lib/dal.ts` verifies the session on every page. A rejected token goes to `/session-expired`, which clears the cookie.

## Layout

```
app/(auth)/login              sign-in page + server actions
app/(cms)                     signed-in area: sidebar layout, dashboard
app/(cms)/[type]              list (single types open the editor directly)
app/(cms)/[type]/new          new entry
app/(cms)/[type]/[documentId] edit entry
app/(cms)/[type]/actions.ts   save / publish / unpublish / discard / delete / relation search
app/session-expired           clears a bad session cookie
components/editor             schema-driven editor, field inputs, relation picker
lib/fields.ts                 Strapi attribute → form field, value conversion, zod rules
lib/                          env, session, data access layer, Strapi client, API types
components/ui                 shadcn/ui (Base UI) components
```

## Editing

- Forms are generated from `/api/cms/schema`; a new Strapi field appears automatically. Help text per field lives in `HINTS` in `lib/fields.ts`.
- **Save draft** (⌘S) saves without touching the live site; **Publish** saves then publishes. Required fields are enforced by Strapi on publish, so drafts can be incomplete.
- Components (single and repeatable) and dynamic zones are edited at any depth: `FieldInput` takes a full form path (`sections.2.items.0.title`) and recurses through `ComponentField`, `RepeatableField` and `SectionsField`. `createResolver()` in `lib/fields.ts` supplies component schemas.
- Empty text is saved as `null` (Strapi's required check accepts `""`), so required fields are really enforced on publish.

## Blog

- **Body** (`Description`, a TinyMCE HTML field) uses `components/editor/html-editor.tsx`: a Visual tab (TipTap + images from the media library) and an HTML tab. `lib/html.ts` lists what visual editing would drop (inline styles, image sizes, unknown elements); such posts open in HTML and switching to Visual asks first. Opening never changes the value, and links keep their own `target`/`rel`.
- **Tools panel** (`blog-tools.tsx`): AI summary and text-to-speech (OpenAI / ElevenLabs, background job with progress polling). Pending edits are saved first because the tools read the saved draft. Needs `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` in Strapi's `.env`.
- Fields Strapi's admin hides (`pluginOptions.content-manager.visible: false`, e.g. `audioVariants`, `ttsStatus`) are neither shown nor saved, so a save can't overwrite a running audio job.
- The blog's own document middleware still runs on every CMS save (auto rank, SEO meta image, social thumbnails).

## Preview & autosave

- Pages open in **Form + preview** (switch to Form or Preview in the header). The preview (`components/preview`) renders each section from the form's live values with approximate site styling: desktop/tablet/mobile widths, click a section to jump to its fields. It's not the real site — data the site loads itself (blog posts, "all testimonials", project grid) appears as placeholders.
- **Autosave** (toggle in the header) saves the draft 2.5 s after you stop editing, if the form is valid. Only for types with draft & publish, and only once an entry exists — the live site changes only on Publish.
- "Unsaved changes" compares what would be sent to Strapi with what was last saved (`ChangeTracker` in `entry-editor.tsx`); saves don't reset the form, so typing and focus survive autosaves.

## Page builder

- A page's `sections` (dynamic zone) is a list of collapsible cards: drag the handle (or use ↑/↓) to reorder, duplicate, remove (with confirm), "+ between cards" or **Add section** to insert. Section names/descriptions/icons: `lib/sections.ts`.
- Rich text (`blocks` fields) uses TipTap; `lib/blocks.ts` converts Strapi blocks ⇄ TipTap JSON (paragraphs, headings, lists incl. nested, quotes, code, bold/italic/underline/strike/code, links). Content with anything else (e.g. images) is shown read-only instead of risking data loss.
- Help text for section fields (gradient `*asterisks*`, one-per-line options, "empty = show all") lives in `HINTS` in `lib/fields.ts`.

## Media

- `/media` lists every file in Strapi's media library; the editor's media fields open the same library as a picker, limited to the field's allowed types.
- Uploads go through `app/api/media/upload/route.ts`, which streams the body to Strapi (`proxy.ts` skips that route because it would buffer and cut bodies at 10 MB). Limit: 100 MB; types: JPEG/PNG/WebP/GIF/AVIF, MP4/WebM/MOV, MP3/M4A/WAV/OGG, PDF. SVG is rejected on purpose.
- Locally, `strapi develop` without `AWS_BUCKET` stores uploads in `public/uploads` (see `config/plugins.js`); every other environment uses S3.
- Deleting a file shows how many entries use it first. Deleting removes it from storage for good.

## Activity log

Every create/save/publish/unpublish/discard/delete and media change made through the CMS is recorded in Strapi (`cms-activity`), with repeated saves of one entry merged. Shown on the dashboard (“Recent activity”) and as “Last edited by … · 5 minutes ago” in the editor.

## Tests

- `npm test` — unit tests (Vitest, `tests/`): rich-text conversion, HTML loss detection, form values/validation, activity wording.
- `npm run cms:smoke-test` in the Strapi root — end-to-end checks of `/api/cms/*` against a running Strapi (creates and removes `[smoke]` data).

## Deploying

See [`../docs/cms-deployment.md`](../docs/cms-deployment.md): env vars, Docker/PM2, reverse proxy, staging checks, editor trial.

## Scripts

- `npm run dev` / `build` / `start` — port 3100
- `npm run typecheck`, `npm run lint`, `npm test`
