/**
 * Writes the built-in case studies (lib/casestudies) to the Strapi seed file:
 *   npx tsx scripts/export-seed-case-studies.ts
 * then, in the Strapi project: npm run cms:seed-case-studies
 */

import { writeFileSync } from "fs";
import path from "path";
import { CASE_STUDIES } from "@/lib/casestudies";

const out = path.join(__dirname, "..", "..", "scripts", "seed-data", "case-studies.json");
writeFileSync(out, JSON.stringify(CASE_STUDIES, null, 2) + "\n");
console.log(`${CASE_STUDIES.length} case studies → ${out}`);
