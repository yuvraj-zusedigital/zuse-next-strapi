'use strict';

/**
 * Fills "Header & Footer" (api::global.global) with the site's current menus,
 * i.e. what zuse-site shows when Strapi is empty (zuse-site/lib/site-settings.ts).
 *
 *   npm run cms:seed-header-footer              → saves a draft (review it in the CMS, then publish)
 *   npm run cms:seed-header-footer -- --publish → saves and publishes
 *
 * Safe to re-run: images are uploaded once (reused by file name) and the menu
 * lists are replaced, not appended. The logo is left as it is. Each link gets
 * its URL, plus a link to the Page with the same path when one exists (the
 * page wins while it's published; the URL is the fallback).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const ASSETS = path.join(__dirname, 'seed-assets', 'header-footer');
const publish = process.argv.includes('--publish');

const link = (label, href) => ({ label, href });

const MENU = {
  navLinks: [link('Work', '/work'), link('Blog', '/blog'), link('About us', '/about'), link('Testimonials', '/testimonials'), link('Awards', '/awards-recognition')],
  servicesLabel: 'Services',
  serviceLinks: [
    { ...link('AI Agents & Automation', '/services/ai-agents-automation'), description: 'Framework-agnostic agents that\nstreamline operations.', image: 'ai-agent.webp' },
    { ...link('AI Product Development', '/services/ai-product-development'), description: 'AI solutions that automate, optimise\nand scale.', image: 'ai-product.webp' },
    { ...link('Web Application Development', '/services/web-application-development'), description: 'Secure, scalable, high-performance\nweb apps.', image: 'web-application.webp' },
    { ...link('Mobile App Development', '/services/mobile-app-development'), description: 'Award-winning apps with stunning\nUI/UX.', image: 'mobile-application.webp' },
    { ...link('Webdesign & Development', '/services/website-design'), description: 'Connected AI systems for tools and\nworkflows.', image: 'web-design.webp' },
    { ...link('SEO & GEO', '/services/seo-ai-search-optimisation'), description: 'Award-winning apps with stunning\nUI/UX.', image: 'seo.webp' },
  ],
  headerCta: link('Start a Project', '/contact'),
  footerHeading: "Have a project in mind?\nLet's work *together*",
  footerCta: link('Book a Strategy Call', '/contact'),
  footerDescription:
    'Zuse Digital is a human-centred technology company committed to delivering superior Website & Mobile Apps that empower people to achieve their goals.',
  officeTitle: 'Melbourne Office',
  officeAddress: 'Level 3/489 Toorak Rd,\nToorak VIC 3142',
  footerColumns: [
    {
      title: 'Company',
      links: [link('About', '/about'), link('Work', '/work'), link('Blog', '/blog'), link('Testimonials', '/testimonials'), link('Awards', '/awards-recognition'), link('Contact', '/contact')],
    },
    {
      title: 'Services',
      links: [
        link('AI Agents & Automation', '/services/ai-agents-automation'),
        link('AI Product Development', '/services/ai-product-development'),
        link('Website Design', '/services/website-design'),
        link('Web App Development', '/services/web-application-development'),
        link('Mobile App Development', '/services/mobile-app-development'),
        link('SEO & GEO', '/services/seo-ai-search-optimisation'),
      ],
    },
    {
      title: 'Projects',
      links: [
        link('Louis Vuitton', '/casestudies/web-apps/louis-vuitton-web-application'),
        link('Simon West', '/casestudies/e-commerce/simon-west-ecommerce-website'),
        link('RWW', '/casestudies/web-apps/rww-web-application'),
        link('View All', '/work'),
      ],
    },
  ],
  socialLinks: [
    { name: 'Instagram', href: 'https://www.instagram.com/zusedigital/', icon: 'icon-instagram.png' },
    { name: 'Twitter', href: 'https://twitter.com/zusedigital', icon: 'icon-twitter.png' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/zuse-digital/', icon: 'icon-linkedin.png' },
    { name: 'Facebook', href: 'https://www.facebook.com/zusedigital', icon: 'icon-facebook.png' },
    { name: 'Clutch', href: 'https://clutch.co/profile/zuse-digital', icon: 'icon-clutch.png' },
  ],
  legalLinks: [link('Terms of Use', '/terms-of-use'), link('Privacy Policy', '/privacy-policy')],
};

const ALT_TEXT = {
  'ai-agent.webp': 'AI agents and automation preview',
  'ai-product.webp': 'AI product development preview',
  'web-application.webp': 'Web application development preview',
  'mobile-application.webp': 'Mobile app development preview',
  'web-design.webp': 'Website design preview',
  'seo.webp': 'SEO and GEO preview',
};

async function main() {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';

  try {
    const uploads = app.plugin('upload').service('upload');

    /** Media id for a seed asset, uploading it the first time (matched by file name). */
    const media = async (fileName) => {
      const name = `header-footer-${fileName}`;
      const existing = await app.db.query('plugin::upload.file').findOne({ where: { name } });
      if (existing) return existing.id;

      // The upload service expects a temp file like the one a multipart request produces.
      const tmp = path.join(os.tmpdir(), `${Date.now()}-${fileName}`);
      fs.copyFileSync(path.join(ASSETS, fileName), tmp);
      const [file] = await uploads.upload({
        data: { fileInfo: { name, alternativeText: ALT_TEXT[fileName] || name.replace(/\.[a-z]+$/, '') } },
        files: {
          filepath: tmp,
          originalFilename: name,
          mimetype: fileName.endsWith('.webp') ? 'image/webp' : 'image/png',
          size: fs.statSync(tmp).size,
        },
      });
      console.log(`  uploaded ${name}`);
      return file.id;
    };

    // Pages by path, to link menu items to them where they exist.
    const pages = await app.documents('api::page.page').findMany({ status: 'draft', fields: ['documentId', 'path'], limit: 1000 });
    const pageByPath = new Map(pages.filter((page) => page.path).map((page) => [page.path, page.documentId]));
    let linkedToPages = 0;

    const toLink = ({ label, href, description, image }) => {
      const pageId = pageByPath.get(href);
      if (pageId) linkedToPages += 1;
      return {
        label,
        href,
        openInNewTab: false,
        ...(pageId ? { page: pageId } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(image ? { image: image } : {}),
      };
    };

    const serviceLinks = [];
    for (const item of MENU.serviceLinks) serviceLinks.push(toLink({ ...item, image: await media(item.image) }));
    const socialLinks = [];
    for (const item of MENU.socialLinks) socialLinks.push({ name: item.name, href: item.href, icon: await media(item.icon) });

    const data = {
      navLinks: MENU.navLinks.map(toLink),
      servicesLabel: MENU.servicesLabel,
      serviceLinks,
      headerCta: toLink(MENU.headerCta),
      footerHeading: MENU.footerHeading,
      footerCta: toLink(MENU.footerCta),
      footerDescription: MENU.footerDescription,
      officeTitle: MENU.officeTitle,
      officeAddress: MENU.officeAddress,
      footerColumns: MENU.footerColumns.map((column) => ({ title: column.title, links: column.links.map(toLink) })),
      socialLinks,
      legalLinks: MENU.legalLinks.map(toLink),
    };

    const globals = app.documents('api::global.global');
    const existing = await globals.findFirst({ fields: ['documentId'] });
    const saved = existing
      ? await globals.update({ documentId: existing.documentId, data })
      : await globals.create({ data });
    if (publish) await globals.publish({ documentId: saved.documentId });

    // Audit log entry, like a CMS edit (src/api/cms/services/activity.js).
    await app.service('api::cms.activity').record(
      { id: null, email: 'seed-script' },
      { action: publish ? 'publish' : 'update', targetType: 'global', targetId: saved.documentId, title: 'Header & Footer' }
    );

    console.log(
      `Header & Footer filled with the site's current menus (${linkedToPages} link(s) point at existing pages). ${
        publish ? 'Published.' : 'Saved as a draft: review it in the CMS and publish.'
      }`
    );
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
