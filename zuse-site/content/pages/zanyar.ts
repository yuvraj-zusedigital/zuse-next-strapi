/**
 * Built-in content of the Zanyar Outhman page (fallback until the Strapi page
 * has sections; also the source for scripts/cms-seed-pages.js).
 */

import type { PageDefaults } from "@/lib/pages";

export const zanyar: PageDefaults = {
  slug: "zanyar-outhman",
  path: "/zanyar-outhman",
  name: "Zanyar Outhman",
  sections: [
    {
      __component: "sections.profile",
      name: "Zanyar Outhman",
      role: "Founder & Director of Zuse Digital",
      lead: "Zanyar Outhman is one of Australia's most innovative tech entrepreneurs, excelling in technology, design, and AI. As the founder and director of Zuse Digital — an award-winning software agency renowned for delivering AI-powered websites, web apps, and mobile apps with world-class design — Zanyar has redefined digital excellence. He is also the visionary behind Jabri, a digital video interviewing platform that transforms the recruitment process through seamless, user-friendly technology. His expertise has enabled successful collaborations with startups, SMEs, and global organisations to develop intuitive, powerful digital products.",
      image: {
        url: "/images/zanyar/zanyar-outhman-australia-top-50-small-business-leader-2017.webp",
        alt: "Zanyar Outhman, recognized as one of Australia’s Top 50 Small Business Leaders in 2017 by Inside Small Business",
      },
      imageCaption: "Australia’s Top 50 Small Business Leaders in 2017 by Inside Small Business",
      blocks: [
        {
          title: "Achievements & Innovations",
          description:
            "Zanyar's pioneering work in AI-driven digital innovation is highlighted by prestigious accolades, including the Apple Awards and Best UI/UX Design & Development Agency awards. Recognised as one of Australia's Top 50 Small Business Leaders in 2017 by Inside Small Business, his accomplishments underscore a commitment to ethical, innovative, and high-performance digital solutions. His achievements continue to set industry benchmarks and drive transformative change across the digital landscape.",
        },
        {
          title: "Vision & Impact",
          description:
            "Beyond his entrepreneurial ventures, Zanyar champions design excellence as a respected jury member for the Online Design Awards, inspiring the next generation of creative innovators. His dedication to merging advanced technology with outstanding design drives sustainable growth and digital prosperity for both his companies and clients. Zanyar's leadership and vision consistently push boundaries, redefining what it means to achieve digital excellence in a rapidly evolving tech environment.",
        },
      ],
      link: {
        label: "Connect with me on LinkedIn",
        href: "https://www.linkedin.com/in/zanyar/",
        openInNewTab: true,
      },
    },
    {
      __component: "sections.photo-strip",
      images: [
        {
          url: "/images/zanyar/collage-photo-1.webp",
          alt: "Zanyar Outhman collage photo 1",
        },
        {
          url: "/images/zanyar/collage-photo-2.webp",
          alt: "Zanyar Outhman collage photo 2",
        },
        {
          url: "/images/zanyar/collage-photo-3.webp",
          alt: "Zanyar Outhman collage photo 3",
        },
        {
          url: "/images/zanyar/collage-photo-4.webp",
          alt: "Zanyar Outhman collage photo 4",
        },
        {
          url: "/images/zanyar/collage-photo-6.webp",
          alt: "Zanyar Outhman collage photo 6",
        },
        {
          url: "/images/zanyar/collage-photo-7.webp",
          alt: "Zanyar Outhman collage photo 7",
        },
        {
          url: "/images/zanyar/collage-photo-8.webp",
          alt: "Zanyar Outhman collage photo 8",
        },
        {
          url: "/images/zanyar/collage-photo-9.webp",
          alt: "Zanyar Outhman collage photo 9",
        },
      ],
    },
    {
      __component: "sections.quote",
      quote:
        "I believe the human spirit is the greatest force—empowered by meaningful values and purpose-driven work. At Zuse, our vision is to partner with clients to design, build, and deliver exceptional digital products that uplift and empower human potential. We call this Digital Prosperity.",
      cite: "Zanyar Outhman",
      citeImage: {
        url: "/images/zeyed.webp",
        alt: "Zanyar Outhman",
      },
    },
  ],
};
