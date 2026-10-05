# Page builder content model

Content model that lets the Next.js frontend (`nextsetup`) render pages from Strapi.

## Fetching

Add `populate=deep` to fetch a whole page tree (dynamic zones, nested components, relations) in one request:

```
GET /api/pages?filters[path][$eq]=/services/website-design&populate=deep
GET /api/global?populate=deep
GET /api/projects?filters[slug][$eq]=komodo-websites&populate=deep
```

Any other `populate` value behaves exactly as before (`src/middlewares/deep-populate.js`).

## Content types

| Type | Purpose |
|---|---|
| `page` | New `path` (URL, e.g. `/services/website-design`, `/` for home) and `sections` dynamic zone. `slug` is kept for existing SEO lookups. |
| `project` | New optional case-study fields: `CaseStudyDescription`, `CaseStudyBanner`, `CaseStudyAbout`, `CaseStudyMeta`, `CaseStudyBlocks`, `testimonial`. |
| `testimonial` | Replaces `lib/testimonials.ts` and inline testimonial arrays. |
| `award` | Replaces `lib/awards.ts`. |
| `global` ("Header & Footer") | Nav links, service links, footer columns, social links, office address. |

## Sections → frontend components

| Section | Replaces |
|---|---|
| `hero` | `home/Hero` |
| `logo-strip` | `home/Logos` |
| `badge-grid` | `home/Stats` |
| `manifesto` | `home/Manifesto` |
| `services-grid` | `home/Services` (`diagram` picks the animated diagram) |
| `featured-work` | `home/DigitalProducts` |
| `process-stages` | `home/Process` |
| `industries` | `home/Leaders` (gradients derived from `color`) |
| `testimonials` | `home/Testimonials`, testimonials page (`layout: grid`) |
| `blog-feed` | `home/Blog` |
| `page-intro` | `content/MarketingPage` title/lead/body |
| `service-offerings` | `services/*OurServices` |
| `process-steps` | `services/*Process` (connector graphics chosen by step index) |
| `bullet-grid` | `services/*InfoSections`, `WebsiteDesignTools` |
| `bullet-groups` | Mobile "Technologies We Use" |
| `case-study-cards` | `services/ServiceBannerCases` |
| `rich-text` | Legal pages, about body |
| `faq` | Contact page FAQs |
| `awards-list` | Awards page (`detailed`), About's compact list (`title`, `lead`) |
| `callout` | Awards "Our Commitment to Excellence" |
| `author-card` | About's founder card (empty `author` = the built-in Zanyar card) |
| `work-grid` | Work page project grid |
| `contact-form` | `contact/ContactExperience` form |
| `profile` | Zanyar Outhman page (bio, portrait, LinkedIn link) |
| `testimonial-slider` | Contact page's rotating quotes (its own quotes, photos and roles) |
| `photo-strip` | Zanyar page's scrolling photo collage |
| `quote` | Zanyar page's closing quote |

## Editor conventions

- **Gradient text:** in section titles, wrap words in asterisks — `How *Zuse Digital* Can Serve You`. A line break in the field renders as `<br />`.
- **One per line:** `award.reasons`, `contact-form.*Options`, and `case-study.meta-field.value` (when it is a list) take one item per line.
- **Paragraphs:** `testimonial.content` separates paragraphs with a blank line.
- **Tags:** `work-card.tags` is comma separated (`Web App, UI UX Design`).
- **Empty relation = all:** `testimonials.testimonials` and `awards-list.awards` show every published entry, ordered by `rank`, when left empty.

## Header & footer menus

Edited in the CMS under **Header & Footer** (`api::global.global`). The site copy in `zuse-site/` renders them (`lib/site-settings.ts`, `components/Header.tsx`, `components/Footer.tsx`); the original `nextsetup` is unchanged.

- **Links** (`elements.link`, used by nav links, CTAs, footer columns, legal links and section buttons) have a **Page** picker and a **URL** field. The page's `path` wins, so links follow a page when its path changes; the URL is for external links and anchors. A link to an unpublished or deleted page falls back to its URL, or is left out if it has none.
- **Services dropdown** uses `elements.menu-item`: label, page/URL, a short description (line breaks kept) and a preview image. Its button text is `servicesLabel`.
- **Footer heading** supports the `*gradient*` convention; the office address keeps line breaks.
- **Hiding parts:** every link, menu item, footer column and social icon — and the header/footer buttons — has an eye button in the CMS; the switches *Hide services menu*, *Hide footer call to action* (the “Have a project in mind?” band), *Hide footer description*, *Hide office* and *Hide social links* switch off whole blocks. Hidden parts stay in the CMS; a list whose items are all hidden shows nothing (it doesn't fall back to the built-in list). Publish to apply. The eye button on buttons inside sections (hero, manifesto, featured work, profile) works the same way.
- **Fallbacks:** any list or text left empty — or Strapi being unreachable — uses the site's built-in header/footer, so the menus are never blank. A non-empty list replaces the built-in one entirely.
- The site fetches only what it needs: `GET /api/global?populate[navLinks][populate][page][fields][0]=path&…` (see `POPULATE` in `lib/site-settings.ts`). The site's read-only API token covers it; with the Public role instead, grant `find` on Header & Footer and Page.

## Pages rendered from sections (zuse-site)

Every page renders its Strapi page's `sections` **in CMS order** through one renderer (`RenderSections` in `zuse-site/components/sections/SectionsPage.tsx`), so sections can be added, removed and reordered on any page and every section type works everywhere. A page with no published sections (or Strapi unreachable) uses its built-in content from `zuse-site/content/pages/*.ts`.

| Route | Slug | Notes |
|---|---|---|
| `/` | `home` | |
| `/about`, `/awards-recognition`, `/services/*` | `about`, `awards`, `service-*` | long-form layout |
| `/privacy-policy`, `/terms-of-use` | `privacy-policy`, `terms-of-use` | legal layout: the rich text is split into sections at each `##` heading |
| `/contact`, `/thank-you` | `contact` | the contact form shows the page's quote slider beside it; on Thank-you it shows its thank-you text |
| `/work`, `/casestudies/<category>` | `work` | category pages preselect that category in the work grid |
| `/testimonials` | `testimonials` | |
| `/blog` | `blogs` | title + article grid; any other sections show below the grid |
| `/zanyar-outhman` | `zanyar-outhman` | |
| any other path | (the page's `path`) | pages created in the CMS, served by `app/[...path]` and listed in the sitemap |

- **Hide a section** with the eye button on its card: it stays in the CMS (and in the preview, faded) but isn't shown on the site. The same works for case-study blocks. Switch it back on and publish to show it again.
- **Page intro** is the one section that looks different per page: the long-form heading (default), the Work heading (with `label`) or the Testimonials banner.
- **Layout:** consecutive content sections (offerings, process, bullet grids, detailed awards, callout) share the wide container; compact awards and author cards share the narrow one; everything else (hero, testimonials, contact form, work grid…) runs edge to edge.
- **New pages:** create a page with a `path` (e.g. `/careers`) and publish it. Pages starting with a page intro or rich text get the long-form spacing; others (e.g. starting with a hero) run edge to edge.
- **Inline portrait:** in rich text, `![Zanyar Outhman](/images/zeyed.webp)` inside a sentence renders the small round image.
- **SEO** (meta, JSON-LD) comes from the page's `seo` component, with each route's built-in fallbacks.
- **Seeding:** `npm run cms:seed-pages` creates the pages from `scripts/seed-data/pages.json` (or fills empty `sections`/`path`; never overwrites edits). Refresh that file with `npx tsx scripts/export-seed-pages.ts` in `zuse-site`.

## Case studies

`/casestudies/<category>/<slug>` pages read the **project** whose `project_details_path` is that path: `CaseStudyTitle` (page heading; `Title` is the short Work-grid name), `CaseStudyDescription`, `CaseStudyBanner`, `CaseStudyAbout`, `CaseStudyMeta` (a value with several lines is a list) and `CaseStudyBlocks` (text with bullets, full-width image, image pair). Anything left empty falls back to the built-in data in `zuse-site/lib/casestudies/data`; the client quote stays built-in until a `testimonial` is picked. New projects with a case-study path get a page automatically. The Work grid tile uses `Title`, `sub_title` (empty = the project's category names), `GirdStyle`, `rank` and the first `Slider` item (poster image + optional hover video). Categories (Project Category) are ordered by `rank` everywhere: the Work filter and the "other categories" sections under each category page.

`npm run cms:seed-case-studies` creates the four project categories and the 11 case studies (from `scripts/seed-data/case-studies.json`, exported with `npx tsx scripts/export-seed-case-studies.ts` in `zuse-site`, and `project-tiles.json`, taken from the live Work grid); existing projects only get empty fields filled.

## When changes show on the site

- **Local development:** on the next reload (the site doesn't cache Strapi data in dev).
- **Staging/production:** the site caches Strapi data for up to 60 s, but Strapi tells it to refresh whenever something is published, unpublished or deleted (and on media edits). Set `SITE_REVALIDATE_URL` (the site's `/api/revalidate`; comma-separate several sites) and `SITE_REVALIDATE_SECRET` in Strapi, and the same secret as `REVALIDATE_SECRET` in the site. Draft saves don't change the live site — publish to see them.
