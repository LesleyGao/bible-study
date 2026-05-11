#!/usr/bin/env node
// Fetch an existing study (markdown content) from Supabase bible_study_content.
// Usage: node scripts/fetch-study.mjs <Book> <chapter> [out-path]
//        node scripts/fetch-study.mjs "1 Corinthians" 11 scripts/studies/1\ Corinthians_11.md
// If out-path omitted, defaults to scripts/studies/<Book>_<chapter>.md

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local"), quiet: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const book = process.argv[2];
const chapter = parseInt(process.argv[3], 10);
const outPath = process.argv[4] || join(__dirname, "studies", `${book}_${chapter}.md`);

if (!book || !chapter) {
  console.error("Usage: node scripts/fetch-study.mjs <Book> <chapter> [out-path]");
  process.exit(1);
}

const { data, error } = await supabase
  .from("bible_study_content")
  .select("content")
  .eq("book", book)
  .eq("chapter", chapter)
  .single();

if (error || !data) {
  console.error(`Not found: ${book} ${chapter}${error ? " — " + error.message : ""}`);
  process.exit(1);
}

writeFileSync(outPath, data.content, "utf8");
const words = data.content.split(/\s+/).filter(Boolean).length;
console.log(`Fetched ${book} ${chapter} -> ${outPath} (${words} words)`);
