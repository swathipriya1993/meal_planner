import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const { plan, message, context } = await req.json();

  const prompt = `You are a meal planning assistant. The user has an existing weekly meal plan and wants to modify it.

CURRENT PLAN:
${JSON.stringify(plan, null, 2)}

USER'S PREFERENCES: ${context.cuisines?.join(", ")} cuisine, ~${context.calories} cal/day, ${context.people} person(s).
${context.proteinTarget ? `Protein target: ${context.proteinTarget}g/day.` : ""}
${context.diets?.length ? `Diet: ${context.diets.join(", ")}` : ""}
${context.allergies?.length ? `Avoid: ${context.allergies.join(", ")}` : ""}

USER'S REQUEST: "${message}"

Apply the user's requested changes to the meal plan. Keep everything else the same. Each meal must have: meal, calories, protein, fiber.

Respond with ONLY valid JSON:
{
  "reply": "Brief friendly summary of what you changed (1-2 sentences)",
  "plan": { the complete updated plan object with mealPrep, days, recipes, groceryList }
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || "Failed" }, { status: 500 });
  }

  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    if (parsed.plan?.days) {
      if (!parsed.plan.recipes) parsed.plan.recipes = plan.recipes;
      if (!parsed.plan.groceryList) parsed.plan.groceryList = plan.groceryList;
      if (!parsed.plan.mealPrep) parsed.plan.mealPrep = plan.mealPrep;
    }
    return NextResponse.json(parsed);
  } catch {}
  return NextResponse.json({ reply: "Sorry, I couldn't process that. Try rephrasing?" }, { status: 200 });
}
