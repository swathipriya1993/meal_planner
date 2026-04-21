# Meal Planner - How to Run

## Quick Start (run these commands)

```bash
cd ~/meal-planner
npm run build
npm start -- -p 3000
```

## Access from your Windows PC

1. Open **PowerShell** on your Windows PC
2. Run the SSH tunnel:
   ```
   ssh -L 9090:localhost:3000 eswadha@100.77.161.80
   ```
3. Open browser: **http://localhost:9090**

## Project Structure

```
~/meal-planner/
├── .env.local              # API key (OpenAI) - DO NOT share
├── src/app/
│   ├── page.tsx            # Main UI
│   ├── layout.tsx          # App layout
│   ├── globals.css         # Styles
│   └── api/
│       ├── generate/route.ts   # Meal plan generation API
│       └── swap/route.ts       # Meal swap API
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## If something breaks

```bash
# Kill any running server
pkill -f "next"

# Rebuild and restart
cd ~/meal-planner
rm -rf .next
npm run build
npm start -- -p 3000
```

## Tech Stack
- **Frontend:** Next.js 14 + React + Tailwind CSS
- **AI:** OpenAI GPT-4o-mini ($5 credit loaded, lasts ~5 years)
- **Hosting:** Local server (100.77.161.80), accessed via SSH tunnel

## To deploy publicly (so it works on phone)
1. Push to GitHub
2. Connect to Vercel (free)
3. Add OPENAI_API_KEY in Vercel environment variables
4. Get a public URL like meal-planner.vercel.app

## API Key
- Stored in: ~/meal-planner/.env.local
- Provider: OpenAI (platform.openai.com)
- Model: gpt-4o-mini
- Balance: $5 (~500 meal plans)
