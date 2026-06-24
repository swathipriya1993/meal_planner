import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  let { text } = await req.json();

  // If it's a URL, fetch the page content
  if (text.trim().match(/^https?:\/\//)) {
    try {
      const res = await fetch(text.trim(), { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await res.text();
      // Strip HTML tags, keep text content (limit to 3000 chars to save tokens)
      text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3000);
    } catch {
      return NextResponse.json({ error: "Couldn't fetch that URL. Try pasting the recipe text instead." }, { status: 400 });
    }
  }

  const prompt = `Extract a recipe from the following text. The text might be a caption from Instagram/TikTok, a pasted recipe, or informal notes. Extract whatever you can.

TEXT:
${text}

Respond with ONLY valid JSON:
{
  "name": "Recipe name",
  "time": "estimated cook time e.g. 30 min",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2"],
  "steps": ["step 1", "step 2"],
  "calories": estimated calories per serving (number),
  "protein": estimated protein grams (number),
  "fiber": estimated fiber grams (number),
  "cuisine": "detected cuisine or General"
}

If the text is too vague to extract a recipe, still try your best with what's given. Estimate nutrition based on typical portions.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
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
  return NextResponse.json({ error: "Could not parse recipe" }, { status: 500 });
}
