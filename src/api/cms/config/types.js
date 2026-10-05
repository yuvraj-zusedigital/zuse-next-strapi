'use strict';

/**
 * Content types the Zuse CMS (./zuse-cms) may read and edit, keyed by the slug
 * used in /api/cms/:type URLs. Anything not listed here is unreachable through
 * the CMS API — add a type deliberately.
 *
 * mainField: the attribute used as the entry's title in lists and for search.
 */
module.exports = {
  page: { uid: 'api::page.page', mainField: 'Name' },
  project: { uid: 'api::project.project', mainField: 'Title' },
  blog: { uid: 'api::blog.blog', mainField: 'Title' },
  testimonial: { uid: 'api::testimonial.testimonial', mainField: 'name' },
  award: { uid: 'api::award.award', mainField: 'title' },
  author: { uid: 'api::author.author', mainField: 'Name' },
  'project-category': { uid: 'api::project-category.project-category', mainField: 'Name' },
  global: { uid: 'api::global.global', mainField: null },
  'organization-setting': { uid: 'api::organization-setting.organization-setting', mainField: null },
  // Listed under Site settings (Admins) rather than Content.
  'text-snippet': { uid: 'api::text-snippet.text-snippet', mainField: 'name', group: 'settings' },
};
