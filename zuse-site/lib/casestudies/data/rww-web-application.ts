import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "web-apps",
  slug: "rww-web-application",
  title: "Rww Group Case Study",
  description: "RWW Group is a family-owned Australian business specialising in custom workwear, uniforms, and PPE solutions. With a focus on safety, consistency, and innovation, RWW delivers full-service apparel management through its national network and tech-enabled platforms. Their mission is to help businesses protect their teams and enhance brand identity through quality, customised uniform solutions.",
  banner: `${CDN_URL}/images/rww-case-banner.jpg`,
  about: "RWW Group is a family-owned Australian business specialising in custom workwear, uniforms, and PPE solutions. With a focus on safety, consistency, and innovation, RWW delivers full-service apparel management through its national network and tech-enabled platforms. Their mission is to help businesses protect their teams and enhance brand identity through quality, customised uniform solutions.",
  meta: [
    {
      label: "Client",
      value: "RWW Group"
    },
    {
      label: "Industry",
      value: "Uniform Supply, Workwear & PPE Solutions"
    },
    {
      label: "Headquarters",
      value: "Leeton, New South Wales, Australia"
    },
    {
      label: "Company Size",
      value: "Medium enterprise with national distribution"
    },
    {
      label: "Audience",
      value: "Medium to large businesses across construction, mining, logistics, and government sectors"
    },
    {
      label: "Website",
      href: "https://www.rwwgroup.com.au/",
      hrefLabel: "www.rwwgroup.com.au",
      value: "www.rwwgroup.com.au"
    },
    {
      label: "Notable Achievements",
      list: [
        "Over 30 years in operation (est. 1993)",
        "Creator of Dataspace – an industry-leading uniform management platform with 99% order accuracy",
        "One of the largest in-house embroidery and printing operations in Australia",
        "Supplier to major organisations including Evolution Mining"
      ]
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Project Summary",
      paragraphs: [
        "RWW Group partnered with Zuse Digital to develop a streamlined ordering platform that could simplify the quote request process for their extensive uniform catalogue. The goal was to allow existing customers to configure garments and submit quote requests in just three steps—despite the complexity of thousands of SKUs, colour options, and branding variables. The solution required more than just a sleek interface—it demanded scalable architecture, precise image rendering capabilities, and an intuitive user flow."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-1.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-1.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Strategy & Execution",
      paragraphs: [
        "We kicked off the project with a Discovery Workshop, aligning stakeholders and mapping the user journey in detail. Our team then designed a modular UI system and built a responsive web application using React, TailwindCSS, and Next.js. Key features included real-time garment previews, colour and logo customisation, and a seamless quoting workflow. The backend was powered by a headless CMS, supported by robust API integrations and a relational database structured for high performance and future growth.",
        "Throughout the process, we used agile sprints, Figma-based prototypes, and iterative testing across all breakpoints. We ensured fast load speeds through a global CDN, prioritised Core Web Vitals, and maintained security through HTTPS and API rate limiting. Extensive QA and feedback loops ensured a polished, scalable final product."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-2.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-2.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "text",
      title: "Key Deliverables",
      bullets: [
        {
          body: "Fully responsive UI/UX design with a 3-step quoting experience"
        },
        {
          body: "Custom frontend and backend development with modular architecture"
        },
        {
          body: "Advanced image rendering for garment colour changes and branding previews"
        },
        {
          body: "Relational database for scalable product catalogue management"
        },
        {
          body: "API integration with headless CMS and dynamic quote system"
        },
        {
          body: "CDN setup for fast global asset delivery"
        },
        {
          body: "Cloud-based infrastructure with CI/CD, monitoring, and backups"
        },
        {
          body: "Cross-device and breakpoint testing for performance and usability"
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-3.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-3.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-4.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-4.webp`,
        alt: "case-study-full-width-img-7",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-5.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-5.webp`,
        alt: "case-study-full-width-img-8",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-6.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-6.webp`,
        alt: "case-study-full-width-img-9",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-7.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-7.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-8.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-8.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-9.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-9.webp`,
        alt: "case-study-full-width-img-9",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-10.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-10.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/rww-case-img-11.jpg`,
        webp: `${CDN_URL}/images/rww-case-img-11.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    }
  ],
  strapiSlug: "casestudy-rww"
};

export default study;
