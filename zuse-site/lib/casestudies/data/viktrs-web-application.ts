import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "web-apps",
  slug: "viktrs-web-application",
  title: "Viktrs Case Study",
  description: "Viktrs partnered with Zuse Digital to transform their interactive video concept into a fully functional product. The journey began with a Discovery Workshop, where ideas were refined and visualised through a high-fidelity prototype. This prototype played a critical role in securing investment. Post-funding, Zuse Digital developed a fully responsive web-based platform, ensuring a seamless experience across devices. The project also included a self-serve super admin panel, enabling Viktrs to manage videos, tag products, and track detailed engagement analytics.",
  banner: `${CDN_URL}/images/viktrs-case-banner.jpg`,
  about: "Viktrs partnered with Zuse Digital to transform their interactive video concept into a fully functional product. The journey began with a Discovery Workshop, where ideas were refined and visualised through a high-fidelity prototype. This prototype played a critical role in securing investment. Post-funding, Zuse Digital developed a fully responsive web-based platform, ensuring a seamless experience across devices. The project also included a self-serve super admin panel, enabling Viktrs to manage videos, tag products, and track detailed engagement analytics.",
  meta: [
    {
      label: "Client",
      value: "Viktrs"
    },
    {
      label: "Industry",
      value: "Interactive Media & Video Technology"
    },
    {
      label: "Headquarters",
      value: "London, United Kingdom"
    },
    {
      label: "Company Size",
      value: "Information not publicly disclosed"
    },
    {
      label: "Website",
      href: "https://viktrs.com/",
      hrefLabel: "https://viktrs.com/",
      value: "https://viktrs.com/"
    },
    {
      label: "Notable Achievements",
      value: "Develop a cutting-edge interactive video platform with real-time analytics, a seamless user experience, and a scalable cloud-based infrastructure."
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Key Challenges & Solutions",
      bullets: [
        {
          title: "Mobile Compatibility",
          body: "Ensuring seamless performance across devices with complex animations through real-device testing."
        },
        {
          title: "Real-Time Data Updates",
          body: "Implementing WebSockets for instant content updates across the platform."
        },
        {
          title: "Video Streaming Performance",
          body: "Leveraging a CDN to ensure smooth playback and minimise latency."
        },
        {
          title: "Scalable Tech Stack",
          body: "Utilising ReactJS, NextJS, AWS, and WebSockets for future-proof infrastructure."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-1.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-1.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-2.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-2.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "text",
      title: "Development & Deliverables",
      paragraphs: [
        "The project followed a structured, milestone-based approach with multiple iterations and testing phases to incorporate stakeholder feedback. The final deliverables included:",
        "This transformation positioned Simon West Jewellery as a leading luxury jewellery website, enhancing customer engagement and driving online sales."
      ],
      bullets: [
        {
          body: "Fully developed, mobile-optimised web platform with a seamless UX."
        },
        {
          body: "Self-serve super admin panel for video management, product tagging, and analytics."
        },
        {
          body: "Comprehensive documentation for Viktrs’ internal team."
        },
        {
          body: "Ongoing technical support ensuring performance improvements and feature scalability."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-3.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-3.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Final Outcome",
      paragraphs: [
        "Zuse Digital successfully delivered an industry-first interactive video platform, redefining video engagement with seamless UX, real-time analytics, and integrated product tagging. The platform offers enhanced video monetisation, engagement tracking, and AI-powered insights, bridging content interaction and commerce. The collaboration between Viktrs and Zuse Digital remains ongoing, ensuring continuous innovation."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-4.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-4.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-5.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-5.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-6.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-6.webp`,
        alt: "case-study-full-width-img-7",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-7.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-7.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-8.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-8.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-9.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-9.webp`,
        alt: "case-study-full-width-img-8",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-10.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-10.webp`,
        alt: "case-study-full-width-img-9",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/viktrs-case-img-11.jpg`,
        webp: `${CDN_URL}/images/viktrs-case-img-11.webp`,
        alt: "case-study-full-width-img-10",
        width: 1084,
        height: 610
      }
    }
  ],
  testimonial: {
    name: "Mark Bamford",
    role: "Viktrs",
    avatar: {
      src: `${CDN_URL}/images/testi-block-img-4.jpg`,
      webp: `${CDN_URL}/images/testi-block-img-4.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/viktrs_case_logo.png`,
      webp: `${CDN_URL}/images/viktrs_case_logo.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "Zuse Digital brought our vision to life with purpose-led design and flawless execution. Their work helped us raise funding and laid the foundation for our platform. A true long-term partner.",
    full: [
      "Viktrs is an innovative platform built for a GenZ audience that connects music, storytelling, and commerce. From the very beginning, our goal was to build something purposeful, with the user experience at the centre — and Zuse Digital helped us bring that vision to life.",
      "We engaged Zuse Digital from ideation through to design, development, and the launch of our BETA platform. Their team worked alongside us from day one, running design workshops in London and collaborating closely throughout 2020 to ensure we went live with a polished MVP by December.",
      "Zanyar and his team brought a strategic mindset and deep understanding of our business. Their eye for design and focus on purpose helped us find the perfect balance between building a lean product and delivering a compelling experience. As a result, we were able to successfully raise funding off the back of our BETA.",
      "The Zuse team delivered across all fronts — from the frontend experience to backend portals, dashboards, data insights, and self-service tools for artists. Their work laid the foundation for our product’s DNA and set us up for continued growth.",
      "What stood out most was their passion for what they do, their attention to detail, and their drive to create a product that genuinely connects with its audience. We look forward to continuing our partnership with Zuse Digital and recommend them without hesitation."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-viktrs"
};

export default study;
