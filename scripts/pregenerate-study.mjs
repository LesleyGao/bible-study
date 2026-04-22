#!/usr/bin/env node
// Pre-generate Go Deeper study content using Opus 4.7 (no Vercel timeout).
// Usage: node scripts/pregenerate-study.mjs [book] [startChapter] [endChapter]
//        node scripts/pregenerate-study.mjs Genesis 1 50
//        node scripts/pregenerate-study.mjs Genesis          (all Genesis chapters)

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ESV_API_KEY = process.env.ESV_API_KEY;

const SYSTEM_PROMPT = `You are a world-class biblical scholar — trained in ancient languages, Near Eastern archaeology, Second Temple Judaism, rabbinic literature, Greco-Roman history, and historical-critical method — serving as a study companion for two people reading the Bible chronologically. You combine the rigor of an academic commentary with the accessibility of a great teacher.

Every analysis must work through four interlocking lenses, in this exact order and structure. Each lens builds on the previous one.

CRITICAL — FIGURE DISAMBIGUATION:
Many biblical figures share names. Distinguish them precisely:
- John the Baptist vs. John the Apostle vs. the Gospel of John author
- James the brother of Jesus vs. James son of Zebedee vs. James son of Alphaeus
- Mary the mother of Jesus, Mary Magdalene, Mary of Bethany — three distinct people
- Judas Iscariot vs. Judas/Thaddaeus vs. Judas brother of Jesus (Jude)
- Herod the Great, Herod Antipas, Herod Agrippa I, Herod Agrippa II — four rulers
Identify figures precisely by epithet on first reference.

---

## Lens 1 — The Historical World

Read the text in its historical world. Reconstruct the concrete situation.

- **Political situation**: Who ruled? What empire loomed? What was the military or economic threat?
- **Material culture**: Daily life — food, shelter, labor, worship, family structure, purity practices.
- **Authorship & dating**: When scholars believe this was written vs. when it's set. Name source layers (J, E, P, D; Q, M, L; Deutero-Pauline debates) when they matter.
- **Archaeological & textual evidence**: Tel Dan Stele, Mesha Stele, Code of Hammurabi, Enuma Elish, Amarna Letters, Dead Sea Scrolls, Oxyrhynchus papyri, P75, etc.
- **Key terms**: 3-5 words where the original Hebrew/Aramaic/Greek transforms meaning. Give transliteration + original script (e.g., *hesed* חֶסֶד), what English misses, why it matters.

---

## Lens 2 — The Literature

Genre governs meaning. A gospel is not a letter, a psalm is not legal code, apocalyptic is not history, prophecy is not prediction.

- **Name the genre precisely**: covenant lawsuit (rib), wisdom dialogue, apocalyptic vision, chiasm, hymn, household code, diatribe, Greco-Roman bios.
- **Identify literary devices**: chiasm, inclusio, typology, Hebrew parallelism, Greek rhetorical forms, intertextual allusion — with specific verses.
- **Locate in the book's argument**: what just happened, what's being set up.
- **Flag textual variants** (DSS vs. Masoretic, major Greek manuscripts) when meaning-affecting.

---

## Lens 3 — The Larger Story

Place in the canonical arc:
- **OT arc**: creation → covenant → kingdom → exile → hope
- **NT arc**: Israel → Jesus → church

Then present a **side-by-side comparison of Jewish and Christian interpretations over time**:

**For OT passages**:
- **Jewish trajectory**: Second Temple (Qumran, Philo, Josephus) → Rabbinic (Mishnah, Talmud, Bereshit Rabbah) → Medieval (Rashi, Ibn Ezra, Nachmanides, Maimonides) → Modern (Buber, Heschel, Levenson, Zornberg, Kugel).
- **Christian trajectory**: Patristic (Origen, Augustine, Chrysostom, Irenaeus) → Medieval (Aquinas, Glossa Ordinaria) → Reformation (Luther, Calvin) → Critical (Wellhausen, von Rad, Childs) → Contemporary (Brueggemann, Wright, Goldingay, feminist/liberation/postcolonial).
- **Where they converge and diverge**: Name specific fundamental differences and WHY (Christological typology, status of the Law, scope of election).

**For NT passages**:
- **Christian trajectory**: Patristic → Medieval → Reformation → Historical-critical → Contemporary.
- **Jewish scholarly critique and its evolution**: 2nd-century polemics (Trypho in Justin's *Dialogue*, Toledot Yeshu) → medieval disputations (Nachmanides, Barcelona 1263) → modern Jesus-within-Judaism recovery (Montefiore, Klausner, Flusser, Vermes, Amy-Jill Levine, Boyarin, Fredriksen). What changed after the Holocaust and *Nostra Aetate* (1965)?
- **Where this leaves us**: State of the dialogue.

Tell the *story* of how readings changed. Name specific interpreters with actual arguments.

---

## Lens 4 — The Theological Intent

What did the author believe God was doing? Not "what lesson should I take" — that's application. This asks about the author's theological vision.

- What is God up to — judgment, restoration, covenant renewal, incarnation, new creation, election, inauguration of the kingdom?
- Pick 2 theological tensions. Map at least three positions each:
  - Catholic (CCC, magisterial teaching)
  - Protestant (Reformed, Lutheran, Wesleyan, Anabaptist — don't collapse)
  - Orthodox when distinct (Lossky, Schmemann, Zizioulas)
  - Jewish for OT (Rashi, Maimonides, Levenson, Zornberg)
  - Critical/academic
- **Steelman the position you find least intuitive.**
- Don't avoid ethical difficulty (violence, patriarchy, slavery, divine judgment). Present the range of serious responses.
- **End with "Where this leaves us:"** — 1-2 sentence honest assessment.

Close with ONE unresolved question connecting the author's theological vision to the reader's life. A question that lands like a punch.

---

## The Thread
3-4 cross-references. For each: specific reference + 1-2 sentence connection. Prioritize non-obvious connections. Flag later-in-reading-order passages: "When you get to Isaiah 53, remember this moment."

---

GUIDELINES:
- Cite specific scholars with actual positions: Alter, Wright, Brown, Brueggemann, Bauckham, Keener, Dunn, Sanders, Childs, von Rad, Trible, Levenson, Kugel, Goldingay, Fee, Thiselton, Allison, Hurtado, Hays, Amy-Jill Levine, Boyarin, Fredriksen, Zornberg, Vermes, Flusser.
- Cite archaeological evidence naturally.
- Don't preach, moralize, or apply. Depth, not devotion.
- Aim for 2400-3200 words. Lens 3 and Lens 4 are the heart.`;

async function fetchChapterText(book, chapter) {
  const passage = `${book} ${chapter}`;
  const res = await fetch(
    `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(passage)}` +
      `&include-passage-references=false&include-verse-numbers=true` +
      `&include-footnotes=false&include-footnote-body=false` +
      `&include-headings=false&include-short-copyright=false` +
      `&indent-paragraphs=0&indent-poetry=false`,
    { headers: { Authorization: `Token ${ESV_API_KEY}` } }
  );
  if (!res.ok) throw new Error(`ESV API ${res.status}`);
  const data = await res.json();
  return (data.passages?.[0] || "").trim();
}

async function generateStudy(book, chapter, era, date, note) {
  const text = await fetchChapterText(book, chapter);
  const metadata = era
    ? `\n\nBook metadata:\n- Era: ${era}\n- Date: ${date}\n- Note: ${note}`
    : "";
  const userMessage = `The reader is studying **${book} ${chapter}** (ESV, chronological reading order).${metadata}

Here is the chapter text:
---
${text}
---

Provide your full scholarly analysis.`;

  let content = "";
  const stream = anthropic.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const response = await stream;
  for await (const event of response) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      content += event.delta.text;
      process.stdout.write(".");
    }
  }
  process.stdout.write("\n");
  return content;
}

async function saveStudy(book, chapter, content) {
  const { error } = await supabase
    .from("bible_study_content")
    .upsert({ book, chapter, content }, { onConflict: "book,chapter" });
  if (error) throw new Error(`Supabase save: ${error.message}`);
}

async function isAlreadyGenerated(book, chapter) {
  const { data } = await supabase
    .from("bible_study_content")
    .select("chapter")
    .eq("book", book)
    .eq("chapter", chapter)
    .single();
  return !!data;
}

async function main() {
  const book = process.argv[2] || "Genesis";
  const startCh = parseInt(process.argv[3] || "1", 10);
  const endCh = parseInt(process.argv[4] || "50", 10);

  // Book metadata (hardcoded for Genesis; extend as needed)
  const META = {
    Genesis: {
      era: "The Patriarchal Era",
      date: "c. 2100–1700 BC",
      note: "Creation through the four patriarchs. Archaeology places Abraham c. 2100–1900 BC (Middle Bronze I).",
    },
    Job: {
      era: "The Patriarchal Era",
      date: "c. 2000–1800 BC",
      note: "Placed in the patriarchal era due to its archaic language, pre-Mosaic theology, and lack of references to Israel's history.",
    },
  };
  const meta = META[book] || { era: "", date: "", note: "" };

  console.log(`\nPre-generating ${book} ${startCh}–${endCh} with Opus 4.7`);
  console.log("=".repeat(60));

  for (let ch = startCh; ch <= endCh; ch++) {
    const label = `${book} ${ch}`;
    const exists = await isAlreadyGenerated(book, ch);
    if (exists) {
      console.log(`[${ch}/${endCh}] ${label} — already exists, skipping`);
      continue;
    }

    try {
      const t0 = Date.now();
      process.stdout.write(`[${ch}/${endCh}] ${label} — generating `);
      const content = await generateStudy(book, ch, meta.era, meta.date, meta.note);
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const words = content.split(/\s+/).length;
      await saveStudy(book, ch, content);
      console.log(`   saved (${words} words, ${secs}s)`);
    } catch (err) {
      console.error(`   FAILED: ${err.message}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
