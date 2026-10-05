'use strict';

/**
 * Copies the site's testimonials and awards (scripts/seed-data/*.json, exported
 * from zuse-site/lib/testimonials.ts and lib/awards.ts) into Strapi.
 *
 *   npm run cms:seed-testimonials-awards
 *
 * Safe to re-run; see scripts/lib/seed-helpers.js for the rules (fills only
 * empty fields, never overwrites edits, reuses uploaded images).
 */

const { withStrapi, mediaResolver, upsert } = require('./lib/seed-helpers');

const testimonials = require('./seed-data/testimonials.json');
const awards = require('./seed-data/awards.json');

withStrapi(async (app) => {
  const media = mediaResolver(app);
  const counts = { created: 0, filled: 0, unchanged: 0 };

  for (const [index, item] of testimonials.entries()) {
    const result = await upsert(app, 'api::testimonial.testimonial', {
      filters: { name: item.name },
      populate: { portrait: true, logo: true },
      data: {
        name: item.name,
        company: item.company,
        content: item.paragraphs.join('\n\n'),
        excerpt: item.paragraphs[0],
        portrait: await media(item.portrait, item.portraitAlt),
        logo: await media(item.logo, item.logoAlt),
        logoWidth: item.logoWidth || null,
        logoWidthMobile: item.logoWidthMobile || null,
        rating: 5,
        rank: index + 1,
      },
    });
    counts[result] += 1;
  }
  console.log(`Testimonials: ${counts.created} created, ${counts.filled} filled, ${counts.unchanged} unchanged.`);

  const awardCounts = { created: 0, filled: 0, unchanged: 0 };
  for (const [index, item] of awards.entries()) {
    const extraImages = [];
    for (const image of item.extraImages || []) {
      const id = await media(image.src, image.alt);
      if (id) extraImages.push(id);
    }
    const result = await upsert(app, 'api::award.award', {
      filters: { slug: item.id },
      populate: { image: true, extraImages: true },
      data: {
        title: item.title,
        slug: item.id,
        featuredBy: item.featuredBy,
        summary: item.summary,
        about: item.about,
        reasons: item.reasons.join('\n'),
        image: await media(item.image, item.imageAlt),
        extraImages,
        rank: index + 1,
      },
    });
    awardCounts[result] += 1;
  }
  console.log(`Awards: ${awardCounts.created} created, ${awardCounts.filled} filled, ${awardCounts.unchanged} unchanged.`);
  console.log(`Images: ${media.stats.uploaded} uploaded, ${media.stats.reused} reused.`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
