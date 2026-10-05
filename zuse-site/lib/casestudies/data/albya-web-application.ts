import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "web-apps",
  slug: "albya-web-application",
  title: "Kaloni Case Study | Patient Booking Platform Development",
  description: "Kaloni is a premier medical and science centre specialising in aesthetic and regenerative treatments, with a strong emphasis on hair restoration, plastic surgery, medical technology, and regenerative medicine.",
  banner: `${CDN_URL}/images/albya-case-banner.jpg`,
  about: "Kaloni is a premier medical and science centre specialising in aesthetic and regenerative treatments, with a strong emphasis on hair restoration, plastic surgery, medical technology, and regenerative medicine.",
  meta: [
    {
      label: "Client",
      value: "Kaloni"
    },
    {
      label: "Industry",
      value: "Healthcare – Aesthetic and Regenerative Medicine"
    },
    {
      label: "Audience Size",
      value: "Over 50,000 satisfied patients worldwide"
    },
    {
      label: "Headquarters",
      value: "Mexico City, Mexico"
    },
    {
      label: "Company Size",
      value: "201–500 employees"
    },
    {
      label: "Website",
      href: "https://kaloni.com/",
      hrefLabel: "https://kaloni.com",
      value: "https://kaloni.com"
    },
    {
      label: "Notable Achievements",
      list: [
        "Pioneers in long-hair transplant methods",
        "Holds the record for follicle extraction while maintaining donor area care",
        "Recognised for the highest follicle implantation per square centimetre",
        "Offers comprehensive and personalised medical follow-up",
        "Internationally certified medical team with deep expertise"
      ]
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Project Overview: Building a Patient Booking & Management Platform",
      paragraphs: [
        "Kaloni partnered with Zuse Digital, via Albya, to revolutionise its patient booking and management experience. The goal was to develop a secure, scalable mobile and web platform that allowed users to discover services, make real-time bookings, manage personal health records, and access personalised offers—all from a privacy-focused, mobile-first app. This solution modernised how patients interact with healthcare services across Kaloni clinics in Mexico."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-1.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-1.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Strategy & Execution: Mobile-First, Privacy-Focused Healthcare App Development",
      paragraphs: [
        "Zuse Digital adopted a design thinking approach, starting with a discovery workshop to define patient needs and system requirements. Prioritising user experience, privacy, and cross-platform compatibility, the team developed the platform using agile methodology—allowing for regular iterations and improvements.",
        "Key tools included Figma for UI/UX, Jira for sprint management, and AWS for cloud hosting. The outcome was a React Native app for iOS and Android and a robust web-based admin panel for clinics. Core features included real-time appointment scheduling, patient record access, analytics dashboards, and dynamic service offers."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-2.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-2.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Outcome: Scalable, User-Centred Medical Platform",
      paragraphs: [
        "The platform delivered by Zuse Digital has reshaped Kaloni’s digital health offering. Patients now enjoy a seamless, transparent experience that makes booking and managing treatments as intuitive as using a modern consumer platform. Clinics benefit from streamlined operations, enhanced booking efficiency, and secure, data-driven decision-making."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-3.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-3.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-4.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-4.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-5.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-5.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-6.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-6.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-7.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-7.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-8.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-8.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-9.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-9.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-10.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-10.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/albya-case-img-11.jpg`,
        webp: `${CDN_URL}/images/albya-case-img-11.webp`,
        alt: "case-study-full-width-img-7",
        width: 1084,
        height: 610
      }
    }
  ],
  strapiSlug: "case-study-albya-mobile"
};

export default study;
