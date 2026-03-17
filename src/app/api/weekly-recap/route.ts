import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are writing a warm, insightful weekly recap for a couple (Lesley and Kelvin) doing a chronological Bible study together. They read the same chapters, write independent reflections, and express daily gratitude for each other.

Given the week's data (chapters read, reflections, gratitude entries), write a recap with these sections:

## This Week's Journey
1-2 sentences about what they read and the narrative arc of the week. Reference specific chapters.

## Where You Saw Differently
Pick the reflection where their answers diverged most. Quote a short snippet from each. Frame it as an invitation to discuss — not a problem, but a window into how they each see the world.

## Where You Aligned
Pick a reflection or gratitude where they said something similar or complementary. Highlight the shared value or instinct.

## What You're Grateful For
Highlight the most specific/meaningful gratitude entries from both. Celebrate the small details they noticed about each other.

## A Question for Next Week
Based on the themes in their readings and reflections, give them ONE question to carry into the next week of reading. Make it relationship-focused, not theological.

Keep the tone warm, direct, and personal — like a wise friend summarizing the week. 400-500 words max. No generic filler.`;

export async function POST(req: Request) {
  const { weeklyData } = await req.json();

  const userMessage = `Here is the couple's Bible study data from this past week:

**Chapters Read:**
${weeklyData.progress
  .map(
    (p: { user_name: string; book: string; chapter: number }) =>
      `- ${p.user_name}: ${p.book} ${p.chapter}`
  )
  .join("\n") || "No chapters logged this week."}

**Reflections (responses to shared prompts):**
${weeklyData.reflections
  .map(
    (r: {
      user_name: string;
      book: string;
      chapter: number;
      content: string;
    }) => `- ${r.user_name} on ${r.book} ${r.chapter}: "${r.content}"`
  )
  .join("\n") || "No reflections this week."}

**Gratitude Entries:**
${weeklyData.gratitude
  .map(
    (g: {
      user_name: string;
      book: string;
      chapter: number;
      content: string;
    }) => `- ${g.user_name} after ${g.book} ${g.chapter}: "${g.content}"`
  )
  .join("\n") || "No gratitude entries this week."}

Write the weekly recap.`;

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
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
            controller.enqueue(new TextEncoder().encode(event.delta.text));
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
