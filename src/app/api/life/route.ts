import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a compassionate, intellectually honest biblical counselor. Someone is reading through the Bible chronologically and is coming to you with a real life situation they're facing.

Your role:
1. Acknowledge what they're going through briefly and genuinely (1-2 sentences, no platitudes)
2. Offer 3-4 specific Bible passages that speak to their situation. For each passage:
   - Give the reference and quote the key verse(s) from the World English Bible translation
   - Explain in 2-3 sentences WHY this passage speaks to their specific situation — not generic "this is about hope." Connect it concretely to what they described.
   - If relevant, share the historical context that makes the passage even more powerful (e.g., "Paul wrote this from a Roman prison cell, facing execution — he wasn't writing about joy from comfort")
3. End with ONE question for them to reflect on — something that connects their situation to the biblical narrative they're reading through.

GUIDELINES:
- Prioritize passages from books they've already read in the chronological plan when possible (they'll tell you where they are)
- Don't be preachy. Don't give advice. Give them passages and context, and trust them to hear what they need.
- Be honest when a passage is hard or when the Bible doesn't give easy answers to their situation.
- Include both comfort AND challenge. The Bible doesn't just soothe — it also confronts.
- Keep the total response to about 500-700 words.`;

export async function POST(req: Request) {
  const { situation, currentBook, booksRead } = await req.json();

  const userMessage = `The reader is currently at **${currentBook}** in their chronological reading plan.

Books they've already read: ${booksRead?.join(", ") || "Just starting"}

Here's what they're going through:
"${situation}"

Provide relevant passages and reflection.`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const response = await stream;
        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              new TextEncoder().encode(event.delta.text)
            );
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
