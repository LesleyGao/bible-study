import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSharedMode = !!supabase;

// ─── Progress ───

export async function loadAllProgress(): Promise<
  Record<string, { lesley: number[]; kelvin: number[] }>
> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("bible_progress").select("*");
  if (error) console.error("loadAllProgress error:", error.message);
  if (!data) return {};

  const progress: Record<string, { lesley: number[]; kelvin: number[] }> = {};
  for (const row of data) {
    if (!progress[row.book]) progress[row.book] = { lesley: [], kelvin: [] };
    const key = row.user_name.toLowerCase() as "lesley" | "kelvin";
    if (!progress[row.book][key].includes(row.chapter)) {
      progress[row.book][key].push(row.chapter);
    }
  }
  return progress;
}

export async function markChapterRead(
  userName: string,
  book: string,
  chapter: number
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("bible_progress")
    .upsert(
      { user_name: userName, book, chapter },
      { onConflict: "user_name,book,chapter" }
    );
  if (error) console.error("markChapterRead error:", error.message);
}

export async function unmarkChapterRead(
  userName: string,
  book: string,
  chapter: number
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("bible_progress")
    .delete()
    .eq("user_name", userName)
    .eq("book", book)
    .eq("chapter", chapter);
  if (error) console.error("unmarkChapterRead error:", error.message);
}

// ─── Reflection Prompts ───

export async function getStoredPrompt(
  book: string,
  chapter: number
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("bible_reflection_prompts")
    .select("prompt")
    .eq("book", book)
    .eq("chapter", chapter)
    .single();
  if (error && error.code !== "PGRST116") console.error("getStoredPrompt error:", error.message);
  return data?.prompt || null;
}

export async function storePrompt(
  book: string,
  chapter: number,
  prompt: string
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("bible_reflection_prompts")
    .upsert({ book, chapter, prompt }, { onConflict: "book,chapter" });
  if (error) console.error("storePrompt error:", error.message);
}

// ─── Reflections ───

export async function getReflections(
  book: string,
  chapter: number
): Promise<{ lesley?: string; kelvin?: string }> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("bible_reflections")
    .select("user_name, content")
    .eq("book", book)
    .eq("chapter", chapter);
  if (error) console.error("getReflections error:", error.message);

  const result: { lesley?: string; kelvin?: string } = {};
  if (data) {
    for (const row of data) {
      const key = row.user_name.toLowerCase() as "lesley" | "kelvin";
      result[key] = row.content;
    }
  }
  return result;
}

export async function saveReflection(
  userName: string,
  book: string,
  chapter: number,
  content: string
) {
  if (!supabase) return;
  const { error } = await supabase.from("bible_reflections").upsert(
    { user_name: userName, book, chapter, content },
    { onConflict: "user_name,book,chapter" }
  );
  if (error) console.error("saveReflection error:", error.message);
}

// ─── Prayer Board ───

export interface Prayer {
  id: string;
  user_name: string;
  content: string;
  is_answered: boolean;
  partner_praying: boolean;
  created_at: string;
  answered_at?: string;
}

export async function loadPrayers(): Promise<Prayer[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bible_prayers")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Prayer[]) || [];
}

export async function addPrayer(
  userName: string,
  content: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bible_prayers").insert({ user_name: userName, content });
  if (error) console.error("addPrayer error:", error.message);
}

export async function togglePrayingFor(
  prayerId: string,
  praying: boolean
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("bible_prayers")
    .update({ partner_praying: praying })
    .eq("id", prayerId);
  if (error) console.error("togglePrayingFor error:", error.message);
}

export async function markPrayerAnswered(
  prayerId: string,
  answered: boolean
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("bible_prayers")
    .update({
      is_answered: answered,
      answered_at: answered ? new Date().toISOString() : null,
    })
    .eq("id", prayerId);
  if (error) console.error("markPrayerAnswered error:", error.message);
}

// ─── Highlights ───

export interface Highlight {
  id: string;
  user_name: string;
  book: string;
  chapter: number;
  verse: number;
  verse_end?: number;
  verse_text: string;
  note?: string;
  created_at: string;
}

export async function loadChapterHighlights(
  book: string,
  chapter: number
): Promise<Highlight[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bible_highlights")
    .select("*")
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });
  return (data as Highlight[]) || [];
}

export async function loadAllHighlights(): Promise<Highlight[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bible_highlights")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Highlight[]) || [];
}

export async function saveHighlight(
  userName: string,
  book: string,
  chapter: number,
  verse: number,
  verseEnd: number | null,
  verseText: string,
  note: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bible_highlights").upsert(
    {
      user_name: userName,
      book,
      chapter,
      verse,
      verse_end: verseEnd && verseEnd > verse ? verseEnd : null,
      verse_text: verseText,
      note,
    },
    { onConflict: "user_name,book,chapter,verse" }
  );
  if (error) console.error("saveHighlight error:", error.message);
}

export async function removeHighlight(highlightId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bible_highlights").delete().eq("id", highlightId);
  if (error) console.error("removeHighlight error:", error.message);
}

// ─── Gratitude ───

export async function getGratitude(
  book: string,
  chapter: number
): Promise<{ lesley?: string; kelvin?: string }> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("bible_gratitude")
    .select("user_name, content")
    .eq("book", book)
    .eq("chapter", chapter);
  if (error) console.error("getGratitude error:", error.message);

  const result: { lesley?: string; kelvin?: string } = {};
  if (data) {
    for (const row of data) {
      const key = row.user_name.toLowerCase() as "lesley" | "kelvin";
      result[key] = row.content;
    }
  }
  return result;
}

export async function saveGratitude(
  userName: string,
  book: string,
  chapter: number,
  content: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bible_gratitude").upsert(
    { user_name: userName, book, chapter, content },
    { onConflict: "user_name,book,chapter" }
  );
  if (error) console.error("saveGratitude error:", error.message);
}

export interface GratitudeEntry {
  id: string;
  user_name: string;
  book: string;
  chapter: number;
  content: string;
  created_at: string;
}

export async function loadAllGratitude(): Promise<GratitudeEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("bible_gratitude")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as GratitudeEntry[]) || [];
}

// ─── Study Content Cache ───

export async function getStudyContent(
  book: string,
  chapter: number
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("bible_study_content")
    .select("content")
    .eq("book", book)
    .eq("chapter", chapter)
    .single();
  if (error && error.code !== "PGRST116") console.error("getStudyContent error:", error.message);
  return data?.content || null;
}

export async function saveStudyContent(
  book: string,
  chapter: number,
  content: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("bible_study_content").upsert(
    { book, chapter, content },
    { onConflict: "book,chapter" }
  );
  if (error) console.error("saveStudyContent error:", error.message);
}

// ─── Bookmarks ───

export interface Bookmark {
  id: string;
  user_name: string;
  book: string;
  chapter: number;
  note?: string;
  created_at: string;
}

export async function loadBookmarks(userName?: string): Promise<Bookmark[]> {
  if (!supabase) return [];
  let query = supabase
    .from("bible_bookmarks")
    .select("*")
    .order("created_at", { ascending: false });
  if (userName) query = query.eq("user_name", userName);
  const { data } = await query;
  return (data as Bookmark[]) || [];
}

export async function addBookmark(
  userName: string,
  book: string,
  chapter: number,
  note: string
): Promise<string | null> {
  if (!supabase) return "No database connection";
  const { error } = await supabase.from("bible_bookmarks").upsert(
    { user_name: userName, book, chapter, note },
    { onConflict: "user_name,book,chapter" }
  );
  if (error) {
    console.error("addBookmark error:", error.message);
    return error.message;
  }
  return null;
}

export async function removeBookmark(
  userName: string,
  book: string,
  chapter: number
): Promise<string | null> {
  if (!supabase) return "No database connection";
  const { error } = await supabase
    .from("bible_bookmarks")
    .delete()
    .eq("user_name", userName)
    .eq("book", book)
    .eq("chapter", chapter);
  if (error) {
    console.error("removeBookmark error:", error.message);
    return error.message;
  }
  return null;
}

// ─── Weekly Data (for recap) ───

export async function getWeeklyData(since: string) {
  if (!supabase) return { progress: [], reflections: [], gratitude: [] };

  const [progress, reflections, gratitude] = await Promise.all([
    supabase
      .from("bible_progress")
      .select("*")
      .gte("read_at", since)
      .order("read_at", { ascending: true }),
    supabase
      .from("bible_reflections")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: true }),
    supabase
      .from("bible_gratitude")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: true }),
  ]);

  return {
    progress: progress.data || [],
    reflections: reflections.data || [],
    gratitude: gratitude.data || [],
  };
}
