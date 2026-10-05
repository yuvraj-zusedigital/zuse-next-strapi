'use strict';

/**
 * Opt-in deep populate for page-builder content.
 *
 * `?populate=deep` is replaced with a populate tree built from the schema, so
 * dynamic zones and nested components come back fully populated in one call.
 * Any other `populate` value is left untouched.
 *
 * Route config: { name: 'global::deep-populate', config: { uid: 'api::page.page' } }
 */

const MAX_DEPTH = 6;

function buildPopulate(strapi, uid, depth = 0) {
  const model = strapi.getModel(uid);
  if (!model || depth > MAX_DEPTH) return null;

  const populate = {};

  for (const [name, attribute] of Object.entries(model.attributes)) {
    switch (attribute.type) {
      case 'media':
        populate[name] = true;
        break;
      case 'relation':
        // Skip admin users (createdBy/updatedBy) and i18n bookkeeping.
        if (!attribute.target || attribute.target.startsWith('admin::') || name === 'localizations') break;
        populate[name] = { populate: '*' };
        break;
      case 'component': {
        const nested = buildPopulate(strapi, attribute.component, depth + 1);
        populate[name] = nested ? { populate: nested } : true;
        break;
      }
      case 'dynamiczone':
        populate[name] = {
          on: Object.fromEntries(
            attribute.components.map((component) => [
              component,
              { populate: buildPopulate(strapi, component, depth + 1) || '*' },
            ])
          ),
        };
        break;
      default:
        break;
    }
  }

  // null = nothing to populate below this level.
  return Object.keys(populate).length ? populate : null;
}

module.exports = (config, { strapi }) => {
  let cached;

  return async (ctx, next) => {
    if (ctx.query.populate === 'deep') {
      cached = cached || buildPopulate(strapi, config.uid) || '*';
      ctx.query.populate = cached;
    }
    await next();
  };
};

// Also used by the CMS API (src/api/cms/services/cms.js).
module.exports.buildPopulate = buildPopulate;
