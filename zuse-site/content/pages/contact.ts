/**
 * Built-in content of the Contact page, also used by Thank-you (fallback until
 * the Strapi page has sections; also the source for scripts/cms-seed-pages.js).
 */

import { CDN_URL } from "@/lib/config/cdn";
import { CONTACT_FIELDS, CONTACT_TEXT } from "@/lib/form-defaults";
import type { PageDefaults } from "@/lib/pages";

export const contact: PageDefaults = {
  slug: "contact",
  path: "/contact",
  name: "Contact",
  sections: [
    {
      __component: "sections.contact-form",
      ...CONTACT_FIELDS,
      ...CONTACT_TEXT,
      title: "Contact Us",
      description: "Share your project details, and we'll reach out \nwithin one business day for a **free estimation call**.",
      serviceOptions: "Website\nMobile App\nWeb Application\neCommerce\nAI",
      budgetOptions: "$10,000 - $20,000\n$20,000 - $35,000\n$35,000 - $60,000\n$60,000 - $100,000\nOver $100,000",
      referralOptions:
        "Friend or colleague\nGoogle\nLinkedIn\nDirectory listing (Clutch, GoodFirms)\nAI assistant (ChatGPT, Gemini)\nSocial Media\nOther",
      successPath: "/thank-you",
      thankYouTitle: "Thank you{name}. We’ll get back to you soon.",
      thankYouText:
        "Your email has been sent! We appreciate you reaching out and are stoked about the opportunity to work together. Stay tuned and we'll get back to you soon.",
    },
    {
      __component: "sections.testimonial-slider",
      items: [
        {
          name: "Paul Gannon",
          company: "Binyan Studio",
          role: "Executive Creative Director",
          image: {
            url: `${CDN_URL}/images/paul-gannon-binyan-studio.jpg`,
            alt: "",
          },
          quote:
            "Binyan Studios has engaged Zuse Digital on multiple occasions to develop custom website applications, and their work has always been exceptional. Their attention to detail, superior design, and enthusiasm for our projects have consistently impressed us. The team takes pride in their work and invests time to understand our business, making even the most complex tasks possible. We highly recommend Zuse Digital.",
        },
        {
          name: "Natalie Khoo",
          company: "Avion Communication",
          role: "Founder, CEO",
          image: {
            url: `${CDN_URL}/images/natalie-khoo-avion-communication.jpg`,
            alt: "",
          },
          quote:
            "Collaborating with Zanyar has always been a fantastic experience. His inquisitive and enthusiastic nature, combined with his dedication to his craft, makes him a standout professional. Zanyar’s optimism about the role of technology in business growth is inspiring, and I highly recommend consulting with him if you’re considering app development or other digital projects.",
        },
        {
          name: "Mehmet Ozcan",
          company: "Ozcan",
          role: "Director",
          image: {
            url: `${CDN_URL}/images/mehmet-ozcan-ozcan-group.jpg`,
            alt: "",
          },
          quote:
            "Zuse Digital exceeded our expectations when we decided to refresh our branding and modernise our website. Their professionalism and attention to detail were evident throughout the project. The result was a modern, professional website that serves as a perfect storefront in the virtual world. I highly recommend Zuse Digital for your next project.",
        },
      ],
    },
    {
      __component: "sections.faq",
      title: "FAQ's",
      items: [
        {
          question: "What types of projects do you specialise in?",
          answer:
            "We handle a diverse range of custom digital projects—from high-performance website designs and mobile apps to complex web applications and AI-powered solutions. Our portfolio demonstrates our expertise in delivering scalable and innovative digital experiences.",
        },
        {
          question: "What is your project process from consultation to launch?",
          answer:
            "Our process begins with a discovery workshop and in-depth research to understand your goals, followed by UX/UI design, development, rigorous testing, and launch. We work closely with you at every step.",
        },
        {
          question: "How do you determine project timelines and budgets?",
          answer:
            "Every project is unique. We start with a detailed consultation, then provide a customised timeline and budget proposal. Design complexity, functionality, and integrations all influence the estimate.",
        },
        {
          question: "Can you share examples of past projects similar to mine?",
          answer:
            "Absolutely. We have delivered projects across many industries, from influencer marketing websites to bespoke eCommerce transformations and enterprise platforms. Our work page contains a selection of relevant case studies.",
        },
        {
          question: "How do you ensure quality and performance?",
          answer:
            "We use collaborative delivery, continuous testing, code review, and performance optimisation to ensure every solution meets rigorous UX and technical standards.",
        },
        {
          question: "What role will I play during the project?",
          answer:
            "Collaboration is central to our process. You will be involved from discovery and prototype feedback through revisions, testing, and launch.",
        },
        {
          question: "What post-launch support do you offer?",
          answer:
            "We provide ongoing maintenance, performance monitoring, security updates, and optimisation to keep your digital product current and reliable.",
        },
        {
          question: "How will you handle confidential property rights?",
          answer:
            "Everyone working at Zuse Digital is bound by confidentiality obligations. We understand the value of your strategic insights and intellectual property and treat them accordingly.",
        },
      ],
    },
  ],
};
