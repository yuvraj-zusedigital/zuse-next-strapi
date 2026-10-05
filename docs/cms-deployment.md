# Zuse CMS — deployment & rollout runbook

How to put the Zuse CMS (`zuse-cms/`) and its Strapi changes on staging, trial it with editors, then go to production. Plan and background: [nextjs-admin-plan.md](nextjs-admin-plan.md).

## What ships

| Part | Where | Notes |
|---|---|---|
| CMS API | Strapi `src/api/cms` | `/api/cms/*`, CMS roles only (Editor, Admin, Super Admin — `src/api/cms/utils/roles.js`). Roles + permissions are created at boot. |
| Activity log | Strapi `src/api/cms-activity` | New table `cms_activities`, created automatically on first start. Not on the public API. Entries older than a year are pruned at boot. |
| Blog tools (Strapi admin) | Strapi `src/plugins/blog-tools` | Admin-only routes for the blog side panels. The old `auth: false` routes (`/api/blogs/:id/generate-*` etc.) are removed. |
| Rate limits | Strapi `src/middlewares/cms-rate-limit.js` | In memory, per process (fine for one instance). |
| Local uploads in dev | Strapi `config/plugins.js` | Only for `strapi develop` without `AWS_BUCKET`. Staging/production keep S3. |
| CMS app | `zuse-cms/` | Next.js 16. Docker (`zuse-cms/Dockerfile`) or `npm run build && npm start`. |

## 1. Strapi (staging first)

1. Add to the server's env file (`.env.stag` on staging):
   ```
   CMS_PROXY_SECRET=<openssl rand -hex 32 — same value goes to the CMS>
   ```
   Keep `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` if the blog AI summary / audio should work.
2. Deploy this branch as usual (`git pull`, `npm ci`, `npm run build`, restart PM2 — or the Docker image, which now also copies `scripts/`).
3. Check the log for `[cms] Created users-permissions role "Editor"` (first start only) and no errors.
4. **Recommended:** Strapi admin → Settings → Users & Permissions → Advanced settings → turn **off** “Enable sign-ups”. Public registration is on today; the CMS refuses non-editors anyway, but open sign-up lets anyone create accounts. (Check nothing on the site relies on it first.)
5. Create each editor (run on the Strapi server, in the project folder):
   ```
   CMS_EDITOR_EMAIL=jane@zusedigital.com CMS_EDITOR_PASSWORD='…' npm run cms:create-editor
   ```
   An existing users-permissions account with that email is promoted to Editor; add `CMS_EDITOR_RESET_PASSWORD=1` to reset its password.

## 2. CMS app

Hostname: `stagingcms.zusedigital.com` (production `cms.zusedigital.com`) — `stagingadmin`/`admin` already serve Strapi.

Environment:

| Variable | Value |
|---|---|
| `STRAPI_URL` | Strapi's URL as the CMS server reaches it, e.g. `https://stagingstrapi.zusedigital.com` (or an internal URL). No trailing slash. |
| `SESSION_SECRET` | `openssl rand -base64 32` — encrypts the session cookie. Changing it signs everyone out. |
| `CMS_PROXY_SECRET` | Same value as in Strapi. Without it, login rate limits apply to the CMS server as a whole instead of per visitor. |

**Docker:**
```
cd zuse-cms && docker build -t zuse-cms .
docker run -d --name zuse-cms -p 3100:3100 --env-file .env.production zuse-cms
```
**Or Node/PM2:** `cd zuse-cms && npm ci && npm run build && pm2 start npm --name zuse-cms -- start` (port 3100).

Put it behind the existing HTTPS reverse proxy. Requirements:
- **HTTPS only** — the session cookie is `Secure` in production.
- Pass the visitor IP in `X-Forwarded-For` (the CMS forwards it to Strapi for rate limiting).
- Allow request bodies up to **100 MB** on `/api/media/upload` (e.g. nginx `client_max_body_size 100m;`).
- CORS: nothing to add — the browser never calls Strapi directly.

## 3. Verify on staging

1. Smoke test (use a throwaway Editor account; it creates and deletes `[smoke]` entries and one tiny image):
   ```
   STRAPI_URL=https://stagingstrapi.zusedigital.com CMS_EDITOR_EMAIL=… CMS_EDITOR_PASSWORD=… npm run cms:smoke-test
   ```
   Expect `All checks passed.`
2. In the Strapi admin, open a blog post: the “AI Summary” and “Audio Generation” side panels still work (they now use `/blog-tools/...`).
3. Sign in to the CMS, open a page, check the preview, edit + save a draft, and upload an image (lands in S3/CloudFront).

## 4. Editor trial (staging)

Give 1–2 editors a week on staging with a checklist:
- Edit and publish a testimonial/award; unpublish it again.
- Build a page from sections (add, reorder, duplicate, remove) using the preview.
- Edit a blog post in Visual and HTML mode; generate the AI summary and audio.
- Upload/replace images; add alt text.
- Header & Footer: change a link.

Collect feedback; check the dashboard's **Recent activity** matches what they did.

## 5. Production

Repeat 1–3 against production (`cms.zusedigital.com`, new secrets). Then:
- Tell editors to use the CMS; keep Strapi admin access for developers.
- Publishing doesn't refresh the live site automatically (not built — needs a hook in `nextsetup` or the build pipeline); keep the current redeploy/revalidation process.

## Rollback

- CMS: stop the container/PM2 process — nothing else depends on it.
- Strapi: redeploy the previous release. The `cms_activities` table and the CMS roles can stay (unused). Note the previous release has the old unauthenticated blog AI routes.

## Known limits

- Rate limits and the login limiter are in memory: per process, reset on restart. Move to Redis if Strapi runs more than one instance.
- The page preview is approximate (the CMS renders sections itself; see the plan).
- Audio/summary generation needs the OpenAI/ElevenLabs keys in Strapi's env.

## Roles

| | Editor | Admin | Super Admin |
|---|---|---|---|
| Edit content and media, save drafts, publish/unpublish, blog AI tools | ✓ | ✓ | ✓ |
| Delete entries and media files | – | ✓ | ✓ |
| Site settings (Header & Footer, Organization settings) | – | ✓ | ✓ |
| Activity log | – | ✓ | ✓ (one entry's history is shown to everyone in the editor) |
| Users page | – | add and manage Editors | manage everyone |

Enforced by Strapi (`global::cms-role` policy on each route, plus `src/api/cms/services/users.js`); the CMS only hides what a role can't use. Nobody can change their own role or deactivate themselves, and there's always at least one active Super Admin. A deactivated account is signed out on its next request.

The first Super Admin on a new environment is created from the server:

```bash
CMS_EDITOR_EMAIL=you@zusedigital.com CMS_EDITOR_PASSWORD='…' CMS_ROLE=super-admin npm run cms:create-editor
```

For an existing account, leave out the password to change only its role. After that, manage accounts in the CMS under **Users**.

## Working offline locally

A copied database points its media at the production CDN, and the site's own images are on CloudFront. To make a local setup fully offline:

1. **Strapi media:** `npm run cms:localize-cdn-media` downloads every media-library file (and its resized versions) that lives on the CDN into `public/uploads` and points the records at the local copies. It only runs with the local upload provider; SEO structured data keeps its production URLs.
2. **Site images:** in `zuse-site`, `npm run cdn:mirror` downloads every asset the code references into `public/cdn` (git-ignored). Then set `NEXT_PUBLIC_CDN_URL=/cdn` in `zuse-site/.env.local`. Without that setting the site uses CloudFront, as in production (`lib/config/cdn.ts`).

Still online: the Typekit web font and the visitor-country lookup on the contact form.

## Google Search Console in the SEO panel

The SEO panel shows each page's last 28 days from Google Search Console: clicks, impressions, CTR, average position, a daily trend and the top searches (each can be set as the focus keyword with one click). Results are cached for an hour.

1. In Google Cloud: create a project (or reuse one), enable the **Google Search Console API**, and create a **service account**. Add a JSON key to it and download it.
2. In Search Console (the `zusedigital.com` property): **Settings → Users and permissions → Add user**, enter the service account's email (`…@….iam.gserviceaccount.com`), permission **Restricted** (read-only is enough).
3. In the CMS environment: `SEARCH_CONSOLE_CREDENTIALS` = the JSON key (paste as-is or base64-encoded), `SEARCH_CONSOLE_SITE` = the property, e.g. `sc-domain:zusedigital.com` for a domain property or `https://zusedigital.com/` for a URL-prefix property. `SEARCH_CONSOLE_PAGE_ORIGIN` defaults to `https://zusedigital.com`.

Without these the panel shows a "Connect Google Search Console" note. `SEARCH_CONSOLE_DEMO=true` shows sample data (labelled "Demo data") for trying it out. Keep the key secret: it's read on the CMS server only and never sent to the browser.
