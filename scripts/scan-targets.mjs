#!/usr/bin/env node
// Scan bible_study_content for chapters needing the cleanup pass:
//   (a) any NT chapter (Wright-coverage sweep), OR
//   (b) any chapter whose content mentions feminist/womanist/liberation/postcolonial material.
// Emits a JSON array of {book, chapter, reasons:[...], wordcount} to stdout (and a count summary to stderr).
// Usage: node scripts/scan-targets.mjs > scripts/tmp/targets.json

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

// identity-critical interpretive material
const IDCRIT = /\bfeminist\b|\bwomanist\b|\bmujerista\b|liberation theolog|\bpostcolonial\b|post-colonial|liberationist|\bTrible\b|Schüssler|Schussler|Fiorenza|\bGafney\b|Renita Weems|Elsa Tamez|Musa Dube|Sugirtharajah|Kwok Pui|\bRuether\b|Rosemary Radford|Letty Russell|Sallie McFague|\bceci\b/i;

// Wright detection (already-covered NT chapters can be skipped for the Wright add, but still scanned for idcrit)
const WRIGHT = /N\.\s?T\.\s?Wright|N\.T\. Wright|\bWright\b/;

const pageSize = 200;
let from = 0;
const out = [];
let total = 0;
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
    const reasons = [];
    const isNT = NT.has(r.book);
    const hasIdcrit = IDCRIT.test(r.content);
    const hasWright = WRIGHT.test(r.content);
    if (hasIdcrit) reasons.push("idcrit");
    if (isNT) reasons.push("nt");
    if (isNT && !hasWright) reasons.push("nt-no-wright");
    if (reasons.length) {
      out.push({ book: r.book, chapter: r.chapter, reasons, wordcount: r.content.split(/\s+/).filter(Boolean).length });
    }
  }
  from += pageSize;
  if (data.length < pageSize) break;
}

const idcritCount = out.filter(o => o.reasons.includes("idcrit")).length;
const ntCount = out.filter(o => o.reasons.includes("nt")).length;
const ntNoWright = out.filter(o => o.reasons.includes("nt-no-wright")).length;
console.error(`Scanned ${total} chapters. Targets: ${out.length} (idcrit=${idcritCount}, nt=${ntCount}, nt-without-wright=${ntNoWright})`);
process.stdout.write(JSON.stringify(out, null, 0));
