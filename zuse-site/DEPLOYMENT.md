# Deployment — staging.zusedigital.com (S3 + CloudFront)

Static-export deployment of this Next.js site to Amazon S3 behind CloudFront, matching the
`stagingdev.zusedigital.com` pattern. Includes the SEO isolation that keeps staging out of
search engines with **zero impact on production `zusedigital.com`**.

---

## 0. How SEO isolation works (read this first)

Indexing is gated on one rule in [`lib/config/site.ts`](lib/config/site.ts):

> The site is indexable **only** when its public origin is exactly `https://zusedigital.com`
> (`IS_INDEXABLE`). Every other origin (staging, preview, local) is treated as non-indexable.

Because you build staging with `NEXT_PUBLIC_SITE_URL=https://staging.zusedigital.com`, the build
**automatically** produces:

| Signal | Production build | Staging build |
|---|---|---|
| `robots.txt` | `Allow: /` + `Sitemap:` | `Disallow: /` |
| `sitemap.xml` | 14 URLs | empty |
| `<meta name="robots">` (baked into every page) | `index, follow` | `noindex, nofollow` |

Two runtime-only guards (`X-Robots-Tag` header, Basic Auth) live in [`proxy.ts`](proxy.ts) — but
**`proxy.ts` does not run on static S3/CloudFront hosting**. On static hosting those two guards move
to **CloudFront** (§5). The baked-in `noindex` meta + `robots.txt` above still do the core job.

> **Recommended:** put staging behind **Basic Auth at CloudFront** (§5.3). It's the only hard
> guarantee — crawlers get `401` and can index nothing at all.

---

## 1. Prerequisites

- AWS account with access to S3, CloudFront, and Route 53 (the `zusedigital.com` hosted zone).
- AWS CLI configured locally (`aws configure`).
- An **ACM certificate in `us-east-1`** covering `staging.zusedigital.com` (CloudFront only reads
  certs from `us-east-1`). Request/validate it via DNS before creating the distribution.
- Node 20 (matches local).

---

## 2. Build the static site

`NEXT_PUBLIC_SITE_URL` is **inlined at build time**, so staging and production need **separate
builds** — you cannot reuse one build for both. Static export also disables ISR/`revalidate`, on-demand
image optimization, and `proxy.ts`; content refreshes **only when you rebuild** (same as the old
Gatsby model).

```bash
# from the project root
npm ci

# generate Tailwind CSS (the `build` script does NOT do this on its own)
npm run tailwind:build

# static export with the STAGING origin
STATIC_EXPORT=1 NEXT_PUBLIC_SITE_URL=https://staging.zusedigital.com \
  STRAPI_API_URL=https://stagingadmin.zusedigital.com \
  STRAPI_TOKEN=<staging-strapi-token> \
  NEXT_PUBLIC_STRAPI_API_URL=https://stagingadmin.zusedigital.com \
  npm run build
```

Output lands in `out/`. Verify locally before uploading:

```bash
cat out/robots.txt                    # expect: Disallow: /
grep -c "<loc>" out/sitemap.xml       # expect: 0
grep -o '<meta name="robots"[^>]*>' out/about.html   # expect: noindex, nofollow
```

> **Tip:** add `"prebuild": "npm run tailwind:build"` to `package.json` so `npm run build` always
> regenerates CSS and you can't forget step 2. (Ask and I'll add it.)

---

## 3. S3 bucket

The bucket **`zuse-website-staging-v1`** already exists. Create it only if provisioning fresh
(skip if it exists):

```bash
# aws s3 mb s3://zuse-website-staging-v1 --region ap-southeast-2   # only if it does not exist

# block all public access (CloudFront OAC will read it, not the public)
aws s3api put-public-access-block --bucket zuse-website-staging-v1 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

Upload the export (long-cache hashed assets, short-cache HTML so redeploys show up):

```bash
# hashed, immutable assets
aws s3 sync out/ s3://zuse-website-staging-v1 --delete \
  --exclude "*.html" --exclude "*.txt" --exclude "robots.txt" --exclude "sitemap.xml" \
  --cache-control "public,max-age=31536000,immutable"

# HTML + SEO files: always revalidate
aws s3 sync out/ s3://zuse-website-staging-v1 --delete \
  --exclude "*" --include "*.html" --include "*.txt" \
  --include "robots.txt" --include "sitemap.xml" \
  --cache-control "public,max-age=0,must-revalidate"
```

---

## 4. CloudFront distribution

- **Origin:** the S3 bucket, using **Origin Access Control (OAC)** (not public S3 website hosting).
  CloudFront will add the bucket policy that lets the distribution read the bucket.
- **Viewer protocol policy:** Redirect HTTP → HTTPS.
- **Default root object:** `index.html`.
- **Alternate domain name (CNAME):** `staging.zusedigital.com`.
- **Custom SSL cert:** the `us-east-1` ACM cert from §1.
- **Custom error response:** map `403` and `404` → response page `/404.html`, HTTP code `404`.

### 4.1 Clean URLs (required)

Next static export writes `about.html`, `work.html`, `services/website-design.html`, etc. — not
`about/index.html`. Add a **CloudFront Function** (viewer request) so `/about` serves `/about.html`:

```js
// cloudfront-function: rewrite-clean-urls (viewer request)
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  if (uri === "/" ) return req;                       // root
  if (uri.endsWith("/")) { req.uri = uri + "index.html"; return req; }
  if (!uri.includes(".")) { req.uri = uri + ".html"; } // extensionless -> .html
  return req;
}
```

Attach it to the default cache behavior on **Viewer Request**.

---

## 5. SEO isolation on CloudFront (the part `proxy.ts` can't do statically)

The build already ships `robots.txt` (`Disallow: /`), an empty sitemap, and `noindex` meta.
Add these at CloudFront for defense-in-depth / a hard guarantee.

### 5.1 `X-Robots-Tag: noindex` via a Response Headers Policy

Create a **Response Headers Policy** with a custom header:

```
X-Robots-Tag: noindex, nofollow    (Override: yes)
```

Attach it to the distribution's default behavior. This adds the HTTP-level directive to every
response (covers non-HTML too). **Do NOT attach this policy to the production distribution.**

### 5.2 (optional) Skip the disallow so noindex is honored

`Disallow: /` blocks crawling, which means a crawler can't fetch a page to *see* the `noindex`.
For a brand-new staging subdomain with no inbound links this is fine. If you'd rather guarantee
de-indexing over blocking the crawl, use Basic Auth (§5.3) — that supersedes the question entirely.

### 5.3 Basic Auth via a CloudFront Function (recommended — the hard guarantee)

Password-protect the whole staging distribution so crawlers get `401` and index nothing:

```js
// cloudfront-function: basic-auth (viewer request) — attach BEFORE/with clean-urls
function handler(event) {
  var req = event.request;
  var headers = req.headers;
  // htpasswd-style: echo -n 'user:pass' | base64
  var expected = "Basic " + "dXNlcjpwYXNz"; // replace with your base64 of user:pass
  if (!headers.authorization || headers.authorization.value !== expected) {
    return {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": { value: 'Basic realm="Staging"' },
        "x-robots-tag": { value: "noindex, nofollow" }
      }
    };
  }
  return req;  // then fall through to clean-url rewrite
}
```

Combine the clean-URL rewrite and the auth check into one viewer-request function (auth first,
then rewrite), or chain via a single function. Rotate the credential by editing the function and
re-publishing. **Never attach this to production.**

---

## 6. DNS

In the `zusedigital.com` Route 53 hosted zone, add an **A / AAAA alias** record:

```
staging.zusedigital.com  ALIAS →  <distribution>.cloudfront.net
```

Wait for propagation, then confirm HTTPS resolves.

---

## 7. Redeploy (each update)

```bash
npm run tailwind:build
STATIC_EXPORT=1 NEXT_PUBLIC_SITE_URL=https://staging.zusedigital.com \
  STRAPI_API_URL=https://stagingadmin.zusedigital.com STRAPI_TOKEN=<token> \
  NEXT_PUBLIC_STRAPI_API_URL=https://stagingadmin.zusedigital.com \
  npm run build

aws s3 sync out/ s3://zuse-website-staging-v1 --delete   # (use the two-pass cache-control from §3)
aws cloudfront create-invalidation --distribution-id E25IZEOPLHDDM2 --paths "/*"
```

Because static export is build-time only, **rebuild + redeploy whenever Strapi content changes.**
(Optional: trigger this from a Strapi webhook via CI.)

---

## 8. Post-deploy verification

```bash
# behind Basic Auth (§5.3): no creds -> 401
curl -s -o /dev/null -w "%{http_code}\n" https://staging.zusedigital.com/          # 401

# with creds
curl -s -u user:pass https://staging.zusedigital.com/robots.txt                    # Disallow: /
curl -s -u user:pass -D - -o /dev/null https://staging.zusedigital.com/ | grep -i x-robots-tag
curl -s -u user:pass https://staging.zusedigital.com/about \
  | grep -o '<meta name="robots"[^>]*>'                                            # noindex, nofollow
curl -s -u user:pass https://staging.zusedigital.com/sitemap.xml | grep -c "<loc>" # 0
```

Also: **do not** add staging to Google Search Console, and **do not** submit its sitemap.

---

## 9. Production (`zusedigital.com`) — what differs

Build with the production origin and **no** staging guards:

```bash
npm run tailwind:build
STATIC_EXPORT=1 NEXT_PUBLIC_SITE_URL=https://zusedigital.com \
  STRAPI_API_URL=<prod-strapi> STRAPI_TOKEN=<prod-token> \
  NEXT_PUBLIC_STRAPI_API_URL=<prod-strapi> \
  npm run build
```

This automatically yields `robots.txt` `Allow: /` + sitemap, the 14-URL `sitemap.xml`, and
`index, follow` meta. On the **production** CloudFront distribution: **omit** the `X-Robots-Tag`
Response Headers Policy and the Basic Auth function.

> If production is a Node server instead of static hosting, drop `STATIC_EXPORT=1` and run
> `next start` — then `proxy.ts`, ISR, and image optimization are active and no CloudFront SEO
> config is needed.

---

## 10. Notes / gotchas

- **One build per environment** — `NEXT_PUBLIC_SITE_URL` is compiled in; never promote a staging
  build to production.
- **Tailwind step** — `npm run build` does not run Tailwind; always `npm run tailwind:build` first
  (or add the `prebuild` hook).
- **Secrets** — `STRAPI_TOKEN` is server-only; it's consumed at **build time** for the static
  export, so it only needs to exist in the build/CI environment, never in the uploaded `out/`.
  `.env.development` (which holds a token) is already git-ignored; keep tokens out of committed files
  and rotate any that were shared.
- **Config already in place** — `STATIC_EXPORT` flag in `next.config.ts`, `force-static` on
  `robots.ts`/`sitemap.ts`, and the origin-based `IS_INDEXABLE` gate are committed and verified.
