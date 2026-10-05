/**
 * Built-in content of the AI service pages (fallback until the Strapi page has
 * sections; also the source for scripts/cms-seed-pages.js).
 */

import { md } from "@/lib/blocks";
import type { PageDefaults } from "@/lib/pages";

export const artificialIntelligence: PageDefaults = {
  slug: "service-artificial-intelligence",
  path: "/services/artificial-intelligence",
  name: "Artificial Intelligence",
  sections: [
    {
      __component: "sections.page-intro",
      title: "Transform Your Business with Award-Winning AI Solutions",
      lead: "AI-powered automation, intelligent agents, chatbots, RAG systems, and predictive analytics — built for real operations.",
      body: md(`
AI is transforming businesses, driving automation, optimising workflows, and unlocking new opportunities for growth. At Zuse Digital, we deliver practical AI that integrates with your websites, apps, and internal tools — and pairs with [SEO & AI search optimisation](/services/seo-ai-search-optimisation) so customers can find you across Google and AI answers.

## AI Agents & Automation

Automate decision-making and streamline operations with AI agents that process complex tasks, provide recommendations, and execute workflows with minimal human intervention. Explore our dedicated [AI Agents & Automation](/services/ai-agents-automation) service.

## AI Product Development

We build AI-powered applications — from intelligent web and mobile products to recommendation engines, voice experiences, and secure integrations with CRM and ERP systems. See [AI Product Development](/services/ai-product-development).

## Capabilities

- Retrieval-Augmented Generation (RAG) knowledge systems
- Customer support and operations agents
- Predictive analytics and reporting automation
- AI features inside websites, SaaS, and mobile apps
`),
    },
  ],
};

export const aiAgentsAutomation: PageDefaults = {
  slug: "service-ai-agents-automation",
  path: "/services/ai-agents-automation",
  name: "AI Agents & Automation",
  sections: [
    {
      __component: "sections.page-intro",
      title: "AI Agents & Automation",
      lead: "We build framework-agnostic AI agents to streamline operations so your team can focus on their most impactful work.",
      body: md(`
Automate decision-making and streamline operations with AI agents that can process complex tasks, provide recommendations, and execute workflows with minimal human intervention — designed around your tools, data, and governance needs.

## Where agents create leverage

- Customer support and operations triage
- Self-learning assistants for internal knowledge
- Virtual assistants that coordinate multi-step work
- Scalable workflows across docs, scheduling, and reporting

## AI-powered business automation

Beyond chat interfaces, we optimise operations with AI-driven solutions that reduce inefficiencies and maximise productivity — document handling, reporting, scheduling, and risk-aware automation that fits how your organisation already works.

## Related services

Building a full product around intelligence? See [AI Product Development](/services/ai-product-development). Need visibility in search and AI answers? Pair agents with [SEO & AI Search Optimisation](/services/seo-ai-search-optimisation).
`),
    },
  ],
};

export const aiProductDevelopment: PageDefaults = {
  slug: "service-ai-product-development",
  path: "/services/ai-product-development",
  name: "AI Product Development",
  sections: [
    {
      __component: "sections.page-intro",
      title: "AI Product Development",
      lead: "We develop AI-powered solutions that automate, optimise, and scale businesses — from strategy and prototyping to production products.",
      body: md(`
Transform your business with award-winning AI solutions embedded in the products your customers and teams use every day. We design, build, and integrate intelligent features with the same craft we bring to websites and software platforms.

## AI applications & use cases

- AI-enhanced web and mobile applications
- eCommerce recommendations and personalisation
- Automated report generation and insights
- Image, video, and voice AI experiences
- Security-aware automation and monitoring helpers

## Integration for business applications

Seamlessly integrate AI into web apps, CRM, ERP, and internal tools — including Retrieval-Augmented Generation (RAG) systems and predictive analytics that stay grounded in your organisation's data.

## Related services

Need agents and workflow automation first? Visit [AI Agents & Automation](/services/ai-agents-automation). Building the product shell? Pair with [Web Application Development](/services/web-application-development) or [Mobile App Development](/services/mobile-app-development).
`),
    },
  ],
};
