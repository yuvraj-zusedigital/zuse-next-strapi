import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "mobile-apps",
  slug: "c19-mobile-application",
  title: "C-19 Tracker App Case Study",
  description: "Zuse Digital delivered the end-to-end concept, design, development & deployment of the C-19 Tracker App for the Victorian State Government. The platform equips Victorians with real-time healthcare guidance, advanced contact-tracing tools, and geo-intelligent risk mapping to combat COVID-19, reduce public harm, and optimise government response.",
  banner: `${CDN_URL}/images/c19_case_banner.jpg`,
  about: "Zuse Digital delivered the end-to-end concept, design, development & deployment of the C-19 Tracker App for the Victorian State Government. The platform equips Victorians with real-time healthcare guidance, advanced contact-tracing tools, and geo-intelligent risk mapping to combat COVID-19, reduce public harm, and optimise government response.",
  meta: [
    {
      label: "Client",
      value: "The C-19 Tracker App"
    },
    {
      label: "Industry",
      value: "Healthcare & Public Sector"
    },
    {
      label: "Headquarters",
      value: "London, UK"
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Challenges & Strategic Approach",
      paragraphs: [
        "The fast-moving COVID-19 crisis created:"
      ],
      bullets: [
        {
          body: "Public confusion & anxiety as guidelines evolved daily."
        },
        {
          body: "Overloaded contact-tracing teams struggling with manual workflows."
        },
        {
          body: "Data-privacy concerns around tracking individual movements."
        },
        {
          body: "Discovery & Strategy Workshops with health officials to define requirements and user journeys."
        },
        {
          body: "End-to-End Delivery from wireframes and UI design through full-stack development and QA."
        },
        {
          body: "Data-Driven UX featuring an intuitive map interface with real-time exposure overlays."
        }
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/c19-case-img-1.jpg`,
        webp: `${CDN_URL}/images/c19-case-img-1.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Solution & Deliverables",
      paragraphs: [
        "Zuse Digital led every phase to build a robust, scalable app:"
      ],
      bullets: [
        {
          title: "Interactive Risk Map",
          body: "Colour-coded hotspots and personal risk levels plotted against confirmed cases."
        },
        {
          title: "Travel-History Modeling",
          body: "Opt-in location logs reconstruct movements and flag potential exposures while preserving privacy."
        },
        {
          title: "Alert Notification System",
          body: "Instant push alerts with precise time-and-place details. In-app archive of all personal exposure notifications"
        },
        {
          title: "Integrated Location Services",
          body: "via third-party APIs for nearby hospitals, pharmacies, supermarkets, and support centres."
        },
        {
          title: "Information Hub",
          body: "Live dashboards showcasing statewide COVID-19 statistics, official advisories, and prevention guidance."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/c19-case-img-3.jpg`,
        webp: `${CDN_URL}/images/c19-case-img-3.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 1084
      }
    },
    {
      type: "text",
      title: "Key Results & Impact",
      bullets: [
        {
          body: "45% reduction in reported user anxiety through transparent, on-demand exposure insights."
        },
        {
          body: "30% faster government identification of high-risk zones and resource deployment."
        },
        {
          body: "Early isolation alerts helped curb secondary transmission within households."
        },
        {
          body: "25% decrease in field-team dispatches, optimising public-health budgets and manpower."
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/c19-case-img-2.jpg`,
        webp: `${CDN_URL}/images/c19-case-img-2.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/c19-case-img-5.jpg`,
        webp: `${CDN_URL}/images/c19-case-img-5.webp`,
        alt: "case-study-full-width-img",
        width: 1084,
        height: 610
      }
    }
  ],
  testimonial: {
    name: "Mark Bamford",
    role: "Founder of C-19 Tracker",
    avatar: {
      src: `${CDN_URL}/images/mark-bamford.jpg`,
      webp: `${CDN_URL}/images/mark-bamford.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/c-19-tracker.png`,
      webp: `${CDN_URL}/images/c-19-tracker.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "SoteriaApp empowers people with a simple, effective tool to track and combat COVID-19, safeguarding communities now and helping the UK—and beyond—return to normal faster.",
    full: [
      "The SoteriaApp project was inspired by the need to provide the public with a platform that would help protect the public from harm now and in the future, and help the UK and other countries by giving them a tool to defeat COVID-19 and get back to normal faster.",
      "Having a tech partner like Zuse Digital as the pillar of this not-for-profit endeavour has been critical to getting the App BETA testing within 2 weeks of the initial conversation has been an incredible effort. The ability of the Zuse Digital team to understand a highly complex situation and distil this down to a smooth UX was vital.",
      "This was a tech sprint relay, and to have a partner like Zanyar and all the team at Zuse Digital has been vital to producing a world-class App with incredible speed."
    ],
    rating: 5
  },
  strapiSlug: "c19"
};

export default study;
