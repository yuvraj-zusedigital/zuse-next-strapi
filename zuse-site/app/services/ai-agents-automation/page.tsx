import SectionsPage from "@/components/sections/SectionsPage";
import { aiAgentsAutomation } from "@/content/pages/ai";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "AI Agents & Automation | Zuse Digital",
  description:
    "Framework-agnostic AI agents and workflow automation from Zuse Digital — streamline operations with intelligent systems built for real business use.",
  path: "/services/ai-agents-automation",
  keywords: [
    "AI agents",
    "workflow automation",
    "agentic AI",
    "AI automation australia",
    "zuse digital AI agents",
  ],
  ogImage: "/images/og-ai-agents.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata(
    ["service-ai-agents-automation", "service-artificial-intelligence"],
    FALLBACKS
  );
}

export default async function AiAgentsAutomationPage() {
  const dedicated = await getStrapiPage("service-ai-agents-automation");
  // Prefer dedicated CMS JSON-LD; never reuse parent AI-page schema on this URL.
  const jsonLd = dedicated
    ? resolvePageJsonLd(
        dedicated.seo,
        buildWebPageJsonLd({
          name: FALLBACKS.title,
          description: FALLBACKS.description,
          path: FALLBACKS.path,
        })
      )
    : [
        buildWebPageJsonLd({
          name: FALLBACKS.title,
          description: FALLBACKS.description,
          path: FALLBACKS.path,
        }),
      ];

  return <SectionsPage sections={await getPageSections(aiAgentsAutomation)} jsonLd={jsonLd} />;
}
