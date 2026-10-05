'use strict';

/**
 * Copies the site's case studies into Strapi projects, so they're editable in
 * the CMS:
 *   - scripts/seed-data/case-studies.json (exported from zuse-site/lib/casestudies)
 *     → the project's case-study fields (description, banner, about, details,
 *       content blocks);
 *   - scripts/seed-data/project-tiles.json (the live Work grid) → the project
 *     categories and each project's Work tile (order, size, label, poster, video).
 *
 *   npm run cms:seed-case-studies
 *
 * Projects are matched by slug. Existing projects only get their empty fields
 * filled, so nothing edited in the CMS is overwritten. Safe to re-run; see
 * scripts/lib/seed-helpers.js for the publish rules. The case study's client
 * testimonial is left to the built-in copy until a testimonial is picked on
 * the project.
 */

const { withStrapi, mediaResolver, upsert } = require('./lib/seed-helpers');

const studies = require('./seed-data/case-studies.json');
const { categories, tiles } = require('./seed-data/project-tiles.json');

/** Leaves out fields without a value (Strapi rejects null for some of them). */
const withoutEmpty = (data) => Object.fromEntries(Object.entries(data).filter(([, value]) => value !== null && value !== undefined));

const paragraphs = (texts = []) => texts.map((text) => ({ type: 'paragraph', children: [{ type: 'text', text }] }));

async function blocksFor(study, media) {
  const out = [];
  for (const block of study.blocks) {
    if (block.type === 'text') {
      out.push({
        __component: 'case-study.text-block',
        title: block.title || null,
        body: block.paragraphs && block.paragraphs.length ? paragraphs(block.paragraphs) : null,
        bullets: (block.bullets || []).map((bullet) => ({ title: bullet.title || null, description: bullet.body })),
        bulletColumns: block.bulletColumns === 2 ? 'two' : 'one',
      });
    } else if (block.type === 'image') {
      out.push({ __component: 'case-study.image-block', image: await media(block.image.src, block.image.alt) });
    } else if (block.type === 'imageGrid') {
      const images = [];
      for (const image of block.images) {
        const id = await media(image.src, image.alt);
        if (id) images.push(id);
      }
      out.push({ __component: 'case-study.image-pair', images });
    }
  }
  return out;
}

withStrapi(async (app) => {
  const media = mediaResolver(app);

  const categoryIds = {};
  for (const category of categories) {
    await upsert(app, 'api::project-category.project-category', {
      filters: { slug: category.slug },
      data: { Name: category.Name, slug: category.slug, rank: category.rank },
    });
    const saved = await app.documents('api::project-category.project-category').findFirst({ status: 'draft', filters: { slug: category.slug } });
    categoryIds[category.slug] = saved.documentId;
  }
  console.log(`Categories: ${categories.map((category) => category.Name).join(', ')}`);

  const counts = { created: 0, filled: 0, unchanged: 0 };
  for (const study of studies) {
    const tile = tiles.find((item) => item.slug === study.slug) || {};
    const result = await upsert(app, 'api::project.project', {
      filters: { slug: study.slug },
      populate: { Slider: true, project_categories: true, CaseStudyBanner: true, CaseStudyMeta: true, CaseStudyBlocks: true },
      data: withoutEmpty({
        // Short name on the Work tile; the case study page's heading is CaseStudyTitle.
        Title: tile.title || study.title,
        slug: study.slug,
        sub_title: tile.label || null,
        project_details_path: `/casestudies/${study.category}/${study.slug}/`,
        select_type: tile.video ? 'Video' : 'Image',
        GirdStyle: tile.gridStyle || 'HalfWidth',
        rank: tile.rank || null,
        is_coming_soon: false,
        Slider: [
          {
            __component: 'slider.slider',
            select_media: await media(tile.poster || study.banner, study.title),
            Videomp4: tile.video ? await media(tile.video) : null,
          },
        ],
        project_categories: categoryIds[study.category] ? [categoryIds[study.category]] : [],
        CaseStudyTitle: study.title,
        CaseStudyDescription: study.description,
        CaseStudyBanner: await media(study.banner, study.title),
        CaseStudyAbout: study.about,
        CaseStudyMeta: study.meta.map((field) => ({
          label: field.label,
          // Lists are one item per line (docs/page-builder.md).
          value: field.list ? field.list.join('\n') : field.value || null,
          href: field.href || null,
          hrefLabel: field.hrefLabel || null,
        })),
        CaseStudyBlocks: await blocksFor(study, media),
      }),
    });
    counts[result] += 1;
    console.log(`  ${study.slug}: ${result}`);
  }

  console.log(`Case studies: ${counts.created} created, ${counts.filled} filled, ${counts.unchanged} unchanged.`);
  console.log(`Media: ${media.stats.uploaded} uploaded, ${media.stats.reused} reused.`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
