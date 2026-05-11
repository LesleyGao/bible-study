# Bible Study Cleanup Pass — Agent Instructions

You are editing already-written scholarly Bible-study analyses stored in Supabase. You will be given a **batch file** listing chapters as tab-separated lines: `Book<TAB>Chapter<TAB>reasons`. Process **every line**. Work one chapter at a time, end to end. Do NOT hold multiple full analyses in context — finish and insert each before starting the next.

Working directory for all commands: `c:/Users/lesle/claude-project/bible-study`

## Per-chapter loop

### 1. Fetch the current text from Supabase
Use a temp path with **no spaces** in the filename:
```
node scripts/fetch-study.mjs "<Book>" <Chapter> scripts/tmp/work/<BookNoSpaces>_<Chapter>.md
```
e.g. `node scripts/fetch-study.mjs "1 Samuel" 1 scripts/tmp/work/1Samuel_1.md`
(Create `scripts/tmp/work/` first with `mkdir -p scripts/tmp/work`.)

Read the file.

### 2. Apply TWO edits

**EDIT A — Remove all identity-critical interpretive material.** Strip every reference to feminist, womanist, *mujerista*, liberation-theology, and postcolonial biblical interpretation, including the named scholars when they are cited *as exponents of those schools or for a gendered/identity reading*:
- Phyllis Trible (*Texts of Terror*, *God and the Rhetoric of Sexuality*), Mieke Bal (*Death and Dissymmetry*, *Lethal Love*), J. Cheryl Exum, Gale Yee, Athalya Brenner, Susanne Scholz, Carol Meyers *when cited for a feminist reading* (see exception below), Phyllis Bird *when cited for a feminist reading*, Tikva Frymer-Kensky *when cited for a feminist reading*, Wilda Gafney, Renita Weems, Clarice Martin, Elsa Tamez, Ada María Isasi-Díaz, Musa Dube, Kwok Pui-lan, R.S. Sugirtharajah, Letty Russell, Rosemary Radford Ruether, Elisabeth Schüssler Fiorenza, Sallie McFague, Mary Daly, Phyllis Zagano *as an advocacy voice*, Catherine Kroeger *only* where she is cited as a feminist (keep her lexicographic/historical citations on *authentein* etc.), Gustavo Gutiérrez / Jon Sobrino / Leonardo Boff / Elsa Tamez *when cited as liberation-theology voices*, "the feminist hermeneutical tradition," "feminist biblical scholarship," "womanist reading," "postcolonial reading," "liberationist reading," etc.
- **Exception — keep, do NOT cut:** Amy-Jill Levine, Carol Meyers, Phyllis Bird, Tikva Frymer-Kensky when they are cited purely on **historical / archaeological / material-culture / Second-Temple-Jewish-context** grounds (e.g., Meyers on Israelite household economy, Levine on first-century Galilean Judaism). Cut them only where the citation is a gendered/feminist *reading of the text*. When in doubt about Meyers/Bird/Frymer-Kensky on a material-culture point, keep it.
- **Also keep, do NOT cut:** the *complementarian vs. egalitarian* debate in the Pastorals/Pauline texts (Belleville, Payne, Keener, Witherington, Marshall, McKnight, Köstenberger, Schreiner, Grudem, CBE, CBMW) — that is a mainstream theological debate, not an identity-critical school. Just remove any stray "/ feminist" label attached to the egalitarian side. Keep "patriarchy" / "patriarchal" as plain descriptive vocabulary where the prose uses it that way; only cut it when it tags a *feminist interpretive school*.
- Replace what you remove with the non-identity-critical scholarship **already present in the file or its obvious neighbors**: patristic (Origen, Chrysostom, Augustine, Jerome, Ambrose), medieval (Aquinas, Rashi, Radak, Ramban, Ibn Ezra), Reformation (Luther, Calvin), critical-historical (Wellhausen, Gunkel, von Rad, Westermann, Childs, Brueggemann, Alter, the major commentary series — Anchor, NICOT, WBC, Hermeneia, ICC), and contemporary mainstream (Wright, Goldingay, Wenham, Bauckham, Hurtado, Hays, Dunn, Sanders, Levenson, Sarna, Zornberg, Vermes, Boyarin, Fredriksen). The substantive *observations* the feminist readings made (e.g., "the narrator never names her," "the woman is given no speech," "this text depicts horrific violence") can usually be retained — just attribute them to the text itself or to a mainstream commentator (Block, Webb, Brueggemann, Alter) rather than to the feminist school. Patch the prose so every sentence flows; no dangling "—" , no orphaned "both books have become foundational," no half-sentences.

**EDIT B — Ensure N.T. Wright's view is present where he has a real published position.**
- For **New Testament** chapters: assume Wright has written on it (he has commentaries on every NT book in the *…for Everyone* series, plus *Jesus and the Victory of God*, *The Resurrection of the Son of God*, *Paul and the Faithfulness of God*, *The New Testament and the People of God*, *The Day the Revolution Began*, *Justification*, *Surprised by Hope*, *How God Became King*, *Paul: A Biography*). Find his actual position on *this* passage and make sure a sentence or two on it appears — best placed in Lens 3 (contemporary Christian trajectory) and/or in a Lens 4 tension. If the file already has a solid Wright treatment, leave it (or tighten it); do not duplicate. Anchor it to a real Wright argument (kingdom inaugurated, exile-and-return as the controlling story, justification as covenant-membership / law-court not moral-ladder, resurrection as bodily and world-changing, "heaven coming to earth," critique of both old-perspective Lutheran readings and of pure pluralism, Jesus as Israel's Messiah enacting YHWH's return to Zion, etc.). Do NOT invent a position; if you genuinely don't know Wright's specific take on a minor passage, give his framework-level read of the section it sits in.
- For **Old Testament** chapters: only add Wright if he genuinely has a relevant published view (e.g., Genesis 1–3 and new creation / temple-cosmology; the Exodus as the paradigm of redemption; Isaiah 40–55 on exile and the servant; Daniel 7 on the son of man; the Psalms as Israel's prayer book that Jesus prayed; Deuteronomy's covenant frame; the Babylonian exile as the unfinished story Jesus came to end). For most OT chapters Wright has **no** specific published view — in that case **do not add anything**. Never shoehorn him in.

### 3. Quality bar
- Keep the four-lens structure intact (Lens 1 Historical World, Lens 2 The Literature, Lens 3 The Larger Story, Lens 4 The Theological Intent, then "The Thread"). Don't drop a lens or a sub-section.
- Target length **2,600–3,800 words**. The originals run ~3,000–3,900; after the feminist cut you'll usually be a bit shorter, after the Wright add a bit longer — that's fine. Do not pad to hit a number; do not gut a lens.
- Prose, not bullets, for the body of each lens (bullets are allowed only for the position-lists under Lens 4 tensions, matching the existing file).
- Do not "preach" or add application. Match the existing register.
- Keep Hebrew/Greek terms, archaeological citations, manuscript references, and the figure-disambiguation already in the file.

### 4. Insert back to Supabase
```
node scripts/insert-study.mjs "<Book>" <Chapter> scripts/tmp/work/<BookNoSpaces>_<Chapter>.md
```
Confirm the "Saved … (NNNN words)" line.

### 5. After the whole batch, report — this format only, one line per chapter:
```
<Book> <Chapter> — N,NNN words. cut: <what feminist/etc material removed, or "none found">. wright: <what added, or "already present" or "n/a (OT)">.
```
If a chapter fails (fetch error, etc.), report the error on its line and continue. Do not retry failed chapters more than once.

## Notes
- `fetch-study.mjs` and `insert-study.mjs` already exist and have Supabase creds via `.env.local`. The dotenv banner line on stdout is harmless.
- `insert-study.mjs` is an upsert keyed on (book, chapter) — safe to re-run.
- Book names with spaces ("1 Samuel", "Song of Solomon", "1 Corinthians") must be quoted on the command line. Always write the temp .md to a **space-free** filename.
- If `fetch-study.mjs` says "Not found", the chapter isn't in the DB — skip it and note that on its report line.
