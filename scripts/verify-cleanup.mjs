#!/usr/bin/env node
// Verification pass for the identity-critical cleanup + Wright sweep.
// (1) residual identity-critical references: flags chapters still mentioning the schools/names we meant to cut.
// (2) NT Wright coverage: flags NT chapters with no "Wright" mention.
// (3) length: flags chapters <2400 or >4000 words.
// Usage: node scripts/verify-cleanup.mjs

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local"), quiet: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const NT = new Set([
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation",
]);

// Names/phrases that, if still present, likely indicate an uncut identity-critical reading.
// (Some — Levine, Carol Meyers, Phyllis Bird, Frymer-Kensky, Bauckham's Gospel Women, Newsom, Coakley,
//  Reis, the complementarian/egalitarian roster, "patriarchal/patriarchy" — are LEGITIMATELY kept in
//  many places, so we report counts and let a human eyeball the list.)
const HARD = /\bfeminist\b|\bwomanist\b|\bmujerista\b|liberation theolog|liberationist|\bpostcolonial\b|post-colonial|Schüssler|Schussler|Fiorenza|Mieke Bal|Cheryl Exum|\bGale Yee\b|Athalya Brenner|Susanne Scholz|Wilda Gafney|Renita Weems|Elsa Tamez|Musa Dube|Kwok Pui|Sugirtharajah|Rosemary Radford|Letty Russell|Sallie McFague|Elisabeth Sch|Tina Pippin|Catherine Keller|Antoinette Wire|Marcia Falk|Joseph Marchal|Delores Williams|Gustavo Guti[ée]rrez|Jon Sobrino|Leonardo Boff|James Cone|Naim Ateek|Pablo Richard|Brigitte Kahl|Texts of Terror|In Memory of Her|Battered Love|Death and Dissymmetry|Death and Desire|Womanist Midrash|Trible/i;
// "Phyllis Trible" specifically (Trible alone could be a false-ish positive but is on the cut list)
const TRIBLE = /\bTrible\b/;

const pageSize = 200;
let from = 0;
const residual = [];
const ntNoWright = [];
const lengthOdd = [];
let total = 0, ntTotal = 0;
for (;;) {
  const { data, error } = await supabase
    .from("bible_study_content")
    .select("book,chapter,content")
    .order("book").order("chapter")
    .range(from, from + pageSize - 1);
  if (error) { console.error("query error", error.message); process.exit(1); }
  if (!data || data.length === 0) break;
  for (const r of data) {
    total++;
    const wc = r.content.split(/\s+/).filter(Boolean).length;
    const m = r.content.match(HARD);
    if (m) {
      // collect a few distinct hits
      const hits = [...new Set((r.content.match(new RegExp(HARD.source, "gi")) || []).map(s => s.toLowerCase()))].slice(0, 6);
      residual.push({ book: r.book, chapter: r.chapter, hits });
    } else if (TRIBLE.test(r.content)) {
      residual.push({ book: r.book, chapter: r.chapter, hits: ["trible"] });
    }
    if (NT.has(r.book)) {
      ntTotal++;
      if (!/\bWright\b/.test(r.content)) ntNoWright.push(`${r.book} ${r.chapter}`);
    }
    if (wc < 2400 || wc > 4000) lengthOdd.push(`${r.book} ${r.chapter} (${wc})`);
  }
  from += pageSize;
  if (data.length < pageSize) break;
}

console.log(`Scanned ${total} chapters (${ntTotal} NT).`);
console.log(`\n=== RESIDUAL identity-critical references: ${residual.length} chapters ===`);
for (const x of residual) console.log(`  ${x.book} ${x.chapter}: ${x.hits.join(", ")}`);
console.log(`\n=== NT chapters with NO "Wright" mention: ${ntNoWright.length} ===`);
console.log("  " + ntNoWright.join(" | "));
console.log(`\n=== Chapters <2400 or >4000 words: ${lengthOdd.length} ===`);
console.log("  " + lengthOdd.join(" | "));
