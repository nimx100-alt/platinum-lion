# 🦁 Platinum Lion Deal Intelligence

Premium real estate tool for Platinum Lion Realty — Dundas, ON.

## Features
- 📊 **Deal Tracker** — Pipeline management, status updates, leaderboard with 🔥 streaks
- 🧮 **Mortgage Calculator** — CMHC rules, stress test, year-by-year amortization chart
- 🤖 **AI Assistant** — 3 free questions → contact Nim Yanay for more

---

## Deploy to Netlify in 5 Minutes

### Step 1 — Get your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy it — you'll need it in Step 4

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Platinum Lion app"
git remote add origin https://github.com/YOUR_USERNAME/platinum-lion.git
git push -u origin main
```

### Step 3 — Connect to Netlify
1. Go to [netlify.com](https://netlify.com) → Log in
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → Select your repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.svelte-kit/output/client`
5. Click **Deploy site**

### Step 4 — Add your API Key
1. In Netlify → Site settings → **Environment variables**
2. Add: `ANTHROPIC_API_KEY` = your key from Step 1
3. Trigger a redeploy

### Step 5 — Customize your URL
1. Netlify → Site settings → **Domain management**
2. Change to: `platinum-lion-tracker.netlify.app`
3. Share the link in your WhatsApp group 🎉

---

## Local Development
```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

---

## Built by
**Nim Yanay** · 905-570-4880 · Platinum Lion Realty, Dundas ON
