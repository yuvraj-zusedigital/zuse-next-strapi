/**
 * Downloads every CDN asset the site's code references (`${CDN_URL}/…` in
 * app, components, lib and content) into public/cdn, for working offline.
 * Then set NEXT_PUBLIC_CDN_URL=/cdn in .env.local and restart the dev server.
 *
 *   npm run cdn:mirror
 *
 * Already-downloaded files are skipped. public/cdn is git-ignored.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = "https://d13fy5c8tglk2k.cloudfront.net";
const OUT = path.join(ROOT, "public", "cdn");
const DIRS = ["app", "components", "lib", "content"];

/** Assets built from a variable, which a text scan can't see. */
const EXTRA = [1, 2, 3, 4, 5, 6].map((n) => `/images/serv-process-rod-${n}.svg`);

function* sourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(tsx?|mjs|js)$/.test(entry.name)) yield full;
  }
}

const paths = new Set(EXTRA);
for (const dir of DIRS) {
  for (const file of sourceFiles(path.join(ROOT, dir))) {
    const text = fs.readFileSync(file, "utf8");
    // `${CDN_URL}/images/x.png` and, via `const CF = \`${CDN_URL}/images\``, `${CF}/x.png`
    for (const match of text.matchAll(/\$\{CDN_URL\}(\/[^`"'\s)]*)/g)) paths.add(match[1]);
    for (const constant of text.matchAll(/const (\w+) = `\$\{CDN_URL\}(\/[^`]*)`/g)) {
      for (const use of text.matchAll(new RegExp(`\\$\\{${constant[1]}\\}(\\/[^\`"'\\s)]*)`, "g"))) paths.add(constant[2] + use[1]);
    }
  }
}

const wanted = [...paths].filter((p) => !p.includes("${") && /\.[a-z0-9]+$/i.test(p));
let downloaded = 0;
let skipped = 0;
const failed = [];
for (const asset of wanted) {
  const target = path.join(OUT, decodeURIComponent(asset));
  if (!target.startsWith(OUT + path.sep)) continue;
  if (fs.existsSync(target)) {
    skipped += 1;
    continue;
  }
  try {
    const response = await fetch(SOURCE + asset);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
  } catch (error) {
    failed.push(`${asset} (${error.message})`);
  }
}

console.log(`${wanted.length} assets: ${downloaded} downloaded, ${skipped} already there, ${failed.length} failed.`);
for (const line of failed) console.log(`  ! ${line}`);
if (failed.length) process.exitCode = 1;
