"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  READING_PLAN,
  ERAS,
  getBooksByEra,
  type Book,
} from "@/data/reading-plan";
import {
  isSharedMode,
  loadAllProgress,
  markChapterRead,
  unmarkChapterRead,
  getStoredPrompt,
  storePrompt,
  getReflections,
  saveReflection,
  loadPrayers,
  addPrayer,
  togglePrayingFor,
  markPrayerAnswered,
  loadChapterHighlights,
  loadAllHighlights,
  saveHighlight,
  getGratitude,
  saveGratitude,
  loadAllGratitude,
  getWeeklyData,
  type Prayer,
  type Highlight,
  type GratitudeEntry,
} from "@/lib/supabase";

type View = "plan" | "chapter" | "life" | "together";

interface ChapterSelection {
  book: Book;
  chapter: number;
}

interface SharedProgress {
  [book: string]: { lesley: number[]; kelvin: number[] };
}

export default function Home() {
  // ─── User identity ───
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // ─── Navigation ───
  const [view, setView] = useState<View>("plan");
  const [expandedEra, setExpandedEra] = useState<string | null>(ERAS[0]);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [selected, setSelected] = useState<ChapterSelection | null>(null);

  // ─── Bible text ───
  const [verses, setVerses] = useState<{ verse: number; text: string }[]>([]);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [textError, setTextError] = useState("");
  const [translation, setTranslation] = useState("");

  // ─── Study (Go Deeper) ───
  const [studyContent, setStudyContent] = useState("");
  const [isLoadingStudy, setIsLoadingStudy] = useState(false);

  // ─── Progress ───
  const [soloProgress, setSoloProgress] = useState<Record<string, number[]>>(
    {}
  );
  const [sharedProgress, setSharedProgress] = useState<SharedProgress>({});

  // ─── Reflection ───
  const [reflectionPrompt, setReflectionPrompt] = useState("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [myReflection, setMyReflection] = useState("");
  const [reflections, setReflections] = useState<{
    lesley?: string;
    kelvin?: string;
  }>({});
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  // ─── Gratitude ───
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [gratitude, setGratitude] = useState<{
    lesley?: string;
    kelvin?: string;
  }>({});
  const [gratitudeSubmitted, setGratitudeSubmitted] = useState(false);

  // ─── Highlights ───
  const [chapterHighlights, setChapterHighlights] = useState<Highlight[]>([]);
  const [highlightStart, setHighlightStart] = useState<number | null>(null);
  const [highlightEnd, setHighlightEnd] = useState<number | null>(null);
  const [highlightNote, setHighlightNote] = useState("");
  const [notesFilter, setNotesFilter] = useState<"all" | "mine" | "partner">(
    "all"
  );
  const [allHighlights, setAllHighlights] = useState<Highlight[]>([]);

  // ─── Prayer Board ───
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [showAnswered, setShowAnswered] = useState(false);

  // ─── Weekly Recap ───
  const [weeklyRecap, setWeeklyRecap] = useState("");
  const [isLoadingRecap, setIsLoadingRecap] = useState(false);

  // ─── Life challenge ───
  const [lifeInput, setLifeInput] = useState("");
  const [lifeResponse, setLifeResponse] = useState("");
  const [isLoadingLife, setIsLoadingLife] = useState(false);

  // ─── Gratitude history ───
  const [allGratitude, setAllGratitude] = useState<GratitudeEntry[]>([]);

  // ─── Together sub-section ───
  const [togetherTab, setTogetherTab] = useState<
    "prayers" | "verses" | "gratitude" | "recap"
  >("prayers");

  const booksByEra = getBooksByEra();
  const partnerName = currentUser === "Lesley" ? "Kelvin" : "Lesley";
  const userKey = currentUser?.toLowerCase() as "lesley" | "kelvin" | undefined;
  const partnerKey = userKey === "lesley" ? "kelvin" : "lesley";

  // ─── Init ───
  useEffect(() => {
    const savedUser = localStorage.getItem("bible-study-user");
    if (savedUser) setCurrentUser(savedUser);

    if (isSharedMode) {
      loadAllProgress().then(setSharedProgress);
    } else {
      const saved = localStorage.getItem("bible-study-progress");
      if (saved) {
        try {
          setSoloProgress(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (!isSharedMode && Object.keys(soloProgress).length > 0) {
      localStorage.setItem(
        "bible-study-progress",
        JSON.stringify(soloProgress)
      );
    }
  }, [soloProgress]);

  // ─── Progress helpers ───
  const isChapterRead = (bookName: string, chapter: number): boolean => {
    if (isSharedMode && userKey) {
      return sharedProgress[bookName]?.[userKey]?.includes(chapter) ?? false;
    }
    return soloProgress[bookName]?.includes(chapter) ?? false;
  };

  const isChapterReadByPartner = (
    bookName: string,
    chapter: number
  ): boolean => {
    if (!isSharedMode || !userKey) return false;
    return sharedProgress[bookName]?.[partnerKey]?.includes(chapter) ?? false;
  };

  const toggleRead = async (bookName: string, chapter: number) => {
    const wasRead = isChapterRead(bookName, chapter);
    if (isSharedMode && currentUser) {
      if (wasRead) {
        await unmarkChapterRead(currentUser, bookName, chapter);
      } else {
        await markChapterRead(currentUser, bookName, chapter);
      }
      setSharedProgress(await loadAllProgress());
    } else {
      setSoloProgress((prev) => {
        const bp = prev[bookName] || [];
        return {
          ...prev,
          [bookName]: bp.includes(chapter)
            ? bp.filter((c) => c !== chapter)
            : [...bp, chapter].sort((a, b) => a - b),
        };
      });
    }
  };

  const getCompletedChapters = (bookName: string): number => {
    if (isSharedMode && userKey)
      return sharedProgress[bookName]?.[userKey]?.length ?? 0;
    return (soloProgress[bookName] || []).length;
  };

  const getPartnerCompletedChapters = (bookName: string): number => {
    if (!isSharedMode || !userKey) return 0;
    return sharedProgress[bookName]?.[partnerKey]?.length ?? 0;
  };

  const getTotalRead = (): number => {
    if (isSharedMode && userKey) {
      return Object.values(sharedProgress).reduce(
        (sum, book) => sum + (book[userKey]?.length ?? 0),
        0
      );
    }
    return Object.values(soloProgress).reduce(
      (sum, ch) => sum + ch.length,
      0
    );
  };

  const getBooksRead = (): string[] =>
    READING_PLAN.filter((b) => getCompletedChapters(b.name) > 0).map(
      (b) => b.name
    );

  const getCurrentBook = (): string => {
    for (const book of READING_PLAN) {
      if (getCompletedChapters(book.name) < book.chapters) return book.name;
    }
    return READING_PLAN[READING_PLAN.length - 1].name;
  };

  // ─── Bible text ───
  const fetchBibleText = useCallback(
    async (book: Book, chapter: number) => {
      setIsLoadingText(true);
      setTextError("");
      setVerses([]);
      setTranslation("");
      try {
        const name = book.apiName || book.name;
        const res = await fetch(
          `/api/bible-text?q=${encodeURIComponent(`${name} ${chapter}`)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTranslation(data.translation || "");
        if (data.verses?.length) {
          setVerses(data.verses);
        } else if (data.text) {
          setVerses([{ verse: 1, text: data.text }]);
        }
      } catch {
        setTextError("Couldn't load the text. You can still use Go Deeper.");
      }
      setIsLoadingText(false);
    },
    []
  );

  // ─── Reflection prompt ───
  const loadReflectionPrompt = useCallback(
    async (book: string, chapter: number, bibleText: string) => {
      if (!isSharedMode) return;
      setIsLoadingPrompt(true);
      setReflectionPrompt("");
      setMyReflection("");
      setReflectionSubmitted(false);
      setReflections({});

      try {
        const stored = await getStoredPrompt(book, chapter);
        if (stored) {
          setReflectionPrompt(stored);
        } else {
          const res = await fetch("/api/reflection-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ book, chapter, text: bibleText }),
          });
          const data = await res.json();
          if (data.prompt) {
            setReflectionPrompt(data.prompt);
            await storePrompt(book, chapter, data.prompt);
          }
        }

        const existing = await getReflections(book, chapter);
        setReflections(existing);
        if (userKey && existing[userKey]) {
          setMyReflection(existing[userKey]!);
          setReflectionSubmitted(true);
        }
      } catch {}
      setIsLoadingPrompt(false);
    },
    [userKey]
  );

  // ─── Load gratitude + highlights when chapter opens ───
  const loadChapterExtras = useCallback(
    async (book: string, chapter: number) => {
      if (!isSharedMode) return;
      const [grat, highlights] = await Promise.all([
        getGratitude(book, chapter),
        loadChapterHighlights(book, chapter),
      ]);
      setGratitude(grat);
      setGratitudeInput("");
      setGratitudeSubmitted(!!(userKey && grat[userKey]));
      if (userKey && grat[userKey]) setGratitudeInput(grat[userKey]!);
      setChapterHighlights(highlights);
      setHighlightStart(null);
      setHighlightEnd(null);
      setHighlightNote("");
    },
    [userKey]
  );

  // ─── Select chapter ───
  const selectChapter = (book: Book, chapter: number) => {
    setSelected({ book, chapter });
    setView("chapter");
    setStudyContent("");
    setReflectionPrompt("");
    setMyReflection("");
    setReflectionSubmitted(false);
    setReflections({});
    setGratitudeInput("");
    setGratitudeSubmitted(false);
    setGratitude({});
    setChapterHighlights([]);
    setHighlightStart(null);
    setHighlightEnd(null);
    fetchBibleText(book, chapter);
    window.scrollTo(0, 0);
  };

  // Load extras after text loads
  useEffect(() => {
    if (selected && verses.length > 0 && isSharedMode && currentUser) {
      const text = verses.map((v) => `${v.verse} ${v.text}`).join("\n");
      loadReflectionPrompt(selected.book.name, selected.chapter, text);
      loadChapterExtras(selected.book.name, selected.chapter);
    }
  }, [selected, verses, currentUser, loadReflectionPrompt, loadChapterExtras]);

  // ─── Go Deeper ───
  const goDeeper = async () => {
    if (!selected) return;
    setIsLoadingStudy(true);
    setStudyContent("");
    const fullText = verses.map((v) => `${v.verse} ${v.text}`).join("\n");
    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: selected.book.name,
          chapter: selected.chapter,
          text: fullText || `${selected.book.name} chapter ${selected.chapter}`,
        }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value);
        setStudyContent(content);
      }
    } catch {
      setStudyContent("Something went wrong. Please try again.");
    }
    setIsLoadingStudy(false);
  };

  // ─── Submit reflection ───
  const submitReflection = async () => {
    if (!selected || !currentUser || !myReflection.trim()) return;
    await saveReflection(
      currentUser,
      selected.book.name,
      selected.chapter,
      myReflection.trim()
    );
    setReflectionSubmitted(true);
    setReflections(
      await getReflections(selected.book.name, selected.chapter)
    );
  };

  const refreshReflections = async () => {
    if (!selected) return;
    setReflections(
      await getReflections(selected.book.name, selected.chapter)
    );
  };

  // ─── Submit gratitude ───
  const submitGratitude = async () => {
    if (!selected || !currentUser || !gratitudeInput.trim()) return;
    await saveGratitude(
      currentUser,
      selected.book.name,
      selected.chapter,
      gratitudeInput.trim()
    );
    setGratitudeSubmitted(true);
    setGratitude(
      await getGratitude(selected.book.name, selected.chapter)
    );
  };

  const refreshGratitude = async () => {
    if (!selected) return;
    setGratitude(
      await getGratitude(selected.book.name, selected.chapter)
    );
  };

  // ─── Highlight verse(s) ───
  const handleVerseTap = (verseNum: number) => {
    if (!isSharedMode) return;
    if (highlightStart === null) {
      setHighlightStart(verseNum);
      setHighlightEnd(verseNum);
      setHighlightNote("");
    } else if (highlightStart === verseNum && highlightEnd === verseNum) {
      setHighlightStart(null);
      setHighlightEnd(null);
      setHighlightNote("");
    } else {
      setHighlightStart(Math.min(highlightStart, verseNum));
      setHighlightEnd(Math.max(highlightEnd ?? highlightStart, verseNum));
    }
  };

  const submitHighlight = async () => {
    if (!selected || !currentUser || highlightStart === null) return;
    const end = highlightEnd ?? highlightStart;
    const rangeVerses = verses.filter(
      (v) => v.verse >= highlightStart && v.verse <= end
    );
    const verseText = rangeVerses.map((v) => v.text).join(" ");
    if (!verseText) return;
    await saveHighlight(
      currentUser,
      selected.book.name,
      selected.chapter,
      highlightStart,
      end > highlightStart ? end : null,
      verseText,
      highlightNote.trim()
    );
    setChapterHighlights(
      await loadChapterHighlights(selected.book.name, selected.chapter)
    );
    setHighlightStart(null);
    setHighlightEnd(null);
    setHighlightNote("");
  };

  // ─── Prayer actions ───
  const submitPrayer = async () => {
    if (!currentUser || !newPrayer.trim()) return;
    await addPrayer(currentUser, newPrayer.trim());
    setNewPrayer("");
    setPrayers(await loadPrayers());
  };

  const handleTogglePraying = async (prayer: Prayer) => {
    await togglePrayingFor(prayer.id, !prayer.partner_praying);
    setPrayers(await loadPrayers());
  };

  const handleMarkAnswered = async (prayer: Prayer) => {
    await markPrayerAnswered(prayer.id, !prayer.is_answered);
    setPrayers(await loadPrayers());
  };

  // ─── Weekly recap ───
  const generateRecap = async () => {
    setIsLoadingRecap(true);
    setWeeklyRecap("");
    const since = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const weeklyData = await getWeeklyData(since);
    try {
      const res = await fetch("/api/weekly-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyData }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value);
        setWeeklyRecap(content);
      }
    } catch {
      setWeeklyRecap("Couldn't generate the recap. Please try again.");
    }
    setIsLoadingRecap(false);
  };

  // ─── Life challenge ───
  const submitLifeChallenge = async () => {
    if (!lifeInput.trim()) return;
    setIsLoadingLife(true);
    setLifeResponse("");
    try {
      const res = await fetch("/api/life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: lifeInput,
          currentBook: getCurrentBook(),
          booksRead: getBooksRead(),
        }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value);
        setLifeResponse(content);
      }
    } catch {
      setLifeResponse("Something went wrong. Please try again.");
    }
    setIsLoadingLife(false);
  };

  // ─── User selection ───
  const selectUser = (name: string) => {
    setCurrentUser(name);
    localStorage.setItem("bible-study-user", name);
    if (isSharedMode) loadAllProgress().then(setSharedProgress);
  };

  // Load together tab data
  useEffect(() => {
    if (view === "together" && isSharedMode) {
      loadPrayers().then(setPrayers);
      loadAllHighlights().then(setAllHighlights);
      loadAllGratitude().then(setAllGratitude);
    }
  }, [view]);

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════

  // ─── User selection screen ───
  if (isSharedMode && !currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">Bible Study</h1>
        <p className="text-warmgray mb-10">Who&apos;s reading today?</p>
        <div className="flex gap-4 justify-center">
          {["Lesley", "Kelvin"].map((name) => (
            <button
              key={name}
              onClick={() => selectUser(name)}
              className="w-36 py-6 bg-white rounded-2xl shadow-sm border-2 border-parchment-dark hover:border-gold text-ink font-semibold text-lg transition-all hover:shadow-md"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Chapter study view ───
  if (view === "chapter" && selected) {
    const { book, chapter } = selected;
    const read = isChapterRead(book.name, chapter);
    const partnerRead = isChapterReadByPartner(book.name, chapter);
    const bothReflected = !!reflections.lesley && !!reflections.kelvin;
    const bothGratitude = !!gratitude.lesley && !!gratitude.kelvin;
    const highlightedVerses = new Set<number>();
    chapterHighlights.forEach((h) => {
      const end = h.verse_end ?? h.verse;
      for (let v = h.verse; v <= end; v++) highlightedVerses.add(v);
    });
    const isInSelection = (v: number) =>
      highlightStart !== null &&
      highlightEnd !== null &&
      v >= highlightStart &&
      v <= highlightEnd;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => {
            setView("plan");
            setSelected(null);
          }}
          className="text-gold-dark hover:text-gold font-medium mb-4 flex items-center gap-1"
        >
          <span>&larr;</span> Back to Plan
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">
            {book.name} {chapter}
          </h1>
          <p className="text-warmgray text-sm mt-1">
            {book.date} &middot; {book.era}
            {translation && (
              <span className="ml-2 text-xs bg-parchment-dark px-1.5 py-0.5 rounded">
                {translation}
              </span>
            )}
          </p>
          {book.note && (
            <p className="text-ink-light text-sm mt-2 italic">{book.note}</p>
          )}
        </div>

        {/* Bible text with highlightable verses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-parchment-dark mb-4">
          {isLoadingText ? (
            <div className="text-warmgray loading-pulse py-8 text-center">
              Loading scripture...
            </div>
          ) : textError ? (
            <div className="text-warmgray py-4 text-center text-sm">
              {textError}
            </div>
          ) : (
            <div className="bible-text">
              {verses.map((v) => {
                const isHighlighted = highlightedVerses.has(v.verse);
                const isSelected = isInSelection(v.verse);
                return (
                  <span
                    key={v.verse}
                    className={
                      isSelected
                        ? "bg-gold/25 rounded px-0.5"
                        : isHighlighted
                        ? "bg-gold/10 rounded px-0.5"
                        : ""
                    }
                  >
                    <sup
                      className="cursor-pointer hover:bg-gold/30 rounded px-0.5 transition-colors"
                      onClick={() => handleVerseTap(v.verse)}
                      title={isSharedMode ? "Tap to highlight" : ""}
                    >
                      {v.verse}
                    </sup>
                    {v.text}{" "}
                  </span>
                );
              })}
            </div>
          )}

          {/* Highlight panel */}
          {isSharedMode && highlightStart !== null && (
            <div className="mt-4 pt-4 border-t border-parchment-dark">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-ink">
                  {highlightStart === highlightEnd
                    ? `Verse ${highlightStart}`
                    : `Verses ${highlightStart}–${highlightEnd}`}
                </p>
                <p className="text-xs text-warmgray">
                  Tap another verse to extend selection
                </p>
              </div>
              {/* Existing highlights overlapping this range */}
              {chapterHighlights
                .filter((h) => {
                  const hEnd = h.verse_end ?? h.verse;
                  return (
                    h.verse <= (highlightEnd ?? highlightStart) &&
                    hEnd >= highlightStart
                  );
                })
                .map((h) => (
                  <div
                    key={h.id}
                    className="text-xs text-ink-light mb-2 bg-parchment/50 rounded p-2"
                  >
                    <span className="font-semibold text-gold-dark">
                      {h.user_name}
                    </span>
                    {" · v"}
                    {h.verse}
                    {h.verse_end ? `–${h.verse_end}` : ""}
                    {": "}
                    {h.note || "(no note)"}
                  </div>
                ))}
              <input
                type="text"
                value={highlightNote}
                onChange={(e) => setHighlightNote(e.target.value)}
                placeholder="Why do these verses stand out?"
                className="w-full p-2 text-sm rounded border border-parchment-dark bg-parchment/30 focus:outline-none focus:border-gold"
                onKeyDown={(e) => e.key === "Enter" && submitHighlight()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={submitHighlight}
                  className="text-sm bg-gold hover:bg-gold-dark text-white font-medium py-1.5 px-4 rounded transition-colors"
                >
                  Save Highlight
                </button>
                <button
                  onClick={() => {
                    setHighlightStart(null);
                    setHighlightEnd(null);
                    setHighlightNote("");
                  }}
                  className="text-sm text-warmgray hover:text-ink-light py-1.5 px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={goDeeper}
            disabled={isLoadingStudy}
            className="flex-1 bg-gold hover:bg-gold-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoadingStudy ? (
              <span className="loading-pulse">Studying...</span>
            ) : studyContent ? (
              "Go Deeper Again"
            ) : (
              "Go Deeper"
            )}
          </button>
          <button
            onClick={() => toggleRead(book.name, chapter)}
            className={`py-3 px-6 rounded-lg font-medium transition-colors border-2 ${
              read
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-parchment-dark hover:border-gold text-warmgray hover:text-gold-dark"
            }`}
          >
            {read ? "Read" : "Mark Read"}
          </button>
        </div>

        {isSharedMode && (
          <p className="text-xs text-warmgray mb-4">
            {partnerRead
              ? `${partnerName} has also read this chapter`
              : `${partnerName} hasn't read this yet`}
          </p>
        )}

        {/* Study content */}
        {studyContent && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-parchment-dark mb-6">
            <div className="study-content prose prose-warm max-w-none">
              <ReactMarkdown>{studyContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* ─── Reflect Together ─── */}
        {isSharedMode && reflectionPrompt && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gold/20 mb-6">
            <h3 className="font-semibold text-gold-dark text-sm uppercase tracking-wide mb-3">
              Reflect Together
            </h3>
            <p className="text-ink leading-relaxed mb-5 font-serif italic">
              &ldquo;{reflectionPrompt}&rdquo;
            </p>
            {!reflectionSubmitted ? (
              <>
                <textarea
                  value={myReflection}
                  onChange={(e) => setMyReflection(e.target.value)}
                  placeholder="What comes to mind..."
                  className="w-full h-28 p-4 rounded-lg border border-parchment-dark bg-parchment/30 text-ink placeholder:text-warmgray/50 focus:outline-none focus:border-gold resize-none font-serif"
                />
                <button
                  onClick={submitReflection}
                  disabled={!myReflection.trim()}
                  className="mt-3 w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-40"
                >
                  Submit Reflection
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-parchment/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gold-dark uppercase tracking-wide mb-1">
                    {currentUser}
                  </p>
                  <p className="text-ink-light leading-relaxed">
                    {userKey && reflections[userKey]}
                  </p>
                </div>
                {reflections[partnerKey] ? (
                  <div className="bg-parchment/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gold-dark uppercase tracking-wide mb-1">
                      {partnerName}
                    </p>
                    <p className="text-ink-light leading-relaxed">
                      {reflections[partnerKey]}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-warmgray text-sm italic mb-2">
                      Waiting for {partnerName}...
                    </p>
                    <button
                      onClick={refreshReflections}
                      className="text-gold-dark hover:text-gold text-sm font-medium"
                    >
                      Check again
                    </button>
                  </div>
                )}
                {bothReflected && (
                  <div className="border-t border-parchment-dark pt-3">
                    <p className="text-ink-light text-sm">
                      Read each other&apos;s reflections and talk about it
                      tonight — over dinner, on a walk, before bed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isSharedMode && isLoadingPrompt && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gold/20 mb-6">
            <p className="text-warmgray loading-pulse text-center py-4">
              Preparing your reflection question...
            </p>
          </div>
        )}

        {/* ─── Gratitude ─── */}
        {isSharedMode && currentUser && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-rose-100 mb-6">
            <h3 className="font-semibold text-rose-400 text-sm uppercase tracking-wide mb-3">
              Gratitude
            </h3>
            <p className="text-ink-light text-sm mb-4">
              What&apos;s one thing about {partnerName} you&apos;re grateful
              for today?
            </p>

            {!gratitudeSubmitted ? (
              <>
                <input
                  type="text"
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  placeholder={`Something about ${partnerName}...`}
                  className="w-full p-3 rounded-lg border border-parchment-dark bg-parchment/30 text-ink placeholder:text-warmgray/50 focus:outline-none focus:border-rose-300"
                  onKeyDown={(e) => e.key === "Enter" && submitGratitude()}
                />
                <button
                  onClick={submitGratitude}
                  disabled={!gratitudeInput.trim()}
                  className="mt-3 w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-40"
                >
                  Share Gratitude
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-rose-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
                    {currentUser}
                  </p>
                  <p className="text-ink-light">
                    {userKey && gratitude[userKey]}
                  </p>
                </div>
                {gratitude[partnerKey] ? (
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
                      {partnerName}
                    </p>
                    <p className="text-ink-light">{gratitude[partnerKey]}</p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-warmgray text-sm italic mb-2">
                      Waiting for {partnerName}...
                    </p>
                    <button
                      onClick={refreshGratitude}
                      className="text-rose-400 hover:text-rose-500 text-sm font-medium"
                    >
                      Check again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chapter navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-parchment-dark">
          {chapter > 1 ? (
            <button
              onClick={() => selectChapter(book, chapter - 1)}
              className="text-gold-dark hover:text-gold font-medium"
            >
              &larr; Chapter {chapter - 1}
            </button>
          ) : (
            <div />
          )}
          {chapter < book.chapters ? (
            <button
              onClick={() => selectChapter(book, chapter + 1)}
              className="text-gold-dark hover:text-gold font-medium"
            >
              Chapter {chapter + 1} &rarr;
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }

  // ─── Main view ───
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Bible Study</h1>
        {isSharedMode && currentUser && (
          <p className="text-warmgray text-xs mt-1">
            Reading as{" "}
            <button
              onClick={() => {
                localStorage.removeItem("bible-study-user");
                setCurrentUser(null);
              }}
              className="text-gold-dark hover:underline"
            >
              {currentUser}
            </button>
          </p>
        )}
        <p className="text-warmgray text-sm mt-1">
          {getTotalRead()} of 1,189 chapters read
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-parchment-dark mb-6">
        {(
          [
            ["plan", "Reading Plan"],
            ["together", "Together"],
            ["life", "Help Me With..."],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key as View)}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
              view === key
                ? "text-gold-dark border-b-2 border-gold"
                : "text-warmgray hover:text-ink-light"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Reading Plan ─── */}
      {view === "plan" && (
        <div className="space-y-3">
          {ERAS.map((era) => {
            const books = booksByEra.get(era) || [];
            const isExpanded = expandedEra === era;
            const eraTotal = books.reduce((s, b) => s + b.chapters, 0);
            const eraRead = books.reduce(
              (s, b) => s + getCompletedChapters(b.name),
              0
            );

            return (
              <div
                key={era}
                className="bg-white rounded-xl shadow-sm border border-parchment-dark overflow-hidden"
              >
                <button
                  onClick={() => setExpandedEra(isExpanded ? null : era)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-parchment/50 transition-colors"
                >
                  <div className="text-left">
                    <h2 className="font-semibold text-ink text-sm uppercase tracking-wide">
                      {era}
                    </h2>
                    <p className="text-warmgray text-xs mt-0.5">
                      {books.length} book{books.length !== 1 ? "s" : ""}{" "}
                      &middot; {eraRead}/{eraTotal} chapters
                    </p>
                  </div>
                  <span className="text-warmgray text-lg">
                    {isExpanded ? "\u2212" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-parchment-dark">
                    {books.map((book) => {
                      const isBookExpanded = expandedBook === book.name;
                      const completed = getCompletedChapters(book.name);
                      const partnerCompleted = getPartnerCompletedChapters(
                        book.name
                      );

                      return (
                        <div
                          key={book.name}
                          className="border-b border-parchment-dark last:border-b-0"
                        >
                          <button
                            onClick={() =>
                              setExpandedBook(
                                isBookExpanded ? null : book.name
                              )
                            }
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-parchment/30 transition-colors"
                          >
                            <div className="text-left">
                              <span className="font-medium text-ink">
                                {book.name}
                              </span>
                              <span className="text-warmgray text-sm ml-2">
                                {book.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-warmgray">
                                {completed}/{book.chapters}
                                {isSharedMode && partnerCompleted > 0 && (
                                  <span className="text-gold-dark ml-1">
                                    &middot; {partnerName}: {partnerCompleted}
                                  </span>
                                )}
                              </span>
                              {completed === book.chapters &&
                                completed > 0 && (
                                  <span className="text-gold">&#10003;</span>
                                )}
                            </div>
                          </button>

                          {isBookExpanded && (
                            <div className="px-4 pb-3">
                              <p className="text-xs text-ink-light italic mb-2">
                                {book.note}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {Array.from(
                                  { length: book.chapters },
                                  (_, i) => i + 1
                                ).map((ch) => {
                                  const youRead = isChapterRead(
                                    book.name,
                                    ch
                                  );
                                  const theyRead = isChapterReadByPartner(
                                    book.name,
                                    ch
                                  );
                                  const bothRead = youRead && theyRead;

                                  let style =
                                    "bg-parchment hover:bg-parchment-dark text-ink-light border border-transparent hover:border-gold/20";
                                  if (bothRead)
                                    style =
                                      "bg-gold/30 text-gold-dark border border-gold/40 font-semibold";
                                  else if (youRead)
                                    style =
                                      "bg-gold/15 text-gold-dark border border-gold/25";
                                  else if (theyRead && isSharedMode)
                                    style =
                                      "bg-blue-50 text-blue-400 border border-blue-200";

                                  return (
                                    <button
                                      key={ch}
                                      onClick={() => selectChapter(book, ch)}
                                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${style}`}
                                    >
                                      {ch}
                                    </button>
                                  );
                                })}
                              </div>
                              {isSharedMode && (
                                <div className="flex gap-4 mt-2 text-xs text-warmgray">
                                  <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded bg-gold/30 border border-gold/40 inline-block" />{" "}
                                    Both
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded bg-gold/15 border border-gold/25 inline-block" />{" "}
                                    You
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-block" />{" "}
                                    {partnerName}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Together Tab ─── */}
      {view === "together" && isSharedMode && (
        <div>
          {/* Sub-tabs */}
          <div className="flex gap-2 mb-6">
            {(
              [
                ["prayers", "Prayers"],
                ["verses", "Our Verses"],
                ["gratitude", "Gratitude"],
                ["recap", "Recap"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTogetherTab(key)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  togetherTab === key
                    ? "bg-gold/15 text-gold-dark"
                    : "bg-parchment text-warmgray hover:text-ink-light"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Prayer Board ── */}
          {togetherTab === "prayers" && (
            <div>
              {/* Add prayer */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-parchment-dark mb-4">
                <textarea
                  value={newPrayer}
                  onChange={(e) => setNewPrayer(e.target.value)}
                  placeholder="What would you like prayer for?"
                  className="w-full h-20 p-3 rounded-lg border border-parchment-dark bg-parchment/30 text-ink placeholder:text-warmgray/50 focus:outline-none focus:border-gold resize-none"
                />
                <button
                  onClick={submitPrayer}
                  disabled={!newPrayer.trim()}
                  className="mt-2 w-full bg-gold hover:bg-gold-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-40"
                >
                  Share Prayer Request
                </button>
              </div>

              {/* Filter */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShowAnswered(false)}
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    !showAnswered
                      ? "bg-gold/15 text-gold-dark"
                      : "text-warmgray"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowAnswered(true)}
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    showAnswered
                      ? "bg-gold/15 text-gold-dark"
                      : "text-warmgray"
                  }`}
                >
                  Answered
                </button>
              </div>

              {/* Prayer list */}
              <div className="space-y-3">
                {prayers
                  .filter((p) => p.is_answered === showAnswered)
                  .map((prayer) => {
                    const isMine =
                      prayer.user_name.toLowerCase() ===
                      currentUser?.toLowerCase();
                    const daysAgo = Math.floor(
                      (Date.now() - new Date(prayer.created_at).getTime()) /
                        86400000
                    );

                    return (
                      <div
                        key={prayer.id}
                        className={`bg-white rounded-xl p-4 shadow-sm border ${
                          prayer.is_answered
                            ? "border-green-200 bg-green-50/30"
                            : "border-parchment-dark"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-gold-dark uppercase">
                            {prayer.user_name}
                          </span>
                          <span className="text-xs text-warmgray">
                            {daysAgo === 0
                              ? "today"
                              : daysAgo === 1
                              ? "yesterday"
                              : `${daysAgo} days ago`}
                          </span>
                        </div>
                        <p className="text-ink leading-relaxed mb-3">
                          {prayer.content}
                        </p>
                        <div className="flex gap-2">
                          {!isMine && (
                            <button
                              onClick={() => handleTogglePraying(prayer)}
                              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                prayer.partner_praying
                                  ? "bg-rose-100 text-rose-500"
                                  : "bg-parchment text-warmgray hover:text-rose-400"
                              }`}
                            >
                              {prayer.partner_praying
                                ? "Praying for this"
                                : "Pray for this"}
                            </button>
                          )}
                          {isMine && (
                            <button
                              onClick={() => handleMarkAnswered(prayer)}
                              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                prayer.is_answered
                                  ? "bg-green-100 text-green-600"
                                  : "bg-parchment text-warmgray hover:text-green-500"
                              }`}
                            >
                              {prayer.is_answered
                                ? "Answered"
                                : "Mark Answered"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {prayers.filter((p) => p.is_answered === showAnswered)
                  .length === 0 && (
                  <p className="text-warmgray text-sm text-center py-6">
                    {showAnswered
                      ? "No answered prayers yet."
                      : "No active prayer requests. Share what\u2019s on your heart."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Our Verses ── */}
          {togetherTab === "verses" && (
            <div>
              {allHighlights.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-warmgray mb-2">
                    No highlighted verses yet.
                  </p>
                  <p className="text-warmgray text-sm">
                    Tap any verse number while reading to highlight it with a
                    note. Tap a second verse to select a range.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Filter + Export */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      {(
                        [
                          ["all", "All"],
                          ["mine", "Mine"],
                          ["partner", partnerName],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setNotesFilter(key)}
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            notesFilter === key
                              ? "bg-gold/15 text-gold-dark"
                              : "text-warmgray"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const filtered = allHighlights.filter((h) => {
                          if (notesFilter === "mine")
                            return (
                              h.user_name.toLowerCase() ===
                              currentUser?.toLowerCase()
                            );
                          if (notesFilter === "partner")
                            return (
                              h.user_name.toLowerCase() !==
                              currentUser?.toLowerCase()
                            );
                          return true;
                        });
                        const owner =
                          notesFilter === "mine"
                            ? currentUser
                            : notesFilter === "partner"
                            ? partnerName
                            : "Lesley & Kelvin";
                        const grouped: Record<string, typeof filtered> = {};
                        for (const h of filtered) {
                          const key = `${h.book}`;
                          if (!grouped[key]) grouped[key] = [];
                          grouped[key].push(h);
                        }
                        let md = `# Bible Study Notes — ${owner}\n\n`;
                        md += `*Exported ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}*\n\n`;
                        for (const [bookName, highlights] of Object.entries(
                          grouped
                        )) {
                          md += `## ${bookName}\n\n`;
                          for (const h of highlights.sort(
                            (a, b) =>
                              a.chapter - b.chapter || a.verse - b.verse
                          )) {
                            const ref = h.verse_end
                              ? `${h.chapter}:${h.verse}–${h.verse_end}`
                              : `${h.chapter}:${h.verse}`;
                            md += `### ${bookName} ${ref}\n\n`;
                            md += `> ${h.verse_text}\n\n`;
                            if (h.note)
                              md += `**${h.user_name}:** ${h.note}\n\n`;
                            md += `---\n\n`;
                          }
                        }
                        const blob = new Blob([md], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `bible-notes-${(notesFilter === "mine" ? currentUser : notesFilter === "partner" ? partnerName : "all")?.toLowerCase()}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs font-medium text-gold-dark hover:text-gold px-3 py-1 rounded-full bg-gold/10"
                    >
                      Export .md
                    </button>
                  </div>

                  <p className="text-warmgray text-sm mb-3">
                    {allHighlights.filter((h) => {
                      if (notesFilter === "mine")
                        return (
                          h.user_name.toLowerCase() ===
                          currentUser?.toLowerCase()
                        );
                      if (notesFilter === "partner")
                        return (
                          h.user_name.toLowerCase() !==
                          currentUser?.toLowerCase()
                        );
                      return true;
                    }).length}{" "}
                    highlight
                    {allHighlights.length !== 1 ? "s" : ""}
                  </p>

                  <div className="space-y-3">
                    {allHighlights
                      .filter((h) => {
                        if (notesFilter === "mine")
                          return (
                            h.user_name.toLowerCase() ===
                            currentUser?.toLowerCase()
                          );
                        if (notesFilter === "partner")
                          return (
                            h.user_name.toLowerCase() !==
                            currentUser?.toLowerCase()
                          );
                        return true;
                      })
                      .map((h) => (
                        <div
                          key={h.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-parchment-dark"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-gold-dark">
                              {h.book} {h.chapter}:{h.verse}
                              {h.verse_end ? `–${h.verse_end}` : ""}
                            </span>
                            <span className="text-xs text-warmgray">
                              {h.user_name}
                            </span>
                          </div>
                          <p className="text-ink font-serif text-sm leading-relaxed mb-1">
                            &ldquo;{h.verse_text}&rdquo;
                          </p>
                          {h.note && (
                            <p className="text-ink-light text-xs italic">
                              {h.note}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Gratitude History ── */}
          {togetherTab === "gratitude" && (
            <div>
              {allGratitude.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-warmgray mb-2">
                    No gratitude entries yet.
                  </p>
                  <p className="text-warmgray text-sm">
                    After reading a chapter, you&apos;ll each share one thing
                    you&apos;re grateful for about each other.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-warmgray text-sm mb-2">
                    {allGratitude.length} moment
                    {allGratitude.length !== 1 ? "s" : ""} of gratitude
                  </p>
                  {allGratitude.map((g) => {
                    const date = new Date(g.created_at);
                    const dateStr = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div
                        key={g.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-rose-100"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-rose-400 uppercase">
                            {g.user_name}
                          </span>
                          <span className="text-xs text-warmgray">
                            {g.book} {g.chapter} &middot; {dateStr}
                          </span>
                        </div>
                        <p className="text-ink leading-relaxed">
                          {g.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Weekly Recap ── */}
          {togetherTab === "recap" && (
            <div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-parchment-dark mb-4">
                <p className="text-ink-light text-sm mb-4">
                  Generate a recap of your past 7 days — what you read, how
                  your reflections compared, and what to carry into next week.
                </p>
                <button
                  onClick={generateRecap}
                  disabled={isLoadingRecap}
                  className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoadingRecap ? (
                    <span className="loading-pulse">
                      Writing your recap...
                    </span>
                  ) : (
                    "Generate Weekly Recap"
                  )}
                </button>
              </div>

              {weeklyRecap && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-parchment-dark">
                  <div className="study-content prose prose-warm max-w-none">
                    <ReactMarkdown>{weeklyRecap}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Life Challenge ─── */}
      {view === "life" && (
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-parchment-dark">
            <h2 className="font-semibold text-ink mb-2">
              What are you going through?
            </h2>
            <p className="text-warmgray text-sm mb-4">
              Describe what you&apos;re facing — anxiety, a decision, conflict,
              grief, doubt, anything. You&apos;ll get specific passages that
              speak to your situation.
            </p>
            <textarea
              value={lifeInput}
              onChange={(e) => setLifeInput(e.target.value)}
              placeholder="I'm struggling with..."
              className="w-full h-32 p-4 rounded-lg border border-parchment-dark bg-parchment/30 text-ink placeholder:text-warmgray/60 focus:outline-none focus:border-gold resize-none"
            />
            <button
              onClick={submitLifeChallenge}
              disabled={isLoadingLife || !lifeInput.trim()}
              className="mt-3 w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoadingLife ? (
                <span className="loading-pulse">Finding passages...</span>
              ) : (
                "Find Passages"
              )}
            </button>
          </div>

          {lifeResponse && (
            <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-parchment-dark">
              <div className="study-content prose prose-warm max-w-none">
                <ReactMarkdown>{lifeResponse}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
