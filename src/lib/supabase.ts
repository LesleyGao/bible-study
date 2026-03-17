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
  const { data } = await supabase.from("bible_progress").select("*");
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
  await supabase
    .from("bible_progress")
    .upsert(
      { user_name: userName, book, chapter },
      { onConflict: "user_name,book,chapter" }
    );
}

export async function unmarkChapterRead(
  userName: string,
  book: string,
  chapter: number
) {
  if (!supabase) return;
  await supabase
    .from("bible_progress")
    .delete()
    .eq("user_name", userName)
    .eq("book", book)
    .eq("chapter", chapter);
}

// ─── Reflection Prompts ───

export async function getStoredPrompt(
  book: string,
  chapter: number
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("bible_reflection_prompts")
    .select("prompt")
    .eq("book", book)
    .eq("chapter", chapter)
    .single();
  return data?.prompt || null;
}

export async function storePrompt(
  book: string,
  chapter: number,
  prompt: string
) {
  if (!supabase) return;
  await supabase
    .from("bible_reflection_prompts")
    .upsert({ book, chapter, prompt }, { onConflict: "book,chapter" });
}

// ─── Reflections ───

export async function getReflections(
  book: string,
  chapter: number
): Promise<{ lesley?: string; kelvin?: string }> {
  if (!supabase) return {};
  const { data } = await supabase
    .from("bible_reflections")
    .select("user_name, content")
    .eq("book", book)
    .eq("chapter", chapter);

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
  await supabase.from("bible_reflections").upsert(
    { user_name: userName, book, chapter, content },
    { onConflict: "user_name,book,chapter" }
  );
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
  await supabase.from("bible_prayers").insert({ user_name: userName, content });
}

export async function togglePrayingFor(
  prayerId: string,
  praying: boolean
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("bible_prayers")
    .update({ partner_praying: praying })
    .eq("id", prayerId);
}

export async function markPrayerAnswered(
  prayerId: string,
  answered: boolean
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("bible_prayers")
    .update({
      is_answered: answered,
      answered_at: answered ? new Date().toISOString() : null,
    })
    .eq("id", prayerId);
}

// ─── Highlights ───

export interface Highlight {
  id: string;
  user_name: string;
  book: string;
  chapter: number;
  verse: number;
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
  verseText: string,
  note: string
): Promise<void> {
  if (!supabase) return;
  await supabase.from("bible_highlights").upsert(
    {
      user_name: userName,
      book,
      chapter,
      verse,
      verse_text: verseText,
      note,
    },
    { onConflict: "user_name,book,chapter,verse" }
  );
}

export async function removeHighlight(highlightId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("bible_highlights").delete().eq("id", highlightId);
}

// ─── Gratitude ───

export async function getGratitude(
  book: string,
  chapter: number
): Promise<{ lesley?: string; kelvin?: string }> {
  if (!supabase) return {};
  const { data } = await supabase
    .from("bible_gratitude")
    .select("user_name, content")
    .eq("book", book)
    .eq("chapter", chapter);

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
  await supabase.from("bible_gratitude").upsert(
    { user_name: userName, book, chapter, content },
    { onConflict: "user_name,book,chapter" }
  );
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
