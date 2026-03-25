import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { rawTasks, aims, milestones } = await req.json();

    const client = new Anthropic();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const name = d.toLocaleDateString("en-US", { weekday: "long" });
      const date = d.toISOString().split("T")[0];
      const isPast = d < today && d.toDateString() !== today.toDateString();
      days.push(`${name} (${date})${isPast ? " [PAST - avoid]" : ""}`);
    }

    const aimsContext = aims
      .map((a: string, i: number) => `- ${a}${milestones[a] ? ` (goal: ${milestones[a]})` : ""}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a chief of staff organizing a creative person's week. Parse this brain dump into structured tasks and assign each to a day this week.

Their aims (what they're putting energy toward):
${aimsContext}

This week's days:
${days.join("\n")}

Their brain dump:
"${rawTasks}"

Return ONLY valid JSON, no other text. Format:
{
  "tasks": [
    {
      "title": "short task title",
      "day": "YYYY-MM-DD",
      "aim": "matching aim name or null",
      "type": "focus | flow | admin"
    }
  ]
}

Rules:
- Break compound items into separate tasks
- Assign tasks to non-past days, spread them out evenly
- Match tasks to aims when there's a clear connection, otherwise null
- "focus" = deep work requiring concentration, "flow" = collaborative or creative, "admin" = logistics/emails/invoices
- Keep task titles concise (under 8 words)
- If they mention a specific day or deadline, respect it`,
        },
      ],
    });

    let text = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Parse tasks error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse tasks" },
      { status: 500 }
    );
  }
}
