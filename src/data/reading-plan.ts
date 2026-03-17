export interface Book {
  name: string;
  chapters: number;
  date: string;
  era: string;
  note: string;
  apiName?: string; // override for bible-api.com if different
}

export const ERAS = [
  "The Patriarchal Era",
  "The Exodus & Wilderness",
  "Conquest & Judges",
  "The United Monarchy",
  "The Divided Monarchy",
  "7th Century & The Fall",
  "The Babylonian Exile",
  "The Post-Exilic Restoration",
  "The Life of Jesus",
  "The Early Church",
  "NT Epistles",
  "Johannine Literature",
  "The Apocalypse",
];

export const READING_PLAN: Book[] = [
  // === THE PATRIARCHAL ERA ===
  {
    name: "Genesis",
    chapters: 50,
    date: "c. 2100–1700 BC",
    era: "The Patriarchal Era",
    note: "Creation through the four patriarchs. Archaeology places Abraham c. 2100–1900 BC (Middle Bronze I).",
  },
  {
    name: "Job",
    chapters: 42,
    date: "c. 2000–1800 BC",
    era: "The Patriarchal Era",
    note: "Placed in the patriarchal era due to its archaic language, pre-Mosaic theology, and lack of references to Israel's history.",
  },

  // === THE EXODUS & WILDERNESS ===
  {
    name: "Exodus",
    chapters: 40,
    date: "c. 1446–1406 BC",
    era: "The Exodus & Wilderness",
    note: "1 Kings 6:1 anchors the Exodus 480 years before Solomon's 4th year (~966 BC) → c. 1446 BC.",
  },
  {
    name: "Leviticus",
    chapters: 27,
    date: "c. 1445 BC",
    era: "The Exodus & Wilderness",
    note: "Laws given at Sinai during the year-long encampment. Directly follows the tabernacle construction narrative.",
  },
  {
    name: "Numbers",
    chapters: 36,
    date: "c. 1445–1406 BC",
    era: "The Exodus & Wilderness",
    note: "From Sinai to the plains of Moab — 38 years of wilderness wandering.",
  },
  {
    name: "Deuteronomy",
    chapters: 34,
    date: "c. 1406 BC",
    era: "The Exodus & Wilderness",
    note: "Moses' farewell speeches on the plains of Moab, just before the conquest of Canaan.",
  },

  // === CONQUEST & JUDGES ===
  {
    name: "Joshua",
    chapters: 24,
    date: "c. 1406–1380 BC",
    era: "Conquest & Judges",
    note: "The conquest and settlement of Canaan under Joshua's leadership.",
  },
  {
    name: "Judges",
    chapters: 21,
    date: "c. 1380–1050 BC",
    era: "Conquest & Judges",
    note: "The cyclical pattern of apostasy, oppression, and deliverance during the pre-monarchic period.",
  },
  {
    name: "Ruth",
    chapters: 4,
    date: "c. 1100 BC",
    era: "Conquest & Judges",
    note: "Set 'in the days when the judges ruled.' Ruth is David's great-grandmother.",
  },

  // === THE UNITED MONARCHY ===
  {
    name: "1 Samuel",
    chapters: 31,
    date: "c. 1100–1010 BC",
    era: "The United Monarchy",
    note: "Samuel, Saul, and David's rise. The transition from judges to monarchy.",
  },
  {
    name: "2 Samuel",
    chapters: 24,
    date: "c. 1010–970 BC",
    era: "The United Monarchy",
    note: "David's reign. Parallel to 1 Chronicles in many sections.",
  },
  {
    name: "1 Chronicles",
    chapters: 29,
    date: "c. 1010–970 BC",
    era: "The United Monarchy",
    note: "Retells David's reign from a priestly/temple perspective. Written post-exile but covers United Monarchy events.",
  },
  {
    name: "Psalms",
    chapters: 150,
    date: "c. 1440–430 BC",
    era: "The United Monarchy",
    note: "Israel's hymnal spanning 1,000+ years. Placed here because the majority are Davidic, though individual psalms span the entire OT timeline.",
  },
  {
    name: "1 Kings",
    chapters: 22,
    date: "c. 970–853 BC",
    era: "The United Monarchy",
    note: "Solomon's reign through Elijah. The temple built, the kingdom divided.",
  },
  {
    name: "Song of Solomon",
    chapters: 8,
    date: "c. 960 BC",
    era: "The United Monarchy",
    apiName: "Song of Solomon",
    note: "Attributed to Solomon in his youth. Ancient love poetry with rich allegorical tradition.",
  },
  {
    name: "Proverbs",
    chapters: 31,
    date: "c. 970–700 BC",
    era: "The United Monarchy",
    note: "Primarily Solomonic, with later additions compiled under Hezekiah (Prov 25:1).",
  },
  {
    name: "Ecclesiastes",
    chapters: 12,
    date: "c. 935 BC",
    era: "The United Monarchy",
    note: "Traditionally attributed to Solomon late in life — a philosophical reflection on meaning.",
  },

  // === THE DIVIDED MONARCHY ===
  {
    name: "2 Chronicles",
    chapters: 36,
    date: "c. 930–586 BC",
    era: "The Divided Monarchy",
    note: "Covers the southern kingdom (Judah) from Solomon's death to the exile.",
  },
  {
    name: "Obadiah",
    chapters: 1,
    date: "c. 848–841 BC",
    era: "The Divided Monarchy",
    note: "Shortest OT book. Against Edom for raiding Judah during Jehoram's reign.",
  },
  {
    name: "Joel",
    chapters: 3,
    date: "c. 835 BC",
    era: "The Divided Monarchy",
    note: "Early date: no mention of Assyria or Babylon suggests pre-8th century composition.",
  },
  {
    name: "2 Kings",
    chapters: 25,
    date: "c. 853–586 BC",
    era: "The Divided Monarchy",
    note: "From Elijah through the fall of both kingdoms. Parallel to 2 Chronicles.",
  },
  {
    name: "Jonah",
    chapters: 4,
    date: "c. 793–753 BC",
    era: "The Divided Monarchy",
    note: "Jonah ben Amittai is historical (2 Kgs 14:25). Fits when Assyria was weakened by plague and revolt.",
  },
  {
    name: "Amos",
    chapters: 9,
    date: "c. 760–750 BC",
    era: "The Divided Monarchy",
    note: "A Judean shepherd called to prophesy against Israel's social injustice during Jeroboam II's prosperity.",
  },
  {
    name: "Hosea",
    chapters: 14,
    date: "c. 755–715 BC",
    era: "The Divided Monarchy",
    note: "The prophet's marriage as metaphor for God's relationship with unfaithful Israel.",
  },
  {
    name: "Isaiah",
    chapters: 66,
    date: "c. 740–700 BC",
    era: "The Divided Monarchy",
    note: "Spans four decades alongside 2 Kings 16–20. The most quoted OT prophet in the NT.",
  },
  {
    name: "Micah",
    chapters: 7,
    date: "c. 735–700 BC",
    era: "The Divided Monarchy",
    note: "Contemporary of Isaiah. Rural prophet vs. urban corruption. Contains the Bethlehem prophecy (5:2).",
  },

  // === 7TH CENTURY & THE FALL ===
  {
    name: "Nahum",
    chapters: 3,
    date: "c. 663–612 BC",
    era: "7th Century & The Fall",
    note: "Nahum 3:8 refers to Thebes' fall (663 BC) as past; Nineveh fell 612 BC.",
  },
  {
    name: "Zephaniah",
    chapters: 3,
    date: "c. 640–630 BC",
    era: "7th Century & The Fall",
    note: "During Josiah's early reign, before the great reform of 621 BC.",
  },
  {
    name: "Jeremiah",
    chapters: 52,
    date: "c. 627–586 BC",
    era: "7th Century & The Fall",
    note: "The weeping prophet. Witnessed Jerusalem's fall. His scribe Baruch preserved his oracles.",
  },
  {
    name: "Lamentations",
    chapters: 5,
    date: "c. 586 BC",
    era: "7th Century & The Fall",
    note: "Five poems mourning Jerusalem's destruction. Traditionally attributed to Jeremiah.",
  },
  {
    name: "Habakkuk",
    chapters: 3,
    date: "c. 609–598 BC",
    era: "7th Century & The Fall",
    note: "Treats Babylon as an imminent rising power. 'The righteous shall live by faith' (2:4) is quoted three times in the NT.",
  },

  // === THE BABYLONIAN EXILE ===
  {
    name: "Ezekiel",
    chapters: 48,
    date: "c. 593–571 BC",
    era: "The Babylonian Exile",
    note: "Prophet among the exiles in Babylon. Extraordinary visions — the valley of dry bones, the new temple.",
  },
  {
    name: "Daniel",
    chapters: 12,
    date: "c. 605–535 BC",
    era: "The Babylonian Exile",
    note: "Court tales and apocalyptic visions in Babylon under Nebuchadnezzar through Cyrus.",
  },

  // === THE POST-EXILIC RESTORATION ===
  {
    name: "Ezra",
    chapters: 10,
    date: "c. 538–457 BC",
    era: "The Post-Exilic Restoration",
    note: "The return from exile and temple rebuilding. Haggai and Zechariah sit inside Ezra 5–6.",
  },
  {
    name: "Haggai",
    chapters: 2,
    date: "c. 520 BC",
    era: "The Post-Exilic Restoration",
    note: "Four oracles in four months, all urging the people to rebuild the temple.",
  },
  {
    name: "Zechariah",
    chapters: 14,
    date: "c. 520–518 BC",
    era: "The Post-Exilic Restoration",
    note: "Contemporary of Haggai. Eight night visions plus messianic prophecies heavily cited in the Gospels.",
  },
  {
    name: "Esther",
    chapters: 10,
    date: "c. 483–473 BC",
    era: "The Post-Exilic Restoration",
    note: "Set in the Persian court between Ezra 6 and Ezra 7. God's name never appears in the text.",
  },
  {
    name: "Nehemiah",
    chapters: 13,
    date: "c. 445–430 BC",
    era: "The Post-Exilic Restoration",
    note: "Jerusalem's walls rebuilt in 52 days. Great covenant renewal with Ezra.",
  },
  {
    name: "Malachi",
    chapters: 4,
    date: "c. 430–420 BC",
    era: "The Post-Exilic Restoration",
    note: "Last OT prophet. 400 years of silence follow until John the Baptist.",
  },

  // === THE LIFE OF JESUS ===
  {
    name: "Matthew",
    chapters: 28,
    date: "c. 4 BC – AD 30",
    era: "The Life of Jesus",
    note: "Written for a Jewish audience. Emphasizes Jesus as the fulfillment of OT prophecy.",
  },
  {
    name: "Mark",
    chapters: 16,
    date: "c. 4 BC – AD 30",
    era: "The Life of Jesus",
    note: "The earliest Gospel. Fast-paced, action-oriented. Likely based on Peter's testimony.",
  },
  {
    name: "Luke",
    chapters: 24,
    date: "c. 4 BC – AD 30",
    era: "The Life of Jesus",
    note: "Written by a physician. Most detailed birth narrative. Emphasis on the marginalized.",
  },
  {
    name: "John",
    chapters: 21,
    date: "c. 4 BC – AD 30",
    era: "The Life of Jesus",
    note: "The theological Gospel. Written last, with unique material not in the Synoptics.",
  },

  // === THE EARLY CHURCH ===
  {
    name: "Acts",
    chapters: 28,
    date: "c. AD 30–62",
    era: "The Early Church",
    note: "Luke's second volume. Ends without recording Paul's death — likely composed before his martyrdom.",
  },

  // === NT EPISTLES ===
  {
    name: "James",
    chapters: 5,
    date: "c. AD 46–49",
    era: "NT Epistles",
    note: "Possibly the earliest NT writing. Practical wisdom — 'faith without works is dead.'",
  },
  {
    name: "Galatians",
    chapters: 6,
    date: "c. AD 48–49",
    era: "NT Epistles",
    note: "Paul's passionate defense of grace vs. law. Written early, before the Jerusalem Council.",
  },
  {
    name: "1 Thessalonians",
    chapters: 5,
    date: "c. AD 50–51",
    era: "NT Epistles",
    note: "Paul's earliest surviving letter. Encouragement to a young church facing persecution.",
  },
  {
    name: "2 Thessalonians",
    chapters: 3,
    date: "c. AD 51–52",
    era: "NT Epistles",
    note: "Clarifies misunderstandings about Christ's return from the first letter.",
  },
  {
    name: "1 Corinthians",
    chapters: 16,
    date: "c. AD 53–54",
    era: "NT Epistles",
    note: "Paul addresses a fractured church: divisions, immorality, lawsuits, and the resurrection.",
  },
  {
    name: "2 Corinthians",
    chapters: 13,
    date: "c. AD 55–56",
    era: "NT Epistles",
    note: "Paul's most personal letter. Weakness, suffering, and the paradox of apostolic authority.",
  },
  {
    name: "Romans",
    chapters: 16,
    date: "c. AD 56–57",
    era: "NT Epistles",
    note: "Paul's theological masterpiece. Systematic treatment of sin, grace, faith, and the law.",
  },
  {
    name: "Philippians",
    chapters: 4,
    date: "c. AD 60–62",
    era: "NT Epistles",
    note: "Written from prison. The 'joy' letter — contains the great Christ-hymn (2:5–11).",
  },
  {
    name: "Colossians",
    chapters: 4,
    date: "c. AD 60–62",
    era: "NT Epistles",
    note: "Christ's supremacy over all creation. Written to counter proto-Gnostic teaching.",
  },
  {
    name: "Philemon",
    chapters: 1,
    date: "c. AD 60–62",
    era: "NT Epistles",
    note: "A personal letter about a runaway slave — Paul's appeal for radical reconciliation.",
  },
  {
    name: "Ephesians",
    chapters: 6,
    date: "c. AD 60–62",
    era: "NT Epistles",
    note: "The cosmic scope of God's plan — unity of all things in Christ.",
  },
  {
    name: "1 Peter",
    chapters: 5,
    date: "c. AD 60–64",
    era: "NT Epistles",
    note: "Written to persecuted Christians scattered across Asia Minor. Suffering as participation in Christ.",
  },
  {
    name: "Hebrews",
    chapters: 13,
    date: "c. AD 64–69",
    era: "NT Epistles",
    note: "Author unknown. Christ as the superior high priest. The 'faith hall of fame' in chapter 11.",
  },
  {
    name: "1 Timothy",
    chapters: 6,
    date: "c. AD 62–65",
    era: "NT Epistles",
    note: "Paul's instructions to his young protégé on church leadership and sound doctrine.",
  },
  {
    name: "Titus",
    chapters: 3,
    date: "c. AD 64–66",
    era: "NT Epistles",
    note: "Instructions for organizing the church in Crete. Emphasis on good works and sound teaching.",
  },
  {
    name: "2 Timothy",
    chapters: 4,
    date: "c. AD 66–67",
    era: "NT Epistles",
    note: "Paul's final letter, written from death row. 'I have fought the good fight.'",
  },
  {
    name: "2 Peter",
    chapters: 3,
    date: "c. AD 64–68",
    era: "NT Epistles",
    note: "Peter's farewell. Warnings against false teachers and the coming day of the Lord.",
  },
  {
    name: "Jude",
    chapters: 1,
    date: "c. AD 65–80",
    era: "NT Epistles",
    note: "Brief, fierce letter against false teachers. Shares material with 2 Peter.",
  },

  // === JOHANNINE LITERATURE ===
  {
    name: "1 John",
    chapters: 5,
    date: "c. AD 85–95",
    era: "Johannine Literature",
    note: "Written by the aged apostle John. Tests of fellowship: love, obedience, belief.",
  },
  {
    name: "2 John",
    chapters: 1,
    date: "c. AD 85–95",
    era: "Johannine Literature",
    note: "Brief letter warning against showing hospitality to false teachers.",
  },
  {
    name: "3 John",
    chapters: 1,
    date: "c. AD 85–95",
    era: "Johannine Literature",
    note: "Personal letter about church hospitality and a power-hungry leader named Diotrephes.",
  },

  // === THE APOCALYPSE ===
  {
    name: "Revelation",
    chapters: 22,
    date: "c. AD 95–96",
    era: "The Apocalypse",
    note: "John's vision on Patmos during Domitian's persecution. The climax of the biblical narrative.",
  },
];

export function getBooksByEra(): Map<string, Book[]> {
  const map = new Map<string, Book[]>();
  for (const era of ERAS) {
    map.set(
      era,
      READING_PLAN.filter((b) => b.era === era)
    );
  }
  return map;
}
