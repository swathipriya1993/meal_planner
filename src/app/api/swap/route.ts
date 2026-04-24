import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const { cuisines, diets, goals, allergies, calories, maxPrepTime, day, mealType, currentMeal } = await req.json();

  const prompt = `Suggest ONE alternative authentic ${cuisines.join("/")} ${mealType} for ${day}.
Current meal to replace: ${currentMeal}
${diets.length ? `Diet: ${diets.join(", ")}` : ""}
${goals.length ? `Goals: ${goals.join(", ")}` : ""}
${allergies.length ? `Avoid: ${allergies.join(", ")}` : ""}
Daily target: ~${calories} cal. Max prep: ${maxPrepTime} min.
Must be a different dish, authentic to ${cuisines.join("/")}.
Respond ONLY with JSON: {"meal": "Dish name (brief description)", "calories": 350, "protein": 25, "fiber": 5}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || "Swap failed" }, { status: 500 });
  }

  const data = await res.json();
  try {
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch {}
  return NextResponse.json({ error: "Could not parse swap response" }, { status: 500 });
}
