import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "websites",
  slug: "runway-websites",
  title: "Runway Case Study",
  description: "Runway is a modern branding platform built to empower global talent with professionally designed, ready-to-launch personal websites. It offers a simple, streamlined experience for creators to build their online identity, combining visual polish with back-end scalability. By removing the friction of custom web design, Runway helps individuals go live faster, look sharper, and grow their audience with confidence.",
  banner: `${CDN_URL}/runway_case_banner_b84f7d1064.jpg`,
  about: "Runway is a modern branding platform built to empower global talent with professionally designed, ready-to-launch personal websites. It offers a simple, streamlined experience for creators to build their online identity, combining visual polish with back-end scalability. By removing the friction of custom web design, Runway helps individuals go live faster, look sharper, and grow their audience with confidence.",
  meta: [
    {
      label: "Client",
      value: "Runway"
    },
    {
      label: "Industry",
      value: "Personal Branding / Talent Platforms"
    },
    {
      label: "Audience Size",
      value: "Global audience of creators, influencers, and public figures"
    },
    {
      label: "Headquarters",
      value: "Ringwood, Hampshire, United Kingdom"
    },
    {
      label: "Company Size",
      value: "Mid-sized team, operated under Komodo Media Limited"
    },
    {
      label: "Website",
      href: "https://madewithrunway.com/",
      hrefLabel: "madewithrunway.com",
      value: "madewithrunway.com"
    },
    {
      label: "Notable Achievements",
      list: [
        "Launched a scalable platform tailored for talent-led personal branding",
        "Backed by Komodo, a global leader in influencer marketing and social talent",
        "Used by top-tier creators to launch custom digital identities with ease"
      ]
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Introduction: Building a Brand from the Ground Up",
      paragraphs: [
        "Runway approached Zuse Digital to create an entirely new brand and digital platform tailored to global talent. This was not a redesign, but a brand-new website project—from branding and UX strategy to content architecture and website development. The goal was to help creators and influencers launch beautifully branded personal websites with zero hassle."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-1.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-1.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-2.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-2.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    },
    {
      type: "text",
      title: "Objective: Launch a Frictionless Personal Branding Platform",
      paragraphs: [
        "Our mission was to build a sleek, user-friendly, and conversion-focused website that embodied Runway’s promise of simplicity and style. This included crafting a distinct brand identity, optimising mobile UX, and ensuring scalability for a growing user base of talent-led creators."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-3.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-3.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Approach: Brand Creation Meets Scalable UX",
      paragraphs: [
        "Zuse led the full creative and technical direction, combining our Website Design, UX, and Branding services. Starting from a blank canvas, we facilitated workshops to define Runway’s tone, audience, and visual direction. A mobile-first design system was developed alongside an intuitive content model, ensuring a seamless experience for both users and the internal team managing the platform."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-4.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-4.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "text",
      title: "Process: Strategy to Launch",
      bullets: [
        {
          title: "Discovery & Brand Definition",
          body: "Strategy sessions to define brand values, visual direction, and key messaging."
        },
        {
          title: "UX & Architecture",
          body: "User journey mapping, wireframes, and an intuitive content hierarchy."
        },
        {
          title: "UI Design & Visual Identity",
          body: "Custom logo, typography, palette, and UI components."
        },
        {
          title: "Development",
          body: "Mobile-first, SEO-optimised site built with a headless CMS for easy updates."
        },
        {
          title: "Testing & Launch",
          body: "Rigorous QA, performance optimisation, and smooth deployment."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-5.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-5.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "text",
      title: "Deliverables: Complete Brand + Web Experience",
      bullets: [
        {
          title: "Custom Brand Identity",
          body: "Logo, palette, typography, and visual language"
        },
        {
          title: "UX Strategy & Wireframes",
          body: "Clear content flow and page layouts"
        },
        {
          title: "Responsive Web Design",
          body: "Mobile-first, fast-loading user experience"
        },
        {
          title: "Headless CMS Integration",
          body: "Flexible, scalable, and easy to manage"
        },
        {
          title: "SEO & Performance Optimisation",
          body: "Core Web Vitals and Google rankings"
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-6.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-6.webp`,
        alt: "case-study-full-width-img-7",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Final Solution: Launch-Ready Branding Platform for Talent",
      paragraphs: [
        "The final product is a polished, user-friendly website that positions Runway as the go-to platform for creators seeking a personal digital brand. It balances aesthetics with performance, offering speed, scalability, and CMS flexibility. With Runway, users can now launch their own website in minutes—no dev team required."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-7.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-7.webp`,
        alt: "case-study-full-width-img-8",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-8.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-8.webp`,
        alt: "case-study-full-width-img-9",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-9.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-9.webp`,
        alt: "case-study-grid-img-1",
        width: 601,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-10.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-10.webp`,
        alt: "case-study-grid-img-2",
        width: 452,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-11.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-11.webp`,
        alt: "case-study-full-width-img-10",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/runway-case-img-12.jpg`,
        webp: `${CDN_URL}/images/runway-case-img-12.webp`,
        alt: "case-study-full-width-img-11",
        width: 1084,
        height: 1084
      }
    }
  ],
  testimonial: {
    name: "Andy Ryan",
    role: "Komodo",
    avatar: {
      src: `${CDN_URL}/images/andy-ryan.jpg`,
      webp: `${CDN_URL}/images/andy-ryan.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/komodo.png`,
      webp: `${CDN_URL}/images/komodo.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "Komodo engaged Zuse Digital for their new overall design of their website, Their work is just beautiful in many occasions from every step of the whole process, from discovery workshop, wireframing, UX process, responsive website design and over all animation to complete the website design.",
    full: [
      "Komodo is an award winning influencer global agency, spanning across USA, UK, AUS and Asia. As a creative agency ourselves, working with a reputable website design agency like Zuse Digital is the key.",
      "Komodo engaged Zuse Digital for their new overall design of their website, Their work is just beautiful in many occasions from every step of the whole process, from discovery workshop, wireframing, UX process, responsive website design and over all animation to complete the website design. Our website is now completed www.wearekomodo.com and we are super happy with the work the the Zuse team have done.",
      "The benefit of working with Zanyar and his team is the creative thinking and attention to detail at every step.",
      "We highly recommend Zuse Digital."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-runway"
};

export default study;
