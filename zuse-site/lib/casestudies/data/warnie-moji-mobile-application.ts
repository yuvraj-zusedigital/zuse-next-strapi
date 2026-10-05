import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "mobile-apps",
  slug: "warnie-moji-mobile-application",
  title: "Warnie Moji Mobile App Case Study",
  description: "Warnie Moji is a mobile app created in collaboration with cricket icon Shane Warne, turning his most memorable moments into fun, shareable emojis. Designed for fans, the app blends sport, humour, and digital expression into a user-friendly experience.",
  banner: `${CDN_URL}/warniemoji_case_banner_f746a41673.jpg`,
  about: "Warnie Moji is a mobile app created in collaboration with cricket icon Shane Warne, turning his most memorable moments into fun, shareable emojis. Designed for fans, the app blends sport, humour, and digital expression into a user-friendly experience.",
  meta: [
    {
      label: "Client",
      value: "Shane Warne (Warnie Moji)"
    },
    {
      label: "Industry",
      value: "Sports & Entertainment"
    },
    {
      label: "Audience Size",
      value: "Cricket fans, sports enthusiasts, and general emoji users globally"
    },
    {
      label: "Headquarters",
      value: "Australia"
    },
    {
      label: "Company Size",
      value: "Individual brand associated with Shane Warne"
    },
    {
      label: "Website",
      value: "N/A (app-based product)"
    },
    {
      label: "Notable Achievements",
      list: [
        "The Warnie Moji app reached the #1 spot in the Sports category on the Apple App Store.",
        "Featured a collection of custom emojis inspired by Shane Warne’s legendary cricketing career, personal interests, and signature moments.",
        "Allowed users to share emojis via text, email, and social media, offering a fun, personalised way for fans to engage with Warne’s legacy."
      ]
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Project Overview",
      paragraphs: [
        "Warnie Moji was a high-performance mobile app developed to give cricket fans a fun, interactive way to honour Shane Warne’s legacy. Built for iOS and Android, it featured a custom emoji keyboard filled with iconic cricket moments, humorous expressions, and lifestyle-themed emojis. Users could share them easily across messaging apps and social platforms."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-1.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-1.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Execution",
      paragraphs: [
        "Zuse Digital began with a strategic discovery session to define project goals, creative direction, and user expectations. Drawing from Warne’s colourful persona and cricket heritage, the team crafted a bold, engaging interface. Using an MVP-first approach, Zuse delivered a scalable cross-platform solution supported by robust AWS infrastructure and multi-device testing to ensure performance and reliability."
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-2.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-2.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "text",
      title: "Outcome & Deliverables",
      paragraphs: [
        "Zuse delivered a fast, user-friendly mobile app for both iOS and Android with seamless emoji keyboard integration. Services included:",
        "This case study demonstrates Zuse Digital’s excellence in Mobile App Development, combining technical expertise, user experience, and creative storytelling for a standout digital product."
      ],
      bullets: [
        {
          body: "Cross-Platform Mobile App Development"
        },
        {
          body: "Custom Keyboard Integration"
        },
        {
          body: "App Store & Google Play Deployment"
        },
        {
          body: "Ongoing Maintenance & Monitoring"
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-3.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-3.webp`,
        alt: "case-study-grid-img-1",
        width: 534,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-4.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-4.webp`,
        alt: "case-study-grid-img-2",
        width: 510,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-5.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-5.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/warniemoji-case-img-6.jpg`,
        webp: `${CDN_URL}/images/warniemoji-case-img-6.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    }
  ],
  testimonial: {
    name: "Luke Tunnecliffe",
    role: "StarMojis",
    avatar: {
      src: `${CDN_URL}/images/luke-tunnecliffe.jpg`,
      webp: `${CDN_URL}/images/luke-tunnecliffe.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/starmojis-logo.png`,
      webp: `${CDN_URL}/images/starmojis-logo.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "WarnieMoji was an App that needed innovative thinking and design. Zanyar and his team ensured that the App was of a superior standard to all of the overseas models. What stood out for us was that Zanyar personally went above and beyond to ensure its success.",
    full: [
      "StarMojis engaged the services of Zuse Digital when creating our WarnieMojis by Shane Warne App. This was an App that needed innovative thinking and design given it had not been done before in Australia.",
      "Zanyar and his team ensured that the App was of a superior standard to all of the overseas models. What stood out for us was that Zanyar personally went above and beyond to ensure its success. Thanks to Shane’s celebrity status and a quality product, the App was featured in all forms of media across Australia, highlighted by a front page review in the Herald Sun and an interview on The Today Show.",
      "We would strongly encourage other businesses to seek out the expertise of Zuse Digital to ensure a great product at great value."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-warniemoji"
};

export default study;
