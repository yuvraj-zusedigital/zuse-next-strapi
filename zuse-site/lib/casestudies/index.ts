import type { CaseStudy } from "./types";
import komodoWebsites from "./data/komodo-websites";
import runwayWebsites from "./data/runway-websites";
import simonWestEcommerceWebsite from "./data/simon-west-ecommerce-website";
import louisVuittonWebApplication from "./data/louis-vuitton-web-application";
import viktrsWebApplication from "./data/viktrs-web-application";
import jabriWebApplication from "./data/jabri-web-application";
import rwwWebApplication from "./data/rww-web-application";
import albyaWebApplication from "./data/albya-web-application";
import aflPlayersMojiMobileApplication from "./data/afl-players-moji-mobile-application";
import warnieMojiMobileApplication from "./data/warnie-moji-mobile-application";
import c19MobileApplication from "./data/c19-mobile-application";

export const CASE_STUDIES: CaseStudy[] = [
  komodoWebsites,
  runwayWebsites,
  simonWestEcommerceWebsite,
  louisVuittonWebApplication,
  viktrsWebApplication,
  jabriWebApplication,
  rwwWebApplication,
  albyaWebApplication,
  aflPlayersMojiMobileApplication,
  warnieMojiMobileApplication,
  c19MobileApplication,
];

export function getCaseStudy(
  category: string,
  slug: string
): CaseStudy | undefined {
  return CASE_STUDIES.find(
    (s) => s.category === category && s.slug === slug
  );
}

export function getAllCaseStudyParams() {
  return CASE_STUDIES.map((s) => ({
    category: s.category,
    slug: s.slug,
  }));
}
