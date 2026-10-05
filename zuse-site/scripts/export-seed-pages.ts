/**
 * Writes the built-in page content (content/pages) to the Strapi seed file:
 *   npx tsx scripts/export-seed-pages.ts
 * then, in the Strapi project: npm run cms:seed-pages
 */

import { writeFileSync } from "fs";
import path from "path";
import * as ai from "@/content/pages/ai";
import * as company from "@/content/pages/company";
import * as legal from "@/content/pages/legal";
import * as contact from "@/content/pages/contact";
import * as home from "@/content/pages/home";
import * as listings from "@/content/pages/listings";
import * as services from "@/content/pages/services";
import * as zanyar from "@/content/pages/zanyar";

const out = path.join(__dirname, "..", "..", "scripts", "seed-data", "pages.json");
const pages = [home, services, ai, company, legal, contact, listings, zanyar].flatMap((module) => Object.values(module));
writeFileSync(out, JSON.stringify(pages, null, 2) + "\n");
console.log(`${pages.length} pages → ${out}`);
