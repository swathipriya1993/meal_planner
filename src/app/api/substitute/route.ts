import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const { ingredient, recipeName, step } = await req.json();

  const prompt = `I'm cooking "${recipeName}" and I don't have "${ingredient}".
${step ? `Current step: "${step}"` : ""}
Suggest the best substitute in 1-2 short sentences. Be specific about quantity conversion.
Respond ONLY with JSON: {"substitute": "Use X instead — same quantity", "tip": "optional short cooking tip"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || "Failed" }, { status: 500 });
  }

  const data = await res.json();
  try {
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {}
  return NextResponse.json({ error: "Could not parse response" }, { status: 500 });
}
