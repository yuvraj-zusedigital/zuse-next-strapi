/**
 * Built-in content of the home page (fallback until the Strapi page has
 * sections; also the source for scripts/cms-seed-pages.js).
 */

import { CDN_URL } from "@/lib/config/cdn";
import type { PageDefaults } from "@/lib/pages";

export const home: PageDefaults = {
  slug: "home",
  path: "/",
  name: "Home",
  sections: [
    {
      __component: "sections.hero",
      label: "Australian Website Design,\n Software Development & AI Agency",
      labelIcon: {
        url: "/images/au.png",
        alt: "",
        width: 20,
        height: 14,
      },
      title: "Design × Intelligence.\n *Built for Growth.*",
      description: "We turn complex ideas into websites and digital products people love to use and businesses rely on to grow.",
      primaryCta: {
        label: "Book a Strategy Call",
        href: "/contact",
        variant: "primary",
      },
      secondaryCta: {
        label: "See our Work",
        href: "/work",
        variant: "secondary",
      },
      backgroundImage: {
        url: "/images/herobg.webp",
        alt: "Zuse Digital",
        width: 1224,
        height: 1400,
      },
    },
    {
      __component: "sections.logo-strip",
      headingBefore: "Working with ambitious",
      headingHighlight: "founders",
      headingAfter: "and modern companies",
      avatarImage: {
        url: "/images/zusa-logo-avtar-group.webp",
        alt: "zuse-digital-logos-avatar",
        width: 46,
        height: 20,
      },
      logos: [
        {
          url: `${CDN_URL}/images/lvmh_webapp_by_zusedigital.png`,
          alt: "Louis Vuitton WebApp by ZuseDigital",
          width: 116,
          height: 40,
        },
        {
          url: `${CDN_URL}/images/jabri_webapp_and_webportal_by_zusedigital.png`,
          alt: "Jabri WebApp and Web Portal by ZuseDigital",
          width: 56,
          height: 40,
        },
        {
          url: `${CDN_URL}/images/afl_mobileapp_by_zusedigital.png`,
          alt: "AFL MobileApp by ZuseDigital",
          width: 129,
          height: 43,
        },
        {
          url: `${CDN_URL}/images/viktrs_webapp_and_webportal_by_zusedigital.png`,
          alt: "Viktrs WebApp and WebPortal by ZuseDigital",
          width: 84,
          height: 48,
        },
      ],
    },
    {
      __component: "sections.badge-grid",
      badges: [
        {
          url: "/images/awwards/12-building-products-v2.svg",
          alt: "12 Building Products",
          width: 210,
          height: 140,
        },
        {
          url: "/images/awwards/apple-app-recognised-v2.svg",
          alt: "Apple App Recognised",
          width: 210,
          height: 140,
        },
        {
          url: "/images/awwards/lvmh-trusted-by-v2.svg",
          alt: "LVMH Trusted by",
          width: 210,
          height: 140,
        },
        {
          url: "/images/awwards/awwwards-client-awarded-v2.svg",
          alt: "Awwwards Client Awarded",
          width: 210,
          height: 140,
        },
        {
          url: "/images/awwards/5-star-client-reviews-v2.svg",
          alt: "5 Star Client Reviews",
          width: 210,
          height: 140,
        },
      ],
    },
    {
      __component: "sections.manifesto",
      paragraphs: [
        {
          textBefore: "Founded in 2014 and led by",
          inlineImage: {
            url: "/images/zeyed.webp",
            alt: "Zanyar Outhman",
            width: 34,
            height: 34,
          },
          textAfter:
            "Zanyar, we've partnered with startups, SMEs and global organisations to create award-winning digital products few others can make, and anyone can use.",
        },
        {
          textBefore: "A great digital product",
          inlineImage: {
            url: "/images/lv-afl.webp",
            alt: "AFL MobileApp by ZuseDigital and Louis Vuitton WebApp by ZuseDigital",
            width: 68,
            height: 34,
          },
          textAfter:
            "has to do more than work. It has to rank, convert, scale, be easy to use and work with AI and agents only where they genuinely add value.",
        },
        {
          textBefore: "We bring everything together from the start, using our combined experience to spot opportunities others miss.",
        },
        {
          textBefore: "One belief has guided Zuse from the beginning: to inspire and nurture the human spirit.",
        },
      ],
      cta: {
        label: "About us",
        href: "/about",
        variant: "secondary",
      },
    },
    {
      __component: "sections.services-grid",
      title: "How *Zuse Digital*\nCan Serve You",
      description:
        "We build fast, scalable, and conversion-driven web, mobile, and AI apps as well as websites, all designed to transform businesses and enhance user experiences through product alignment and grounded user journey mapping.",
      cards: [
        {
          title: "AI Agents & Automation",
          description:
            "We build framework-agnostic AI agents to streamline operations\nso your team can focus on their most impactful work.",
          href: "/services/ai-agents-automation",
          backgroundImage: {
            url: "/images/service/aigents-bg.svg",
            alt: "",
          },
          diagram: "ai-agents",
        },
        {
          title: "AI Product Development",
          description: "We develop AI-powered solutions that\nautomate, optimise, and scale businesses.",
          href: "/services/ai-product-development",
          backgroundImage: {
            url: "/images/service/aiproduct-bg.svg",
            alt: "",
          },
          diagram: "ai-product",
        },
        {
          title: "SEO & AI Search \n Optimisation",
          description:
            "Get found where people search today, from Google\nand AI Overviews to ChatGPT, Gemini and\nPerplexity, with SEO built for both rankings and AI\nvisibility.",
          href: "/services/seo-ai-search-optimisation",
          backgroundImage: {
            url: "/images/seo/seo-bgsvg.svg",
            alt: "",
          },
          diagram: "seo",
        },
        {
          title: "Web Application Development",
          description: "We build secure, scalable, and high-performance web apps for business growth.",
          href: "/services/web-application-development",
          backgroundImage: {
            url: "/images/service/webapplication-bg.svg",
            alt: "",
          },
          diagram: "web-application",
        },
        {
          title: "Mobile App\nDevelopment",
          description: "We build award-winning, high-performance\nmobile apps with stunning UI/UX at a\ncompetitive investment.",
          href: "/services/mobile-app-development",
          backgroundImage: {
            url: "/images/service/mobile-application-bg.svg",
            alt: "",
          },
          diagram: "mobile-app",
        },
        {
          title: "Webdesign &\nDevelopment",
          description: "Automate tools, tasks and team\nworkflows with connected AI systems.",
          href: "/services/website-design",
          backgroundImage: {
            url: "/images/service/webdesign-bg.svg",
            alt: "",
          },
          diagram: "web-design",
        },
      ],
    },
    {
      __component: "sections.featured-work",
      title: "Explore our premium\n*digital products*",
      cards: [
        {
          title: "Komodo",
          tags: "Website Design, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/warnie-mojis.jpg",
            alt: "Komodo",
          },
          video: {
            url: `${CDN_URL}/videos/komodo-website-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/websites/komodo-websites/",
          size: "small",
        },
        {
          title: "Louis Vuitton",
          tags: "Web App, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/louis-vuitton.jpg",
            alt: "Louis Vuitton",
          },
          video: {
            url: `${CDN_URL}/videos/lvmh-web-app-portal-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/web-apps/louis-vuitton-web-application/",
          size: "large",
        },
        {
          title: "Viktrs",
          tags: "Web App, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/vikrs.jpg",
            alt: "Viktrs",
          },
          video: {
            url: `${CDN_URL}/videos/viktrs-web-app-portal-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/web-apps/viktrs-web-application/",
          size: "large",
        },
        {
          title: "Simon West",
          tags: "eCommerce, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/simon-west.jpg",
            alt: "Simon West",
          },
          video: {
            url: `${CDN_URL}/videos/simon-west-website-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/e-commerce/simon-west-ecommerce-website/",
          size: "small",
        },
        {
          title: "AFL Players Moji",
          tags: "Mobile App, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/afl-players-moji.jpg",
            alt: "AFL Players Moji",
          },
          video: {
            url: `${CDN_URL}/videos/afl-mobile-app-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/mobile-apps/afl-players-moji-mobile-application/",
          size: "small",
        },
        {
          title: "Runway",
          tags: "Website Design, UI UX Design",
          description: "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
          image: {
            url: "/images/digital-product/runway.jpg",
            alt: "Runway",
          },
          video: {
            url: `${CDN_URL}/videos/runway-website-design-case-study-by-zusedigital.mp4`,
            alt: "",
          },
          href: "/casestudies/websites/runway-websites/",
          size: "large",
        },
      ],
      cta: {
        label: "Explore all projects",
        href: "/work",
        variant: "secondary",
      },
    },
    {
      __component: "sections.process-stages",
      title: "Our Website, App & AI *Development Process*",
      stages: [
        {
          title: "AI Discovery & Opportunity Mapping",
          shortTitle: "AI Discovery",
          body: "We uncover your goals, users and the right digital opportunities.",
        },
        {
          title: "Strategy & Solution Definition",
          shortTitle: "Strategy",
          body: "We turn discovery into a clear roadmap from idea to outcome.",
        },
        {
          title: "UX/UI Design & Prototyping",
          shortTitle: "UX/UI Design",
          body: "We prototype experiences that bring your digital product to life early.",
        },
        {
          title: "Development & AI Integration",
          shortTitle: "Development",
          body: "We build and integrate websites, apps and AI systems ready for real use.",
        },
        {
          title: "Launch, Learn & AI Optimise",
          shortTitle: "Optimise",
          body: "We test, analyse and improve performance after launch.",
        },
      ],
    },
    {
      __component: "sections.industries",
      title: "Recognised by *Industry*\n*Leaders* Designed for Impact.",
      description:
        "At the heart of Zuse Digital is a passion for empathetic experiences built with trailblazing technology. Explore the premium websites, apps and digital products we've created for growing brands of all sizes.",
      items: [
        {
          title: "Healthcare",
          copy: "Work with a top app developer to create custom solutions with the ability to integrate with blockchain and AI.",
          imageDesktop: {
            url: "/images/leader/healthcare.jpg",
            alt: "Healthcare",
          },
          imageMobile: {
            url: "/images/leader/healthcare-mobile.webp",
            alt: "Healthcare",
          },
          color: "#030821",
        },
        {
          title: "Retail",
          copy: "Empower your retail business with seamless e-commerce integrations and AI-driven customer insights.",
          imageDesktop: {
            url: "/images/leader/retail.webp",
            alt: "Retail",
          },
          imageMobile: {
            url: "/images/leader/retail-mobile.webp",
            alt: "Retail",
          },
          color: "#124AB9",
        },
        {
          title: "Property",
          copy: "Transform real estate experiences with immersive virtual tours and smart property management systems.",
          imageDesktop: {
            url: "/images/leader/property.jpg",
            alt: "Property",
          },
          imageMobile: {
            url: "/images/leader/property-mobile.webp",
            alt: "Property",
          },
          color: "#9F54FF",
        },
        {
          title: "Hospitality",
          copy: "Restaurant or cafe, we can build with you a mobile app, digital solution for reservations or another product fit for your business.",
          imageDesktop: {
            url: "/images/leader/hospitality.jpg",
            alt: "Hospitality",
          },
          imageMobile: {
            url: "/images/leader/hospitality-mobile.webp",
            alt: "Hospitality",
          },
          color: "#46A5FF",
        },
      ],
    },
    {
      __component: "sections.testimonials",
      layout: "carousel",
      testimonials: [],
    },
    {
      __component: "sections.blog-feed",
      title: "From the *Blog*",
      limit: 4,
      featuredOnly: true,
    },
  ],
};
