import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "web-apps",
  slug: "jabri-web-application",
  title: "Jabri",
  description: "Jabri is a video interview management platform designed to streamline the hiring process for organizations. The platform enables hiring managers to review, skip, rewind, share, and compare video responses to expert interview questions, enhancing efficiency in talent acquisition.",
  banner: `${CDN_URL}/images/jabri-case-banner.jpg`,
  about: "Jabri is a video interview management platform designed to streamline the hiring process for organizations. The platform enables hiring managers to review, skip, rewind, share, and compare video responses to expert interview questions, enhancing efficiency in talent acquisition.",
  meta: [
    {
      label: "Client",
      value: "Jabri"
    },
    {
      label: "Industry",
      value: "Human Resources Technology"
    },
    {
      label: "Headquarters",
      value: "Melbourne, Australia"
    },
    {
      label: "Company Size",
      value: "Startup"
    },
    {
      label: "Website",
      href: "https://jabri.co/",
      hrefLabel: "https://www.jabri.co/",
      value: "https://www.jabri.co/"
    },
    {
      label: "Notable Achievements",
      value: "Jabri is part of the NVIDIA Inception Program and AWS Activate, recognised for their innovative product development and forward-looking AI roadmap."
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Overview & Objective",
      paragraphs: [
        "Jabri approached Zuse Digital to bring a completely new product concept to life: a video interview platform that would serve both hiring teams and job candidates. The goal was to develop a full-featured web application enabling structured, asynchronous interviews, designed for collaboration, clarity, and efficiency."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-1.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-1.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Challenge & Solution",
      paragraphs: [
        "The biggest challenge was ensuring video interviews—often tied to a candidate’s dream job—were reliably captured with zero data loss. Zuse engineered a resilient AWS infrastructure integrated with WebRTC, capable of real-time recording, buffering, and multi-zone storage. This formed the foundation of a secure, scalable system designed to perform flawlessly under pressure.",
        "On the frontend, a clean, intuitive interface was built for both user types. Candidates experienced a supportive, frictionless recording process, while hiring managers gained powerful tools to review, score, and share responses with ease. The result was a deeply human and technically robust product ready for real-world hiring needs."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-2.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-2.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "text",
      title: "Design & Development Process",
      paragraphs: [
        "We followed our proven product development workflow:",
        "From consultation to launch, every detail was aligned with Jabri’s vision for a smarter, more empathetic hiring experience."
      ],
      bullets: [
        {
          body: "Discovery and user research shaped the strategy."
        },
        {
          body: "Wireframes and prototypes defined the user journeys."
        },
        {
          body: "UI design emphasised clarity, accessibility, and ease of use."
        },
        {
          body: "Agile sprints delivered the platform feature by feature."
        },
        {
          body: "QA and testing ensured every recording was stable and high quality."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-3.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-3.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "text",
      title: "Key Deliverables",
      bullets: [
        {
          body: "Candidate interview portal with real-time video recording and submission tools"
        },
        {
          body: "Hiring manager dashboard with playback, scoring, and collaboration features"
        },
        {
          body: "Resilient AWS infrastructure with secure video storage and autoscaling"
        },
        {
          body: "Human-centred design system optimised for accessibility and user confidence"
        },
        {
          body: "Admin tools for managing job posts, users, and system configurations"
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-4.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-4.webp`,
        alt: "case-study-full-width-img-7",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-5.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-5.webp`,
        alt: "case-study-full-width-img-8",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-6.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-6.webp`,
        alt: "case-study-full-width-img-9",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-7.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-7.webp`,
        alt: "case-study-full-width-img-10",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-8.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-8.webp`,
        alt: "case-study-grid-img-1",
        width: 522,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/jabri-case-img-9.jpg`,
        webp: `${CDN_URL}/images/jabri-case-img-9.webp`,
        alt: "case-study-grid-img-2",
        width: 522,
        height: 610
      }
    }
  ],
  strapiSlug: "casestudy-jabri"
};

export default study;
