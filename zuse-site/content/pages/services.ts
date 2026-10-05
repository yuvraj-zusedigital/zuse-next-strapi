/**
 * Built-in content of the service pages (fallback until the Strapi page has
 * sections; also the source for scripts/cms-seed-pages.js).
 */

import { CDN_URL } from "@/lib/config/cdn";
import { md } from "@/lib/blocks";
import type { PageDefaults } from "@/lib/pages";
import type { Section } from "@/lib/sections";

export const websiteDesign: PageDefaults = {
  slug: "service-website-design",
  path: "/services/website-design",
  name: "Webdesign & Development",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Webdesign & Development",
      lead: "User-centric, SEO-optimised websites that drive conversions — crafted for startups, SMEs, and global brands.",
      body: md(`
At Zuse Digital, we create high-performance, custom website designs tailored to your brand and business model. Our blend of UI/UX, SEO, and data-driven conversion rate optimisation ensures your website not only looks exceptional but drives measurable results.
`),
    },
    ...([
      {
        __component: "sections.service-offerings",
        title: "Our Services",
        items: [
          {
            title: "Strategy & Research",
            points: [
              {
                title: "Information Architecture & User Flow",
              },
              {
                title: "Brand Messaging & Communication Strategy",
              },
              {
                title: "Competitor & Market Analysis",
              },
              {
                title: "Engagement & Customer Acquisition",
              },
            ],
          },
          {
            title: "Website Design & UX/UI",
            points: [
              {
                title: "Responsive, Mobile-First Design",
              },
              {
                title: "UI/UX Optimised for Conversions",
              },
              {
                title: "Design Systems & Component Libraries",
              },
              {
                title: "Accessibility Compliance (WCAG AA/AAA)",
              },
            ],
          },
          {
            title: "Development & Performance",
            points: [
              {
                title: "High-Speed, SEO-Friendly Development",
              },
              {
                title: "eCommerce (Shopify, WooCommerce, Custom Builds)",
              },
              {
                title: "WordPress, Next.js, WebFlow, & Strapi CMS",
              },
              {
                title: "Core Web Vitals & Page Speed Optimisation",
              },
            ],
          },
          {
            title: "Conversion Rate Optimisation (CRO)",
            points: [
              {
                title: "A/B Testing & Multivariate Experiments",
              },
              {
                title: "Sales Funnel & Landing Page Optimisation",
              },
              {
                title: "Heatmaps & User Behaviour Analysis",
              },
              {
                title: "Cart Abandonment Reduction Strategies",
              },
            ],
          },
        ],
      },
      {
        __component: "sections.process-steps",
        title: "Website Design Process",
        steps: [
          {
            title: "Initial Consultation",
            description: "Discuss your brand, goals, and project requirements.",
            icon: {
              url: `${CDN_URL}/images/serv-process-start-icon.svg`,
              alt: "",
            },
            iconSize: 14,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Research & Planning",
            description: "Analyse market trends and competitor strategies to inform our design approach.",
            icon: {
              url: `${CDN_URL}/images/serv-process-research-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Wireframing",
            description: "Develop structured blueprints to map out the website’s layout and user journey.",
            icon: {
              url: `${CDN_URL}/images/serv-process-wireframe-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Design Concepts",
            description: "Create visual mockups that reflect your brand identity.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designconcept-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Feedback & Revisions",
            description: "Iterate on the design based on your input to ensure alignment with your vision.",
            icon: {
              url: `${CDN_URL}/images/serv-process-feedback-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Final Design Approval",
            description: "Confirm that the design meets your expectations before development.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designapprove-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Launch",
            description:
              "Deploy a fully optimised, mobile-friendly website with a seamless user experience. We ensure your site is fast, SEO-optimised, and built for growth.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-deploy-optimize-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: {
              url: `${CDN_URL}/images/ios-launch-emoji.png`,
              alt: "",
            },
            iconOverlay: null,
          },
          {
            title: "Support & Maintenance",
            description: "Offer ongoing support and updates post-launch to ensure optimal performance and security.",
            icon: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-gradient-1x-diff.png`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-diff.png`,
              alt: "",
            },
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Tools We Use",
        lead: "We leverage industry-leading tools to design, build, and optimise high-performance websites:",
        items: [
          {
            title: "Design & Prototyping",
            description: "Figma – UI/UX Prototyping & Wireframing",
          },
          {
            title: "Development Platforms",
            description: "WordPress, Next.js, WebFlow, Strapi CMS",
          },
          {
            title: "eCommerce Solutions",
            description: "Shopify & WebFlow – No-Code & Scalable Development",
          },
          {
            title: "Performance & SEO",
            description: "GatsbyJS, Google Core Web Vitals, Optimizely, VWO – A/B Testing & Conversion Optimisation",
          },
        ],
      },
    ] as Section[]),
  ],
};

export const webApplicationDevelopment: PageDefaults = {
  slug: "service-webapp-development",
  path: "/services/web-application-development",
  name: "Web Application Development",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Web Application Development",
      lead: "Build tailored, scalable software solutions with Zuse Digital — SaaS platforms, enterprise tools, and high-performance APIs.",
      body: md(`
At Zuse Digital, we specialise in custom web applications and software development that are secure, scalable, and AI-powered. As an Australian- based software development company, we design, build, and deploy bespoke software solutions for businesses of all sizes. Our expertise spans SaaS platforms, cloud-based enterprise software, and high-performance API integrations that drive business efficiency, automation, and digital transformation.
`),
    },
    ...([
      {
        __component: "sections.service-offerings",
        title: "Our Services",
        items: [
          {
            title: "Custom Software & Web Application Development",
            points: [
              {
                title: "Scalable custom web applications designed for innovation and performance.",
              },
              {
                title: "Enterprise-grade business applications for internal and external operations.",
              },
              {
                title: "SaaS (Software as a Service) platform development for cloud-based scalability.",
              },
              {
                title: "Progressive Web Apps (PWAs) for seamless cross-device experiences.",
              },
              {
                title: "Business Process Automation & Workflow Management for increased efficiency.",
              },
              {
                title: "Secure, API-driven platforms for third-party integrations & system connectivity.",
              },
            ],
          },
          {
            title: "Product Design, UX/UI & Web Portals",
            points: [
              {
                title: "Design System Development for scalable and consistent branding.",
              },
              {
                title: "Interactive business intelligence dashboards & client portals.",
              },
              {
                title: "POC & Rapid Prototyping for idea validation and faster development cycles.",
              },
              {
                title: "Accessibility Compliance for inclusive applications.",
              },
            ],
          },
          {
            title: "Backend Development & API Integration",
            points: [
              {
                title: "Custom API Development for seamless third-party tool integrations.",
              },
              {
                title: "Microservices & modular architecture for high-performance applications.",
              },
              {
                title: "Business Logic Implementation ensuring long-term maintainability.",
              },
              {
                title: "Database Architecture optimised for reliability & performance.",
              },
              {
                title: "RESTful API & GraphQL Development for data-driven applications.",
              },
              {
                title: "DevOps & Continuous Integration for automated deployments & efficiency.",
              },
            ],
          },
          {
            title: "SaaS Development & Cloud Solutions",
            points: [
              {
                title: "Subscription-based software solutions for B2B and B2C applications.",
              },
              {
                title: "Cloud-native application development using AWS, Google Cloud, and Azure.",
              },
              {
                title: "Secure and high-performance SaaS API integrations with third-party platforms.",
              },
              {
                title: "Enterprise software with automated scaling & cloud-based architecture",
              },
            ],
          },
          {
            title: "Testing, Security & Compliance",
            points: [
              {
                title: "End-to-End, Unit, and Performance Testing.",
              },
              {
                title: "Security & Penetration Testing for data protection & compliance with GDPR, ISO 27001, and SOC2 standards.",
              },
              {
                title: "Load testing and API security audits for enterprise resilience.",
              },
            ],
          },
        ],
      },
      {
        __component: "sections.process-steps",
        title: "Our Process",
        steps: [
          {
            title: "Initial Consultation",
            description: "We conduct a detailed discovery session to understand your business goals, technical needs, and vision.",
            icon: {
              url: `${CDN_URL}/images/serv-process-start-icon.svg`,
              alt: "",
            },
            iconSize: 14,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Research & Planning",
            description:
              "Our team performs in-depth market research, competitor analysis, and technology selection to align your software strategy with the latest trends.",
            icon: {
              url: `${CDN_URL}/images/serv-process-research-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Wireframing & Prototyping",
            description: "We create interactive wireframes and prototypes to define workflows, system interactions, and usability.",
            icon: {
              url: `${CDN_URL}/images/serv-process-wireframe-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "UI/UX Design",
            description: "A user-friendly, conversion-optimised interface ensures seamless customer and internal interactions.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-ui-ux-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Development & Testing",
            description:
              "Using agile methodologies, we build scalable applications with robust backend security, API integrations, and automation.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-support-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Deployment & Optimisation",
            description: "Secure cloud deployment with continuous monitoring, performance testing, and compliance verification.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designapprove-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Ongoing Support & Maintenance",
            description: "We offer long-term updates, security patches, and feature enhancements to keep your software optimised.",
            icon: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-gradient-1x.png`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: {
              url: `${CDN_URL}/images/support-and-maintenance-icon.png`,
              alt: "",
            },
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Web Application Benefits",
        items: [
          {
            title: "Scalability",
            description: "Ensures long-term growth and usability.",
          },
          {
            title: "Cross-Platform Compatibility",
            description: "Seamless functionality across devices and platforms.",
          },
          {
            title: "Enhanced Security",
            description: "Robust security measures to protect sensitive data.",
          },
          {
            title: "Cost-Efficiency",
            description: "Reduces development and maintenance costs.",
          },
          {
            title: "Ease of Maintenance",
            description: "Simplifies updates and management.",
          },
          {
            title: "Customer Engagement",
            description: "Provides intuitive and interactive experiences that foster user loyalty.",
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Technologies We Use",
        items: [
          {
            title: "Frontend",
            description: "React, Angular, Vue.js, Tailwind CSS.",
          },
          {
            title: "Backend",
            description: "Node.js, Laravel, ASP.NET Core.",
          },
          {
            title: "APIs",
            description: "RESTful, GraphQL, OAuth, JWT.",
          },
          {
            title: "Cloud Services",
            description: "AWS, Google Cloud, Azure.",
          },
          {
            title: "Database Management",
            description: "PostgreSQL, MySQL, MongoDB.",
          },
          {
            title: "Security & Compliance",
            description: "GDPR, ISO 27001, SOC2.",
          },
        ],
      },
    ] as Section[]),
  ],
};

export const mobileAppDevelopment: PageDefaults = {
  slug: "service-mobile-app",
  path: "/services/mobile-app-development",
  name: "Mobile App Development",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Mobile App Development",
      lead: "Scalable, secure, and user-centric mobile apps — for iOS, Android, and the workflows that surround them.",
      body: md(`
Zuse Digital is a leading mobile app development agency specialising in high-performance, secure, and intuitive mobile applications. We help startups bring innovative ideas to life and assist businesses in transforming existing apps into modern, high-performing products.
`),
    },
    ...([
      {
        __component: "sections.service-offerings",
        title: "Our Services",
        items: [
          {
            title: "UX Design & User Experience",
            description:
              "Creating an engaging and seamless user experience is crucial for the success of any mobile application. We design intuitive, user-friendly interfaces that ensure smooth navigation and high retention rates.",
            points: [
              {
                title: "User-Centric Design",
                description: "Intuitive UI that enhances engagement and conversion.",
              },
              {
                title: "Onboarding & User Flows",
                description: "Simplified experiences that improve retention.",
              },
              {
                title: "Animations & Microinteractions",
                description: "Smooth, engaging transitions for better usability.",
              },
              {
                title: "Dark & Light Mode Compatibility",
                description: "Custom UI themes for improved accessibility.",
              },
              {
                title: "Gesture-Based Navigation",
                description: "Optimised controls for a fluid mobile experience.",
              },
              {
                title: "Accessibility Compliance",
                description: "Ensuring usability for all users, including those with disabilities.",
              },
            ],
          },
          {
            title: "Custom Mobile App Development",
            description:
              "We develop custom mobile apps tailored to your business needs, providing scalable and robust solutions for startups and enterprises.",
            points: [
              {
                title: "React Native, iOS, and Android Apps",
                description: "Cross-platform solutions with native performance.",
              },
              {
                title: "MVP Development",
                description: "Validate startup ideas with lean, functional prototypes.",
              },
              {
                title: "Scalable & Secure",
                description: "Apps built for long-term growth and enterprise-level security.",
              },
            ],
          },
          {
            title: "AI-Powered Mobile Apps",
            description:
              "Leverage the power of AI to enhance user engagement and automate complex processes. Our AI-powered solutions bring intelligence to mobile applications.",
            points: [
              {
                title: "Intelligent Automation",
                description: "AI-driven chatbots, recommendation engines, and automation tools.",
              },
              {
                title: "Predictive Analytics",
                description: "Advanced insights into user behaviour and app performance.",
              },
              {
                title: "Personalised User Experiences",
                description: "AI-enhanced features that adapt to user preferences.",
              },
            ],
          },
          {
            title: "Mobile Backend Development",
            description:
              "A strong backend is essential for a fast, secure, and scalable mobile application. We build robust backend systems that ensure seamless app performance.",
            points: [
              {
                title: "Scalable Infrastructure",
                description: "Cloud-native solutions with Firebase, Node.js, .NET Core, and GraphQL.",
              },
              {
                title: "Seamless API Integration",
                description: "Secure and efficient connectivity with third-party services.",
              },
              {
                title: "Data Management & Security",
                description: "Reliable backend solutions ensuring data integrity.",
              },
            ],
          },
          {
            title: "App Deployment & Optimisation",
            description:
              "Launching your app successfully requires strategic planning and execution. We manage the entire deployment process to ensure a smooth launch.",
            points: [
              {
                title: "Apple App Store & Google Play Compliance",
                description: "Ensuring smooth approval and launch.",
              },
              {
                title: "App Store Optimisation (ASO)",
                description: "Strategies to improve visibility and downloads.",
              },
              {
                title: "Performance Monitoring",
                description: "Ongoing tracking and improvements to ensure efficiency.",
              },
            ],
          },
          {
            title: "Mobile App Maintenance & Growth",
            description:
              "Keeping your mobile app updated and optimised is key to maintaining user engagement and long-term success. We offer ongoing support and improvements.",
            points: [
              {
                title: "Continuous Monitoring",
                description: "Proactive updates, security patches, and feature enhancements.",
              },
              {
                title: "Scalability Planning",
                description: "Helping businesses grow and evolve their mobile apps over time.",
              },
            ],
          },
        ],
      },
      {
        __component: "sections.process-steps",
        title: "Our Process",
        steps: [
          {
            title: "Initial Consultation",
            description: "We begin with an in-depth discussion to understand your vision, business goals, and technical requirements.",
            icon: {
              url: `${CDN_URL}/images/serv-process-start-icon.svg`,
              alt: "",
            },
            iconSize: 14,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Research & Planning",
            description:
              "We define your target audience, analyse competitors, and determine the best technology stack for your mobile app.",
            icon: {
              url: `${CDN_URL}/images/serv-process-research-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Wireframing & Prototyping",
            description:
              "Our team creates detailed wireframes and interactive prototypes to map out the app’s user journey and design structure.",
            icon: {
              url: `${CDN_URL}/images/serv-process-wireframe-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "UX & UI Design",
            description:
              "We craft engaging, accessible, and visually compelling interfaces that align with your brand identity and enhance user engagement.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-ui-ux-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Development & Testing",
            description:
              "Using agile methodologies, we build, test, and refine your mobile application to ensure security, scalability, and optimal performance.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-mobi-app-dev-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Final Design Approval",
            description:
              "We conduct final refinements based on user testing and stakeholder feedback to ensure the app is ready for deployment.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designapprove-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "App Store Deployment & Optimisation",
            description:
              "We publish your app on the Apple App Store and Google Play while implementing ASO strategies for maximum visibility and success.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-deploy-optimize-icon.svg`,
              alt: "",
            },
            iconSize: 140,
            titleImage: {
              url: `${CDN_URL}/images/ios-launch-emoji.png`,
              alt: "",
            },
            iconOverlay: null,
          },
          {
            title: "Support & Maintenance",
            description:
              "Our team provides ongoing updates, performance monitoring, and new feature implementations to keep your app competitive.",
            icon: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-gradient-1x-diff.png`,
              alt: "",
            },
            iconSize: 140,
            titleImage: null,
            iconOverlay: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-diff.png`,
              alt: "",
            },
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Industries We Serve",
        lead: "We build tailored mobile applications for startups and enterprises across various industries, including:",
        items: [
          {
            title: "FinTech",
            description: "Secure & compliant financial apps.",
          },
          {
            title: "HealthTech",
            description: "Innovative healthcare solutions.",
          },
          {
            title: "Retail & eCommerce",
            description: "Engaging shopping & payment platforms.",
          },
          {
            title: "Education & eLearning",
            description: "Interactive and AI-driven learning apps.",
          },
          {
            title: "Entertainment & Streaming",
            description: "Seamless media & video streaming experiences.",
          },
          {
            title: "Logistics & Transportation",
            description: "Smart tracking and automation solutions.",
          },
          {
            title: "Sports & Fitness",
            description: "AI-driven fitness tracking and performance analysis.",
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Why Choose Zuse Digital for Mobile App Development?",
        items: [
          {
            title: "Expert-Led Development",
            description: "A team of experienced engineers ensures high-quality, future-proof mobile applications.",
          },
          {
            title: "React Native Specialists",
            description: "Cost-effective, high-performance apps with a native experience.",
          },
          {
            title: "AI-Powered Capabilities",
            description: "Intelligent automation, predictive analytics, and personalised experiences.",
          },
          {
            title: "Optimised for Performance",
            description: "Fast, scalable, and secure mobile applications.",
          },
          {
            title: "Seamless API Integration",
            description: "Connect your app with essential services and platforms.",
          },
          {
            title: "Full-Cycle Development",
            description: "From idea validation to launch and long-term maintenance.",
          },
        ],
      },
      {
        __component: "sections.bullet-groups",
        title: "Technologies We Use",
        groups: [
          {
            title: "Mobile App Development",
            items: [
              {
                title: "React Native",
                description: "Cross-platform, high-performance development.",
              },
              {
                title: "iOS Development",
                description: "Swift, Objective-C",
              },
              {
                title: "Android Development",
                description: "Kotlin, Java",
              },
            ],
          },
          {
            title: "Backend & Cloud Services",
            items: [
              {
                title: "Backend",
                description: "Node.js, Firebase, GraphQL, .NET Core",
              },
              {
                title: "Databases",
                description: "PostgreSQL, MongoDB, SQLite",
              },
              {
                title: "Cloud Services",
                description: "AWS, Google Cloud, Azure",
              },
            ],
          },
        ],
      },
    ] as Section[]),
  ],
};

export const seoAiSearchOptimisation: PageDefaults = {
  slug: "service-seo-ai-search-optimisation",
  path: "/services/seo-ai-search-optimisation",
  name: "SEO & AI Search Optimisation",
  sections: [
    {
      __component: "sections.page-intro",
      title: "SEO & AI Search Optimisation",
      lead: "Get Found Everywhere with Award-Winning SEO, AEO & GEO",
      body: md(`
## Be the Answer on Google, ChatGPT & AI Overviews

Search doesn't stop at Google anymore. Your customers now ask ChatGPT, Perplexity, Gemini and Google's AI Overviews and those engines recommend brands they can read, trust and cite. As an AI-first agency that builds this technology every day, Zuse Digital knows how AI engines crawl, interpret and cite the web. We combine proven SEO with AEO and GEO so your brand becomes the answer, everywhere your customers search.
`),
    },
    ...([
      {
        __component: "sections.service-offerings",
        title: "Our Services",
        items: [
          {
            title: "Search Engine Optimisation (SEO)",
            description:
              "The proven foundation. We make your website technically flawless, fast and relevant, so Google ranks it and AI engines can read it.",
            points: [
              {
                title: "Technical SEO audits & fixes",
              },
              {
                title: "Core Web Vitals & site speed",
              },
              {
                title: "Keyword research & on-page optimisation",
              },
              {
                title: "Site architecture & internal linking",
              },
            ],
          },
          {
            title: "Answer Engine Optimisation (AEO)",
            description:
              "We structure your content so search engines can lift it straight into featured snippets, People Also Ask boxes and voice answers.",
            points: [
              {
                title: "Schema markup & structured data (JSON-LD)",
              },
              {
                title: "Featured snippet & People Also Ask targeting",
              },
              {
                title: "FAQ, how-to & answer-ready formatting",
              },
              {
                title: "Entity optimisation & knowledge panels",
              },
            ],
          },
          {
            title: "Generative Engine Optimisation (GEO)",
            description:
              "We get your brand cited and recommended inside AI-generated answers the results your customers increasingly trust first.",
            points: [
              {
                title: "AI visibility audits across ChatGPT, Perplexity, Gemini & AI Overviews",
              },
              {
                title: "AI crawler readiness (GPTBot, PerplexityBot, llms.txt)",
              },
              {
                title: "Citation-worthy content & source formatting",
              },
              {
                title: "Brand mention & sentiment tracking in AI answers",
              },
            ],
          },
          {
            title: "Content Creation & Strategy",
            description:
              "AI engines cite originals, not copies. We create unique, expert-led content that earns citations and converts readers into customers.",
            points: [
              {
                title: "Original research, data & expert-led content",
              },
              {
                title: "Pillar & topic-cluster strategy",
              },
              {
                title: "Human-written, E-E-A-T-driven copy",
              },
              {
                title: "Content refresh & decay recovery",
              },
            ],
          },
          {
            title: "Local SEO (Melbourne-First)",
            description: "From Toorak to greater Melbourne and Sydney, we make sure nearby customers and local AI queries find you first.",
            points: [
              {
                title: "Google Business Profile optimisation",
              },
              {
                title: "Local landing pages & suburb targeting",
              },
              {
                title: "Citations, NAP consistency & reviews strategy",
              },
              {
                title: 'Local 3-pack & "near me" visibility',
              },
            ],
          },
          {
            title: "Digital PR & Authority Building",
            description:
              "Authority is the currency of both Google and AI engines. We earn the links and mentions that make them trust you.",
            points: [
              {
                title: "High-authority Australian link building",
              },
              {
                title: "Digital PR & data-led campaigns",
              },
              {
                title: "Unlinked brand mention reclamation",
              },
              {
                title: "Review & reputation signals AI engines read",
              },
            ],
          },
        ],
      },
      {
        __component: "sections.process-steps",
        title: "Our SEO & AI Search Process",
        steps: [
          {
            title: "Discovery & AI Visibility Audit",
            description: "We benchmark where you rank on Google and whether ChatGPT, Perplexity and AI Overviews mention your brand today.",
            icon: {
              url: `${CDN_URL}/images/serv-process-start-icon.svg`,
              alt: "",
            },
            iconSize: 14,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Strategy & Roadmap",
            description: "We map keyword and AI citation opportunities into a prioritised 90-day roadmap tied to leads and revenue.",
            icon: {
              url: `${CDN_URL}/images/serv-process-research-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Technical Foundations",
            description: "We fix crawlability, speed, Core Web Vitals, schema and AI crawler access so every engine can read your site.",
            icon: {
              url: `${CDN_URL}/images/serv-process-wireframe-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Content & Answer Optimisation",
            description: "We create unique, expert-led content formatted to win featured snippets and earn citations inside AI answers.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designconcept-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Authority & Citations",
            description: "We build high-quality Australian links, digital PR and brand mentions that make Google and AI engines trust you.",
            icon: {
              url: `${CDN_URL}/images/serv-process-feedback-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Measurement & Reporting",
            description:
              "Transparent dashboards across GA4, Search Console and AI visibility tracking show rankings, citations, traffic and leads.",
            icon: {
              url: `${CDN_URL}/images/serv-process-designapprove-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: null,
          },
          {
            title: "Continuous Refinement",
            description: "Algorithms and AI models change constantly. We keep optimising so your visibility compounds month after month.",
            icon: {
              url: `${CDN_URL}/images/serv_comm-deploy-optimize-icon.svg`,
              alt: "",
            },
            iconSize: 100,
            titleImage: {
              url: `${CDN_URL}/images/ios-launch-emoji.png`,
              alt: "",
            },
            iconOverlay: null,
          },
          {
            title: "Reporting & Ongoing Iteration",
            description: "Track rankings, traffic, and AI citations then iterate every month for compounding, long-term growth.",
            icon: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-gradient-1x-diff.png`,
              alt: "",
            },
            iconSize: 100,
            titleImage: null,
            iconOverlay: {
              url: `${CDN_URL}/images/support-and-maintenance-icon-diff.png`,
              alt: "",
            },
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Where Your Brand Will Show Up",
        items: [
          {
            title: "Google Search & AI Overviews",
            description: "Rankings plus citations inside Google's AI answers",
          },
          {
            title: "ChatGPT & ChatGPT Search",
            description: "Brand mentions and recommendations",
          },
          {
            title: "Perplexity",
            description: "Cited sources in research-style answers",
          },
          {
            title: "Google Gemini",
            description: "AI answers grounded in your content",
          },
          {
            title: "Microsoft Copilot & Bing",
            description: "The index behind many AI assistants",
          },
          {
            title: "Voice & Assistant Search",
            description: "Answer-ready content for spoken queries",
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Tools & Tech Stack",
        items: [
          {
            title: "Search & Analytics",
            description: "Google Search Console, GA4, Looker Studio",
          },
          {
            title: "SEO Platforms",
            description: "SE Ranking, Ahrefs, Semrush, Screaming Frog",
          },
          {
            title: "AI Visibility & UX",
            description: "AI citation tracking across ChatGPT, Perplexity, Gemini & AI Overviews; Microsoft Clarity heatmaps",
          },
          {
            title: "Structured Data",
            description: "Schema.org JSON-LD & Google Rich Results tooling",
          },
        ],
      },
      {
        __component: "sections.bullet-grid",
        title: "Engagement Models & Pricing",
        items: [
          {
            title: "AI Visibility Audit & Roadmap",
            description: "Fixed-price starting point: where you stand on Google and AI engines, plus a prioritised 90-day plan",
          },
          {
            title: "Monthly SEO + GEO Retainer",
            description: "Ongoing optimisation, content, authority building and transparent reporting",
          },
          {
            title: "Project Sprints",
            description: "Migrations, schema rollouts, content builds and site launches",
          },
          {
            title: "Flexible Pricing Models",
            description: "Fixed project-based, subscription-based, or custom pricing",
          },
        ],
      },
    ] as Section[]),
  ],
};
