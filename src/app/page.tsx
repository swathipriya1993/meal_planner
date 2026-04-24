"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const CUISINES = [
  "South Indian", "North Indian", "Persian", "Mediterranean",
  "Thai", "Mexican", "Japanese", "Korean", "Italian", "Chinese",
];
const DIETS = ["Keto", "Paleo", "Vegetarian", "Vegan", "Pescatarian"];
const HEALTH_GOALS = [
  "Weight loss", "Muscle gain", "Balanced", "Anti-inflammatory",
  "Gut health", "Heart healthy", "Low glycemic", "Diabetic-friendly",
];
const ALLERGIES = ["Gluten-free", "Dairy-free", "Nut-free", "Soy-free", "Egg-free"];
const PROTEINS = ["Chicken", "Fish", "Shrimp", "Eggs", "Tofu", "Lentils", "Paneer", "Lamb", "Beef"];
const CARBS = ["Rice", "Bread/Roti", "Noodles", "Quinoa", "Sweet Potato", "Millet", "Pasta"];
const PANTRY = ["Basic spices", "Coconut milk", "Yogurt", "Olive oil", "Ghee", "Soy sauce", "Fish sauce"];

function Section({ title, icon, children, defaultOpen = true, badge }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">{icon} {title}</span>
          {badge && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function Chips({ options, selected, toggle }: {
  options: string[]; selected: Set<string>; toggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            selected.has(opt)
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.03]"
              : "bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-100"
          }`}
        >{opt}</button>
      ))}
    </div>
  );
}

type Meal = { meal: string; calories: number; protein: number; fiber: number };
type DayPlan = { day: string; breakfast: Meal; lunch: Meal; dinner: Meal; snack: Meal };
type Recipe = { name: string; time: string; ingredients: string[]; steps: string[] };
type PlanData = { mealPrep: string; days: DayPlan[]; recipes: Recipe[]; groceryList: string[] };

const DAY_EMOJI: Record<string, string> = {
  Monday: "🟢", Tuesday: "🔵", Wednesday: "🟣", Thursday: "🟠", Friday: "🔴", Saturday: "🟡", Sunday: "⚪",
};

function MealTable({ days, onSwap, swappingKey }: {
  days: DayPlan[]; onSwap: (day: string, type: string) => void; swappingKey: string;
}) {
  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <th className="p-3 text-left rounded-tl-xl font-semibold w-20">Day</th>
              <th className="p-3 text-left font-semibold">🌅 Breakfast</th>
              <th className="p-3 text-left font-semibold">☀️ Lunch</th>
              <th className="p-3 text-left font-semibold">🌙 Dinner</th>
              <th className="p-3 text-left font-semibold rounded-tr-xl">🍎 Snack</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => {
              const total = d.breakfast.calories + d.lunch.calories + d.dinner.calories + d.snack.calories;
              const totalP = (d.breakfast.protein||0) + (d.lunch.protein||0) + (d.dinner.protein||0) + (d.snack.protein||0);
              return (
                <tr key={d.day} className={`${i % 2 === 0 ? "bg-white" : "bg-emerald-50/50"} border-b border-gray-100 hover:bg-emerald-50 transition-colors`}>
                  <td className="p-3">
                    <div className="font-bold text-emerald-800 text-xs">{d.day.slice(0, 3)}</div>
                    <div className="text-[10px] text-emerald-600">{total} cal</div>
                    <div className="text-[10px] text-blue-600">{totalP}g P</div>
                  </td>
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => {
                    const meal = d[type];
                    return (
                      <td key={type} className="p-3 group relative">
                        <div className="font-medium text-gray-800 text-xs leading-snug pr-6">{meal.meal}</div>
                        <div className="text-[10px] text-emerald-600 mt-0.5">{meal.calories} cal · {meal.protein||0}g P · {meal.fiber||0}g F</div>
                        <button onClick={() => onSwap(d.day, type)}
                          disabled={swappingKey === `${d.day}-${type}`}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm flex items-center justify-center"
                        >{swappingKey === `${d.day}-${type}` ? "⏳" : "🔄"}</button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: Cards */}
      <div className="sm:hidden space-y-3">
        {days.map((d) => {
          const total = d.breakfast.calories + d.lunch.calories + d.dinner.calories + d.snack.calories;
          const totalP = (d.breakfast.protein||0) + (d.lunch.protein||0) + (d.dinner.protein||0) + (d.snack.protein||0);
          const meals = [
            { type: "breakfast", label: "Breakfast", icon: "🌅", meal: d.breakfast },
            { type: "lunch", label: "Lunch", icon: "☀️", meal: d.lunch },
            { type: "dinner", label: "Dinner", icon: "🌙", meal: d.dinner },
            { type: "snack", label: "Snack", icon: "🍎", meal: d.snack },
          ];
          return (
            <div key={d.day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-sm">{d.day}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-full shadow-sm">{total} cal · {totalP}g P</span>
              </div>
              <div className="divide-y divide-gray-50">
                {meals.map(({ type, label, icon, meal }) => (
                  <div key={type} className="px-4 py-2.5 flex items-start justify-between group">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{icon} {label}</span>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{meal.meal}</p>
                      <span className="text-xs text-emerald-600">{meal.calories} cal · {meal.protein||0}g P · {meal.fiber||0}g F</span>
                    </div>
                    <button onClick={() => onSwap(d.day, type)}
                      disabled={swappingKey === `${d.day}-${type}`}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 text-xs"
                    >{swappingKey === `${d.day}-${type}` ? "⏳" : "🔄"}</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function RecipeCard({ recipe, index, onCook }: { recipe: Recipe; index: number; onCook: (r: Recipe) => void }) {
  const [open, setOpen] = useState(false);
  const colors = ["bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-green-500", "bg-lime-500", "bg-amber-500"];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <button onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors">
        <div className={`w-10 h-10 rounded-xl ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 truncate">{recipe.name}</h4>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-500">⏱ {recipe.time}</span>
            <span className="text-xs text-gray-500">📝 {recipe.ingredients.length} ingredients</span>
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-300 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ingredients</p>
            <div className="grid grid-cols-2 gap-1.5">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  {ing}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Instructions</p>
            <ol className="space-y-3">
              {recipe.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <button onClick={() => onCook(recipe)}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all">
            👨‍🍳 Start Cook Mode
          </button>
        </div>
      )}
    </div>
  );
}

function CookMode({ recipe, onExit }: { recipe: Recipe; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [timers, setTimers] = useState<Record<number, number>>({});
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [subQuery, setSubQuery] = useState("");
  const [subResult, setSubResult] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const intervalsRef = useRef<Record<number, NodeJS.Timeout>>({});

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const readStep = useCallback((i: number) => {
    if (i >= 0 && i < recipe.steps.length) {
      speak(`Step ${i + 1}. ${recipe.steps[i]}`);
    }
  }, [recipe.steps, speak]);

  const goNext = useCallback(() => {
    setStep(s => { const n = Math.min(s + 1, recipe.steps.length - 1); readStep(n); return n; });
  }, [recipe.steps.length, readStep]);

  const goPrev = useCallback(() => {
    setStep(s => { const n = Math.max(s - 1, 0); readStep(n); return n; });
  }, [readStep]);

  const startTimer = useCallback((minutes: number) => {
    const id = Date.now();
    setTimers(t => ({ ...t, [id]: minutes * 60 }));
    const iv = setInterval(() => {
      setTimers(t => {
        const remaining = (t[id] || 0) - 1;
        if (remaining <= 0) {
          clearInterval(iv);
          speak("Timer done!");
          const { [id]: _, ...rest } = t;
          return rest;
        }
        return { ...t, [id]: remaining };
      });
    }, 1000);
    intervalsRef.current[id] = iv;
    speak(`Timer set for ${minutes} minute${minutes > 1 ? "s" : ""}`);
  }, [speak]);

  const askSubstitute = useCallback(async (ingredient: string) => {
    setSubLoading(true); setSubResult("");
    try {
      const res = await fetch("/api/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient, recipeName: recipe.name, step: recipe.steps[step] }),
      });
      const data = await res.json();
      const msg = data.substitute || data.error || "No suggestion";
      setSubResult(msg + (data.tip ? ` ${data.tip}` : ""));
      speak(msg);
    } catch { setSubResult("Couldn't get substitute"); }
    finally { setSubLoading(false); }
  }, [recipe.name, recipe.steps, step, speak]);

  // Voice recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
      if (t.includes("next")) goNext();
      else if (t.includes("back") || t.includes("previous")) goPrev();
      else if (t.includes("repeat") || t.includes("again")) readStep(step);
      else if (t.includes("timer")) {
        const m = t.match(/(\d+)/);
        startTimer(m ? parseInt(m[1]) : 5);
      } else if (t.includes("substitute") || t.includes("replace") || t.includes("don't have")) {
        const cleaned = t.replace(/(substitute|replace|i don't have|don't have|what can i use instead of)/g, "").trim();
        if (cleaned) askSubstitute(cleaned);
      }
    };
    r.onend = () => { if (listening) try { r.start(); } catch {} };
    recognitionRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, [goNext, goPrev, readStep, startTimer, askSubstitute, listening, step]);

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      try { recognitionRef.current?.start(); setListening(true); } catch {}
    }
  };

  // Cleanup timers
  useEffect(() => {
    return () => { Object.values(intervalsRef.current).forEach(clearInterval); };
  }, []);

  const total = recipe.steps.length;

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <button onClick={() => { window.speechSynthesis?.cancel(); onExit(); }}
          className="text-gray-400 hover:text-white text-sm font-medium">✕ Exit</button>
        <h2 className="font-bold text-sm truncate max-w-[60%]">👨‍🍳 {recipe.name}</h2>
        <button onClick={toggleVoice}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            listening ? "bg-red-500 animate-pulse" : "bg-emerald-600 hover:bg-emerald-500"
          }`}>{listening ? "🎙 Listening" : "🎙 Voice"}</button>
      </div>

      {/* Timers */}
      {Object.keys(timers).length > 0 && (
        <div className="flex gap-2 px-4 py-2 bg-amber-900/50 overflow-x-auto">
          {Object.entries(timers).map(([id, secs]) => (
            <div key={id} className="flex items-center gap-2 bg-amber-800 px-3 py-1.5 rounded-full text-sm font-mono shrink-0">
              <span>⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span>
              <button onClick={() => { clearInterval(intervalsRef.current[Number(id)]); setTimers(t => { const { [Number(id)]: _, ...rest } = t; return rest; }); }}
                className="text-amber-400 hover:text-white text-xs">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Step {step + 1} of {total}</span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* Current Step */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-emerald-900/50">
            {step + 1}
          </div>
          <p className={`text-xl sm:text-2xl font-medium leading-relaxed ${speaking ? "text-emerald-400" : "text-white"}`}>
            {recipe.steps[step]}
          </p>
        </div>
      </div>

      {/* Substitute */}
      {(subResult || subLoading) && (
        <div className="mx-4 mb-2 p-3 bg-blue-900/50 border border-blue-700 rounded-xl text-sm">
          {subLoading ? "🔍 Finding substitute..." : `💡 ${subResult}`}
        </div>
      )}

      {/* Substitute input */}
      <div className="px-4 mb-2">
        <div className="flex gap-2">
          <input type="text" value={subQuery} onChange={e => setSubQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && subQuery.trim()) { askSubstitute(subQuery.trim()); setSubQuery(""); } }}
            placeholder="Don't have an ingredient? Type it..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          <button onClick={() => { if (subQuery.trim()) { askSubstitute(subQuery.trim()); setSubQuery(""); } }}
            disabled={subLoading || !subQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-semibold">Swap</button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center justify-center gap-3">
          <button onClick={goPrev} disabled={step === 0}
            className="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-xl transition-all">◀</button>
          <button onClick={() => readStep(step)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all ${
              speaking ? "bg-emerald-600 shadow-lg shadow-emerald-900/50 scale-105" : "bg-emerald-700 hover:bg-emerald-600"
            }`}>🔊</button>
          <button onClick={goNext} disabled={step === total - 1}
            className="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-xl transition-all">▶</button>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <button onClick={() => startTimer(5)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm">⏱ 5 min</button>
          <button onClick={() => startTimer(10)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm">⏱ 10 min</button>
          <button onClick={() => startTimer(15)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm">⏱ 15 min</button>
        </div>
        {listening && (
          <p className="text-center text-xs text-gray-500 mt-3">
            Say: &quot;next&quot; · &quot;back&quot; · &quot;repeat&quot; · &quot;timer 5&quot; · &quot;substitute coconut milk&quot;
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="shimmer h-24 rounded-2xl"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-48 rounded-2xl"></div>)}
      </div>
    </div>
  );
}

export default function Home() {
  const [cuisines, setCuisines] = useState<Set<string>>(new Set());
  const [customCuisine, setCustomCuisine] = useState("");
  const [diets, setDiets] = useState<Set<string>>(new Set());
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [allergies, setAllergies] = useState<Set<string>>(new Set());
  const [proteins, setProteins] = useState<Set<string>>(new Set());
  const [carbs, setCarbs] = useState<Set<string>>(new Set());
  const [pantry, setPantry] = useState<Set<string>>(new Set());
  const [extraIngredients, setExtraIngredients] = useState("");
  const [mustInclude, setMustInclude] = useState("");
  const [people, setPeople] = useState("1");
  const [calories, setCalories] = useState("1800");
  const [maxPrepTime, setMaxPrepTime] = useState("30");
  const [proteinTarget, setProteinTarget] = useState("");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [rawPlan, setRawPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [swappingKey, setSwappingKey] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"plan" | "recipes" | "grocery">("plan");
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setFn(next);
  };

  const addCustomCuisine = () => {
    const val = customCuisine.trim();
    if (val && !cuisines.has(val)) {
      const next = new Set(cuisines);
      next.add(val);
      setCuisines(next);
      setCustomCuisine("");
    }
  };

  const buildContext = () => ({
    cuisines: [...cuisines], diets: [...diets], goals: [...goals],
    allergies: [...allergies], proteins: [...proteins], carbs: [...carbs],
    pantry: [...pantry], extraIngredients, mustInclude,
    people: Number(people), calories: Number(calories), maxPrepTime: Number(maxPrepTime),
    proteinTarget: proteinTarget ? Number(proteinTarget) : null,
  });

  const generate = async () => {
    if (cuisines.size === 0) { setError("Pick at least one cuisine"); return; }
    setLoading(true); setError(""); setPlan(null); setRawPlan("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildContext()),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const data = await res.json();
      if (typeof data.plan === "object" && data.plan.days) {
        setPlan(data.plan);
        setActiveTab("plan");
      } else {
        setRawPlan(typeof data.plan === "string" ? data.plan : JSON.stringify(data.plan, null, 2));
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const swapMeal = async (day: string, mealType: string) => {
    if (!plan) return;
    const key = `${day}-${mealType}`;
    setSwappingKey(key);
    try {
      const currentMeal = plan.days.find(d => d.day === day)?.[mealType as keyof DayPlan] as Meal;
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildContext(), day, mealType, currentMeal: currentMeal?.meal }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Swap failed"); }
      const data = await res.json();
      if (data.meal) {
        setPlan({ ...plan, days: plan.days.map(d =>
          d.day === day ? { ...d, [mealType]: data.meal } : d
        )});
      }
    } catch (e: any) { setError(e.message); }
    finally { setSwappingKey(""); }
  };

  const totalCals = plan?.days.map(d => d.breakfast.calories + d.lunch.calories + d.dinner.calories + d.snack.calories);
  const avgCals = totalCals ? Math.round(totalCals.reduce((a, b) => a + b, 0) / 7) : 0;
  const totalProts = plan?.days.map(d => (d.breakfast.protein||0) + (d.lunch.protein||0) + (d.dinner.protein||0) + (d.snack.protein||0));
  const avgProt = totalProts ? Math.round(totalProts.reduce((a, b) => a + b, 0) / 7) : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* Hero */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI-Powered · Free Forever
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
          Weekly Meal<br /><span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Planner</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Authentic cuisine · Smart meal prep · Personalized to you</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 px-5 py-2 mb-6">
        <Section title="Cuisines" icon="🌍" defaultOpen={true}>
          <Chips options={CUISINES} selected={cuisines} toggle={toggle(cuisines, setCuisines)} />
          <div className="flex gap-2 mt-3">
            <input type="text" value={customCuisine} onChange={(e) => setCustomCuisine(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomCuisine()}
              placeholder="Add custom (e.g. Lebanese, Ethiopian)"
              className="flex-1 border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200 bg-gray-50" />
            <button type="button" onClick={addCustomCuisine}
              className="px-4 py-2 rounded-xl text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors">+</button>
          </div>
        </Section>

        <Section title="What I have" icon="🧊" badge="Optional" defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Proteins</p>
              <Chips options={PROTEINS} selected={proteins} toggle={toggle(proteins, setProteins)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Carbs</p>
              <Chips options={CARBS} selected={carbs} toggle={toggle(carbs, setCarbs)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Pantry</p>
              <Chips options={PANTRY} selected={pantry} toggle={toggle(pantry, setPantry)} />
            </div>
            <input type="text" value={extraIngredients} onChange={(e) => setExtraIngredients(e.target.value)}
              placeholder="Anything else? (spinach, mushrooms, coconut...)"
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-gray-50" />
          </div>
        </Section>

        <Section title="Craving something specific?" icon="💡" badge="Optional" defaultOpen={true}>
          <input type="text" value={mustInclude} onChange={(e) => setMustInclude(e.target.value)}
            placeholder="e.g. Kali Mirch Chicken, Pasta Carbonara, Dosa..."
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1.5">Optional — we&apos;ll build the week around these dishes</p>
        </Section>

        <Section title="Diet & Health" icon="🎯" badge="Optional" defaultOpen={false}>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Diet</p>
              <Chips options={DIETS} selected={diets} toggle={toggle(diets, setDiets)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Health Goals</p>
              <Chips options={HEALTH_GOALS} selected={goals} toggle={toggle(goals, setGoals)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Allergies</p>
              <Chips options={ALLERGIES} selected={allergies} toggle={toggle(allergies, setAllergies)} />
            </div>
          </div>
        </Section>

        <Section title="Preferences" icon="⚙️" badge="Optional" defaultOpen={false}>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Daily calories</span>
                <span className="text-sm font-bold text-emerald-600">{calories} cal</span>
              </div>
              <input type="range" min="1200" max="3500" step="100" value={calories}
                onChange={(e) => setCalories(e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>1200</span><span>2000</span><span>3500</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Max prep time</span>
                <span className="text-sm font-bold text-emerald-600">{maxPrepTime} min</span>
              </div>
              <input type="range" min="10" max="60" step="5" value={maxPrepTime}
                onChange={(e) => setMaxPrepTime(e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>10 min</span><span>30 min</span><span>60 min</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Daily protein target</span>
                <span className="text-sm font-bold text-emerald-600">{proteinTarget ? `${proteinTarget}g` : "Auto"}</span>
              </div>
              <input type="range" min="0" max="250" step="10" value={proteinTarget || "0"}
                onChange={(e) => setProteinTarget(e.target.value === "0" ? "" : e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>Auto</span><span>120g</span><span>250g</span></div>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-2">People</span>
              <div className="flex gap-2">
                {[1,2,3,4,5,6].map(n => (
                  <button key={n} type="button" onClick={() => setPeople(String(n))}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      people === String(n)
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-gray-50 text-gray-500 hover:bg-emerald-50 border border-gray-100"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Generate Button */}
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-3 border border-red-100">{error}</div>}
      <button onClick={generate} disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-200 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-emerald-200/50 mb-6">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Crafting your plan...
          </span>
        ) : "✨ Generate Weekly Plan"}
      </button>
      {loading && <LoadingSkeleton />}

      {/* Results */}
      {plan && (
        <div className="space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl sticky top-2 z-10 backdrop-blur-sm">
            {([
              ["plan", "📋 Plan", ""],
              ["recipes", "👨‍🍳 Recipes", `${plan.recipes.length}`],
              ["grocery", "🛒 Shop", `${plan.groceryList.length}`],
            ] as const).map(([key, label, count]) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>{label}{count ? <span className="ml-1 text-xs opacity-60">({count})</span> : ""}</button>
            ))}
          </div>

          {/* Plan Tab */}
          {activeTab === "plan" && (
            <div className="space-y-3">
              {/* Stats Bar */}
              <div className="flex gap-2">
                <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-lg font-black text-emerald-700">{avgCals}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 uppercase">avg cal/day</div>
                </div>
                <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <div className="text-lg font-black text-blue-700">{avgProt}g</div>
                  <div className="text-[10px] font-semibold text-blue-600 uppercase">avg protein</div>
                </div>
                <div className="flex-1 bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
                  <div className="text-lg font-black text-teal-700">{plan.recipes.length}</div>
                  <div className="text-[10px] font-semibold text-teal-600 uppercase">recipes</div>
                </div>
                <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                  <div className="text-lg font-black text-amber-700">{plan.groceryList.length}</div>
                  <div className="text-[10px] font-semibold text-amber-600 uppercase">to buy</div>
                </div>
              </div>

              {/* Meal Prep */}
              {plan.mealPrep && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🍳</span>
                    <h3 className="font-bold text-amber-900">Meal Prep Sunday</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">{plan.mealPrep}</p>
                </div>
              )}

              {/* Day Table/Cards */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <MealTable days={plan.days} onSwap={swapMeal} swappingKey={swappingKey} />
                <p className="text-xs text-gray-400 text-center mt-3">Hover a meal → 🔄 to swap</p>
              </div>
            </div>
          )}

          {/* Recipes Tab */}
          {activeTab === "recipes" && (
            <div className="space-y-3">
              {plan.recipes.length > 0 ? plan.recipes.map((r, i) => <RecipeCard key={i} recipe={r} index={i} onCook={setCookingRecipe} />)
                : <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-2">👨‍🍳</p>
                    <p>No recipes returned. Try generating again.</p>
                  </div>}
            </div>
          )}

          {/* Grocery Tab */}
          {activeTab === "grocery" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">🛒 Shopping List</h2>
              </div>
              {plan.groceryList.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {plan.groceryList.map((item, i) => (
                    <label key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input type="checkbox" className="peer w-5 h-5 rounded-lg border-2 border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-gray-700 peer-checked:line-through peer-checked:text-gray-400 transition-all">{item}</span>
                    </label>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-8">No extra groceries needed! 🎉</p>}
            </div>
          )}
        </div>
      )}

      {rawPlan && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-3">📋 Your Weekly Plan</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">{rawPlan}</div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-300 mt-10">Meal Planner · AI-powered</footer>
      {cookingRecipe && <CookMode recipe={cookingRecipe} onExit={() => setCookingRecipe(null)} />}
    </main>
  );
}
