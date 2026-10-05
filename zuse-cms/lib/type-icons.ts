import { Award, Braces, Briefcase, FileText, FolderTree, MessageSquareQuote, Newspaper, PanelsTopLeft, Settings2, UserRound, type LucideIcon } from "lucide-react";

/** Icon per content type (sidebar, dashboard). */
const ICONS: Record<string, LucideIcon> = {
  page: FileText,
  project: Briefcase,
  blog: Newspaper,
  testimonial: MessageSquareQuote,
  award: Award,
  author: UserRound,
  "project-category": FolderTree,
  global: PanelsTopLeft,
  "organization-setting": Settings2,
  "text-snippet": Braces,
};

export const typeIcon = (slug: string): LucideIcon => ICONS[slug] ?? FileText;
