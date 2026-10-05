/**
 * Built-in content of the Testimonials, Work and Blog pages (fallback until the
 * Strapi page has sections; also the source for scripts/cms-seed-pages.js).
 * These pages keep their own layouts and read their intro and lists from here.
 */

import { SUBSCRIBE_DEFAULTS } from "@/lib/form-defaults";
import type { PageDefaults } from "@/lib/pages";

export const testimonialsPage: PageDefaults = {
  slug: "testimonials",
  path: "/testimonials",
  name: "Testimonials",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Client Testimonials",
      lead: "5-star reviews and real results across websites, software and AI.",
    },
    { __component: "sections.testimonials", layout: "grid", testimonials: [] },
  ],
};

export const workPage: PageDefaults = {
  slug: "work",
  path: "/work",
  name: "Work",
  sections: [
    {
      __component: "sections.page-intro",
      label: "Our Work",
      // Line break, then a non-breaking space before the gradient words (as on the live site).
      title: "Website, App\n&  *AI Case Studies*",
      lead: "See how we design and build websites, web apps, mobile apps and AI solutions that solve real business problems and drive growth.",
    },
    { __component: "sections.work-grid", showFilter: true },
    { __component: "sections.testimonials", layout: "carousel", testimonials: [] },
  ],
};

export const blogPage: PageDefaults = {
  slug: "blogs",
  path: "/blog",
  name: "Blog",
  sections: [{ __component: "sections.page-intro", title: "Insights from *Zuse Digital*" }, SUBSCRIBE_DEFAULTS],
};
