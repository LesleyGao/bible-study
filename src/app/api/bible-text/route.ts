export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const passage = searchParams.get("q"); // e.g. "Genesis 1"

  if (!passage) {
    return Response.json({ error: "Missing ?q= parameter" }, { status: 400 });
  }

  const apiKey = process.env.ESV_API_KEY;

  if (apiKey) {
    // ─── ESV API ───
    try {
      const res = await fetch(
        `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(passage)}` +
          `&include-passage-references=false` +
          `&include-verse-numbers=true` +
          `&include-footnotes=false` +
          `&include-footnote-body=false` +
          `&include-headings=false` +
          `&include-short-copyright=false` +
          `&indent-paragraphs=0` +
          `&indent-poetry=false`,
        {
          headers: { Authorization: `Token ${apiKey}` },
        }
      );

      if (!res.ok) throw new Error(`ESV API error: ${res.status}`);

      const data = await res.json();
      const text = data.passages?.[0] || "";

      // Parse "[1] In the beginning..." into verse objects
      const verses: { verse: number; text: string }[] = [];
      const parts = text.split(/\[(\d+)\]\s*/);

      // parts = ["", "1", "In the beginning...", "2", "The earth was...", ...]
      for (let i = 1; i < parts.length; i += 2) {
        const verseNum = parseInt(parts[i], 10);
        const verseText = (parts[i + 1] || "").trim();
        if (verseText) {
          verses.push({ verse: verseNum, text: verseText });
        }
      }

      return Response.json({
        translation: "ESV",
        verses,
        text: text.trim(),
      });
    } catch (err) {
      console.error("ESV API failed, falling back to WEB:", err);
    }
  }

  // ─── Fallback: bible-api.com (WEB translation) ───
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(passage)}?translation=web`
    );
    if (!res.ok) throw new Error("bible-api.com error");
    const data = await res.json();

    return Response.json({
      translation: "WEB",
      verses: (data.verses || []).map((v: { verse: number; text: string }) => ({
        verse: v.verse,
        text: v.text.trim(),
      })),
      text: data.text || "",
    });
  } catch {
    return Response.json({ error: "Failed to load passage" }, { status: 500 });
  }
}
