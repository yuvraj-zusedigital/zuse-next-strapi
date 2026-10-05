/**
 * Built-in content of the About and Awards pages (fallback until the Strapi
 * page has sections; also the source for scripts/cms-seed-pages.js).
 * Awards and testimonials lists without picks show all published entries.
 */

import { md } from "@/lib/blocks";
import type { PageDefaults } from "@/lib/pages";

export const about: PageDefaults = {
  slug: "about",
  path: "/about",
  name: "About",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Tech-driven, Heart-led",
      lead: "We are Zuse Digital — an agency with a decade of experience, rooted in our vision of Digital Prosperity.",
      body: md(`
We fuse our expertise in design, technology, psychology, and AI to deliver measurable business outcomes for both emerging startups and established companies.

Our innovative work has earned industry recognition, including the 2023 and 2024 Best UI/UX Design & Development Agency awards, as well as prestigious accolades from Apple for our exceptional design work. Yet, beyond accolades, we are driven by three core values:

## Proactive Empathy

At the heart of our approach is a deep commitment to understanding your world. By stepping into your experience, we translate insights into strategies that accelerate progress and drive meaningful change.

## Help Others Succeed

We believe extraordinary achievements stem from mutual support and trust. In environments where collaboration and kindness flourish, everyone excels, building a foundation for shared success.

## Trailblazing

We boldly explore uncharted territory with courage and innovation, opening new trails where others haven't ventured. Our passion drives us to push boundaries and continuously test our limits, while smart risk checks and fresh ideas unlock new possibilities and lasting change.

Together, these core values form the foundation of our approach. We strive always to excel in virtue and truth, holding ourselves to a consistent work ethos—never doing to others what we would not do to ourselves.

Founded by ![Zanyar Outhman](/images/zeyed.webp)Zanyar Outhman in 2014, Zuse Digital embodies his deep belief in driving growth through innovative technology, exceptional design, and authentic human connections. This commitment shapes how we interact with one another, serve our clients, and develop our products. We are redefining what it means to build meaningful and lasting digital solutions.
`),
    },
    {
      __component: "sections.awards-list",
      title: "Awards & Recognition",
      lead: "Industry recognition for human-centred design, craft, and products that drive real outcomes.",
      detailed: false,
      awards: [],
    },
    { __component: "sections.author-card", author: null },
  ],
};

export const awards: PageDefaults = {
  slug: "awards",
  path: "/awards-recognition",
  name: "Awards & Recognition",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Awards & Recognition",
      lead: "Zuse Digital is an award-winning digital agency, recognised for our expertise in human-centred design, deep business insight, and cutting-edge technology.",
      body: md(`
We are passionate about driving digital innovation, crafting high-performance, scalable, and conversion-driven solutions that not only elevate user experiences but create measurable success for businesses worldwide.
`),
    },
    { __component: "sections.awards-list", detailed: true, awards: [] },
    {
      __component: "sections.callout",
      title: "Our Commitment to Excellence",
      body: md(`
These awards validate our mission to design, build, and deliver digital products that drive real impact. We take pride in creating solutions that are user-centric, high-performing, and built for long-term success.

These achievements also reflect our leadership, driven by [Zanyar Outhman](/zanyar-outhman).
`),
    },
    { __component: "sections.testimonials", layout: "carousel", testimonials: [] },
  ],
};
