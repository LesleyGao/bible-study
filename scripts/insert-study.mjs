#!/usr/bin/env node
// Insert a pre-written study (markdown file) into Supabase bible_study_content.
// Usage: node scripts/insert-study.mjs <Book> <chapter> <path-to-markdown>
//        node scripts/insert-study.mjs Genesis 28 scripts/studies/Genesis_28.md

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const book = process.argv[2];
const chapter = parseInt(process.argv[3], 10);
const filePath = process.argv[4];

if (!book || !chapter || !filePath) {
  console.error("Usage: node scripts/insert-study.mjs <Book> <chapter> <path-to-md>");
  process.exit(1);
}

const content = readFileSync(filePath, "utf8");
const words = content.split(/\s+/).filter(Boolean).length;

const { error } = await supabase
  .from("bible_study_content")
  .upsert({ book, chapter, content }, { onConflict: "book,chapter" });

if (error) {
  console.error("Save failed:", error.message);
  process.exit(1);
}
console.log(`Saved ${book} ${chapter} (${words} words)`);
