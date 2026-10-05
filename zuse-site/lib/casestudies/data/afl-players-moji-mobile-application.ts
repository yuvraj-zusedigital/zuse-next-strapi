import { CDN_URL } from "@/lib/config/cdn";
import type { CaseStudy } from "../types";

const study: CaseStudy = {
  category: "mobile-apps",
  slug: "afl-players-moji-mobile-application",
  title: "AFL Players App – Viral Sports Messaging App by Zuse",
  description: "The AFL Players’ Association is the peak body representing professional Australian rules footballers across the AFL and AFLW. Founded in 1973, the AFLPA advocates for player rights, health, and career development—empowering athletes both on and off the field. Their influence spans industrial relations, community initiatives, and pioneering leadership in athlete welfare.",
  banner: `${CDN_URL}/afl_case_banner_8d7379d395.jpg`,
  about: "The AFL Players’ Association is the peak body representing professional Australian rules footballers across the AFL and AFLW. Founded in 1973, the AFLPA advocates for player rights, health, and career development—empowering athletes both on and off the field. Their influence spans industrial relations, community initiatives, and pioneering leadership in athlete welfare.",
  meta: [
    {
      label: "Client",
      value: "AFL Players’ Association (AFLPA)"
    },
    {
      label: "Industry",
      value: "Sports, Athlete Representation"
    },
    {
      label: "Audience Size",
      value: "1,300+ current players (AFL & AFLW), 5,000+ past players"
    },
    {
      label: "Headquarters",
      value: "Albert Park, Victoria, Australia"
    },
    {
      label: "Company Size",
      value: "Medium (50–100 employees estimated)"
    },
    {
      label: "Website",
      href: "https://www.aflplayers.com.au/",
      hrefLabel: "aflplayers.com.au",
      value: "aflplayers.com.au"
    },
    {
      label: "Notable Achievements",
      value: "Instrumental in introducing free agency to the AFL; creators of the Indigenous Players Advisory Board; leaders in athlete wellbeing and community engagement."
    }
  ],
  blocks: [
    {
      type: "text",
      title: "Project Summary: Mobile App for AFL Fan Engagement",
      paragraphs: [
        "Zuse Digital collaborated with the AFLPA to design a custom mobile app that transformed how fans interact with their favourite AFL stars. The app allowed users to create and send personalised messages using official player and commentator assets—turning simple chats into memorable fan moments.",
        "To support viral growth, the backend was built on scalable AWS infrastructure, ensuring seamless media delivery across iOS and Android. The team also focused on asset optimisation, maintaining high visual quality across devices without sacrificing performance.",
        "Built with a cross-platform framework and guided by agile development, the app quickly became a standout in the sports entertainment space. It ranked #1 in Australia’s Sports category and was featured by Apple as a “New App We Love.”"
      ],
      bulletColumns: 1
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-1.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-1.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "text",
      title: "Solution & Outcomes: Cross-Platform AFL Sports App",
      paragraphs: [
        "Zuse Digital delivered a high-performance cross-platform app optimised for fun, fan engagement, and viral sharing. Deliverables included:",
        "Within 48 hours, the app soared to #1 in the Australian App Store’s paid Sports category, received widespread national media coverage, and set a new benchmark in digital fan engagement for professional sport."
      ],
      bullets: [
        {
          body: "Cross-platform mobile app development (React Native)"
        },
        {
          body: "Personalised AFL player-based messaging experience"
        },
        {
          body: "Scalable, media-optimised backend powered by AWS"
        },
        {
          body: "Full deployment to the App Store and Google Play"
        },
        {
          body: "Device-agnostic UX with media compression and performance tuning"
        },
        {
          body: "Post-launch monitoring and optimisation support"
        }
      ],
      bulletColumns: 2
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-2.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-2.webp`,
        alt: "case-study-full-width-img-2",
        width: 1084,
        height: 610
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-3.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-3.webp`,
        alt: "case-study-grid-img-1",
        width: 534,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-4.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-4.webp`,
        alt: "case-study-grid-img-2",
        width: 510,
        height: 616
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-5.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-5.webp`,
        alt: "case-study-full-width-img-5",
        width: 1084,
        height: 834
      }
    },
    {
      type: "image",
      image: {
        src: `${CDN_URL}/images/afl-case-img-6.jpg`,
        webp: `${CDN_URL}/images/afl-case-img-6.webp`,
        alt: "case-study-full-width-img-6",
        width: 1084,
        height: 1084
      }
    }
  ],
  testimonial: {
    name: "Paul Marcolin",
    role: "Spike Creative",
    avatar: {
      src: `${CDN_URL}/images/testi-block-img-10.jpg`,
      webp: `${CDN_URL}/images/testi-block-img-10.webp`,
      alt: "case_testi_avatar",
      width: 100,
      height: 100
    },
    brandLogo: {
      src: `${CDN_URL}/images/spike_creative_logo_f4e8457d16.png`,
      webp: `${CDN_URL}/images/spike_creative_logo_4c0cb34518.webp`,
      alt: "case_testi_logo",
      width: 99,
      height: 24
    },
    excerpt: "Zuse’s work on our app was outstanding – allowing us to deliver a fantastic user experience, also in the Sports category on AppStore Australia.",
    full: [
      "Spike Creative has engaged the services of Zuse Digital on several occasions and have always been impressed with Zanyar’s professionalism, knowledge and attention to detail. Zuse’s work on our AFL Players Moji app was outstanding – allowing us to deliver a fantastic user experience, which quickly saw it achieve No 1 chart rankings for Paid apps and also in the Sports category on the AppStore Australia.",
      "The enthusiasm and buy-in on every project by the Zuse team fills you with confidence that your job will be delivered on-time, on-budget and will most importantly, exceed your expectations. We can highly recommend Zuse for all your digital requirements."
    ],
    rating: 5
  },
  strapiSlug: "casestudy-afl"
};

export default study;
