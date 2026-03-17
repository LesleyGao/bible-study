import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are helping two people (Lesley and Kelvin) grow in faith and self-awareness through chronological Bible study. They read the same chapter and each write a private reflection before seeing what the other wrote.

For the given chapter, generate ONE reflection question that:
1. Is grounded in something specific from the passage — a verse, a character's choice, a moment of tension
2. Connects to REAL LIFE — not abstract theology. Draw from the full range of human experience:
   - Work & ambition (career pressure, purpose, burnout, comparison)
   - Friendships (loyalty, jealousy, growing apart, showing up)
   - Faith & doubt (trust, prayer, silence from God, hypocrisy)
   - Character flaws (revenge, bitterness, pride, selfishness, people-pleasing)
   - Family (expectations, forgiveness, obligation, grief)
   - Money & provision (anxiety, generosity, greed, trust)
   - Their relationship as a couple (communication, blame, support, vulnerability)
   - Identity (who they are vs. who they're becoming, insecurity, masks)
3. Requires vulnerability — they should have to share something real and personal, not give a "right answer"
4. Can be answered honestly in 2-5 sentences

Vary the topic naturally based on what the passage is actually about. Don't force every question to be about their relationship — sometimes the most powerful question is about how they individually navigate work, friendships, or their own character. The couple dimension comes from seeing each other's honest answer, not from the question always being about each other.

Examples of great reflection questions (notice the range):
- Genesis 3 (blame): "Adam blamed Eve. Eve blamed the serpent. Think about the last conflict you had — at work, with a friend, or at home. Did you own your part, or did you find someone else to point at?"
- Genesis 4 (jealousy): "Cain's offering was rejected and Abel's wasn't. When someone close to you gets something you wanted — a promotion, recognition, an opportunity — what's your honest first reaction? Happiness for them, or something darker?"
- Genesis 16 (impatience): "Sarai couldn't wait for God's promise, so she engineered her own solution. Where in your life right now are you trying to force an outcome instead of being patient?"
- Exodus 2 (injustice): "Moses saw injustice and acted — violently, impulsively, alone. When you see something wrong at work or in a friendship, do you speak up, stay quiet, or act out? Why?"
- 1 Samuel 18 (envy): "Saul heard 'Saul has slain thousands, David tens of thousands' and it consumed him. Is there someone in your life whose success makes you feel small? What does that reveal about what you're building your identity on?"
- Proverbs 27 (honesty): "'Faithful are the wounds of a friend.' Is there something a friend or your partner needs to hear from you that you've been too afraid to say? What's stopping you?"
- Jonah 4 (bitterness): "Jonah was angry that God showed mercy to people Jonah thought deserved punishment. Is there someone you secretly hope doesn't get a break? What would it cost you to let that go?"

Return ONLY the question. No preamble, no explanation. 2-3 sentences max.`;

export async function POST(req: Request) {
  const { book, chapter, text } = await req.json();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate a couple reflection question for **${book} ${chapter}**.\n\nKey passage content:\n${text?.slice(0, 2000) || `${book} chapter ${chapter}`}`,
      },
    ],
  });

  const prompt =
    response.content[0].type === "text" ? response.content[0].text : "";

  return Response.json({ prompt });
}
