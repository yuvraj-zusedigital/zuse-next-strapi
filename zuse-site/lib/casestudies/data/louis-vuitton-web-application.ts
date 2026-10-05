import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "web-apps",
  slug: "louis-vuitton-web-application",
  title: "Louis Vuitton Procurement Platform Case Study",
  description: "Louis Vuitton’s digital transformation redefined procurement efficiency by introducing a cloud-based procurement platform. Our modular design system improved usability, brand consistency, and cross-platform accessibility, aligning with LVMH’s procurement goals. The result: higher efficiency, increased adoption, and a scalable foundation for future growth.",
  banner: `${CDN_URL}/lvmh_case_banner_74b5dabfe6.jpg`,
  about: "Louis Vuitton’s digital transformation redefined procurement efficiency by introducing a cloud-based procurement platform. Our modular design system improved usability, brand consistency, and cross-platform accessibility, aligning with LVMH’s procurement goals. The result: higher efficiency, increased adoption, and a scalable foundation for future growth.",
  meta: [
    {
      label: "Client",
      value: "Louis Vuitton Malletier SAS"
    },
    {
      label: "Industry",
      value: "Luxury Fashion & Retail"
    },
    {
      label: "Headquarters",
      value: "Paris, France"
    },
    {
      label: "Company Size",
      value: "10,000+ employees"
    },
    {
      label: "Website",
      href: "https://www.louisvuitton.com/",
      hrefLabel: "www.louisvuitton.com",
      value: "www.louisvuitton.com"
    },
    {
      label: "Notable Achievements",
      value: "Modernise procurement operations by transitioning from a legacy on-premise system to a cloud-based procurement platform with a scalable design system to enhance efficiency and usability across LVMH brands."
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Challenges & Strategic Approach",
      paragraphs: [
        "LVMH, home to 75 luxury brands across six sectors, faced significant procurement challenges. With thousands of unique products and varied procurement workflows, their existing software was clunky, outdated, and inconsistent across brands. The transition to a modern web-based solution required overcoming key obstacles:"
      ],
      bullets: [
        {
          body: "Diverse procurement processes across brands needed standardisation."
        },
        {
          body: "Complex formulas had to be simplified with an intuitive UI."
        },
        {
          body: "User adoption was a priority, ensuring an elegant and efficient experience."
        },
        {
          body: "In-depth stakeholder workshops to align system design with procurement strategies."
        },
        {
          body: "Wireframing, prototyping, and usability testing to refine the user experience."
        },
        {
          body: "A modular design system to maintain consistency while allowing flexibility for future iterations."
        }
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-case-img-1-min.jpg`,
        webp: `${CDN_URL}/images/lvmh-case-img-1-min.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Solution & Deliverables",
      paragraphs: [
        "Zuse Digital partnered with LVMH to create a user-centric procurement platform that reflected the brand’s elegance while improving functionality. Key deliverables included:",
        "The new system simplified navigation, improved procurement accuracy, and enhanced efficiency, directly supporting Louis Vuitton’s digital transformation goals."
      ],
      bullets: [
        {
          body: "Custom UI components optimised for procurement workflows."
        },
        {
          body: "Responsive design for cross-device usability and accessibility."
        },
        {
          body: "Figma prototypes, interactive mockups, and design documentation for development teams."
        },
        {
          body: "Standardised interface across LVMH brands, ensuring clarity and ease of use."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-animation.gif`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 834
      }
    },
    {
      type: "text",
      title: "Key Results & Impact",
      paragraphs: [
        "By modernising Louis Vuitton’s procurement technology, we created a scalable, intuitive system that aligns with the brand’s long-term digital strategy."
      ],
      bullets: [
        {
          body: "70% faster procurement workflows, reducing inefficiencies and errors."
        },
        {
          body: "Higher user adoption, driving engagement and system-wide productivity."
        },
        {
          body: "Enhanced reporting and visibility, improving procurement decisions."
        },
        {
          body: "Positive stakeholder feedback, validating the design system’s success and scalability."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-case-img-3-min.jpg`,
        webp: `${CDN_URL}/images/lvmh-case-img-3-min.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-case-img-4-min.jpg`,
        webp: `${CDN_URL}/images/lvmh-case-img-4-min.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-case-img-5-min.jpg`,
        webp: `${CDN_URL}/images/lvmh-case-img-5-min.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/lvmh-case-img-6-min.jpg`,
        webp: `${CDN_URL}/images/lvmh-case-img-6-min.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    }
  ],
  testimonial: {
    name: "Chris Caldwell",
    role: "HarnessDL",
    avatar: {
      src: `${CDN_URL}/images/chris-caldwell.jpg`,
      webp: `${CDN_URL}/images/chris-caldwell.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/harnessdi.png`,
      webp: `${CDN_URL}/images/harnessdi.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "Great team of experts in application development have used them for multiple projects.",
    full: [
      "Excellent experience working with Zuse Digital - great team of experts in application development have used them for multiple projects.",
      "Their ethos of clean intuitive design and real focus on understanding the requirements right from the get go has always led to an end product myself and the end users have been extremely happy with."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-lvmh"
};

export default study;
