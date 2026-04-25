import { NextRequest, NextResponse } from "next/server";

const CUISINE_VEGGIES: Record<string, string> = {
  "South Indian": "drumstick, curry leaves, green beans, carrots, bottle gourd",
  "North Indian": "potatoes, peas, cauliflower, bell peppers, okra",
  "Persian": "eggplant, herbs (parsley, mint, dill, cilantro), dried limes, saffron",
  "Thai": "Thai basil, lemongrass, galangal, bean sprouts, kaffir lime leaves",
  "Mediterranean": "zucchini, eggplant, artichokes, olives, sun-dried tomatoes",
  "Mexican": "corn, avocado, jalapeños, black beans, cilantro",
  "Japanese": "daikon, edamame, napa cabbage, shiitake mushrooms",
  "Korean": "Korean radish, perilla leaves, bean sprouts, zucchini, gochugaru",
  "Italian": "zucchini, eggplant, arugula, cherry tomatoes, basil",
  "Chinese": "bok choy, Chinese broccoli, snow peas, water chestnuts",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  const { cuisines, diets, goals, allergies, proteins, carbs, pantry, extraIngredients, mustInclude, people, calories, maxPrepTime, proteinTarget, freetext } = await req.json();

  const veggieList = cuisines.map((c: string) => CUISINE_VEGGIES[c] ? `${c}: ${CUISINE_VEGGIES[c]}` : "").filter(Boolean).join(". ");

  const prompt = `You are an expert chef specializing in authentic ${cuisines.join(" and ")} cuisine, and also a meal-prep strategist.

Create a practical weekly meal plan (Mon-Sun) using ONLY authentic ${cuisines.join("/")} dishes.

${mustInclude ? `MUST-INCLUDE DISHES: The user specifically wants to make: ${mustInclude}. Build the weekly plan around these dishes. Use leftovers from these dishes in other meals across the week. Include full recipes for these dishes.` : ""}

INPUTS:
- Proteins: ${(proteins || []).join(", ") || "any"}
- Carbs: ${(carbs || []).join(", ") || "any"}
- Pantry: ${(pantry || []).join(", ")}
${veggieList ? `- Cuisine-appropriate veggies: ${veggieList}` : ""}
${extraIngredients ? `- Extra: ${extraIngredients}` : ""}
${diets.length ? `- Diet: ${diets.join(", ")}` : ""}
${goals.length ? `- Goals: ${goals.join(", ")}` : ""}
${allergies.length ? `- AVOID: ${allergies.join(", ")}` : ""}
- For ${people} person(s), ~${calories} cal/day, max ${maxPrepTime} min prep per meal
${proteinTarget ? `- DAILY PROTEIN TARGET: ~${proteinTarget}g protein per day. To hit this, you MUST choose high-protein dishes. Do NOT put high protein numbers on low-protein foods. Instead, CHANGE the dish to something protein-rich.` : ""}
${freetext ? `- SPECIAL REQUEST FROM USER: ${freetext}` : ""}

CRITICAL RULES:
1. Use REAL dish names from ${cuisines.join("/")} cuisine (e.g., Moussaka not "eggplant bake", Pad Kra Pao not "basil stir-fry", Sambar not "lentil soup")
2. MEAL PREP STRATEGY: On Sunday batch-cook 2-3 bases (a curry/stew, marinated protein, grain). Reuse across days differently (curry → lunch bowl → wrap filling → salad topping)
3. Repeat 2-3 breakfasts across the week (realistic)
4. At least 3 lunches should use leftovers/batch items
5. Vary calories naturally (not every breakfast the same calories)
6. Stick STRICTLY to ${cuisines.join("/")} cuisine — no fusion or generic "healthy bowls"
7. For snacks: only suggest things that are either in the available ingredients, simple to make (with recipe), or common store-bought items. Don't assume specialty items like murukku or pappadam are available — add them to the grocery list if used.
8. ACCURATE NUTRITION — THIS IS THE MOST IMPORTANT RULE:
   - You MUST report real-world accurate protein/fiber for the dish and portion.
   - Reference values you MUST follow: plain idli (1 piece, 40g) = 2g protein. Dosa (1 plain) = 3g protein. 100g cooked chicken = 31g protein. 1 whole egg = 6g protein. 100g paneer = 18g protein. 1 cup cooked toor dal = 12g protein. 1 cup cooked rice = 4g protein. 100g Greek yogurt = 10g protein. 100g cooked shrimp = 24g protein. 100g cooked fish = 22g protein.
   - If a breakfast like "idli with chutney" only has 8g protein, report 8g. Do NOT write 30g.
   - If the protein target is high, pick DIFFERENT high-protein dishes (egg dosa, chicken keema, paneer bhurji, pesarattu, dal chilla) instead of lying about idli protein.
   - It is BETTER to not hit the protein target than to report fake numbers. Accuracy over target.

Respond with ONLY valid JSON:
{
  "mealPrep": "Detailed Sunday prep: specific dishes to batch cook, quantities for ${people} person(s), storage instructions",
  "days": [
    {
      "day": "Monday",
      "breakfast": {"meal": "Pesarattu with Ginger Chutney (2 moong dal crepes)", "calories": 340, "protein": 18, "fiber": 6},
      "lunch": {"meal": "Chicken Chettinad with Brown Rice (150g chicken, 1 cup rice)", "calories": 520, "protein": 40, "fiber": 4},
      "dinner": {"meal": "Meen Kulambu with Appam (150g fish curry, 2 appams)", "calories": 450, "protein": 34, "fiber": 3},
      "snack": {"meal": "Paneer Tikka (80g paneer, spices)", "calories": 200, "protein": 15, "fiber": 1}
    }
  ],
  "recipes": [
    {
      "name": "Authentic dish name",
      "time": "25 min",
      "ingredients": ["500g chicken thigh", "2 tbsp coconut oil", "10 curry leaves"],
      "steps": ["Heat oil in a heavy pan, add mustard seeds until they pop", "Add curry leaves and onions, sauté 5 min", "..."]
    }
  ],
  "groceryList": ["item (quantity)"]
}

RECIPES: Include 5-6 recipes with real quantities and authentic cooking techniques. Include the batch-cook recipes.
GROCERY LIST: Only items not already available. Include quantities.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || "API call failed" }, { status: 500 });
  }

  const data = await res.json();
  let content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    if (parsed.days && Array.isArray(parsed.days)) {
      if (!parsed.recipes) parsed.recipes = [];
      if (!parsed.groceryList) parsed.groceryList = [];
      if (!parsed.mealPrep) parsed.mealPrep = "";
      return NextResponse.json({ plan: parsed });
    }
  } catch {}

  return NextResponse.json({ plan: content });
}
