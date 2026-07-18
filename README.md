# TapCheck 💧

**Type your ZIP code. Find out what's actually in your tap water — in plain English.**

🔗 **Live app:** https://tapcheck-nine.vercel.app
🎬 **Demo video:** [YouTube link — TODO]
🏆 Built solo in 4 days for **OpenAI Build Week** (Apps for Your Life track), entirely with **Codex + GPT-5.6**.

---

## The problem

The EPA has collected 30+ years of drinking-water data on nearly every US water system — violations, contaminants, enforcement actions. Almost none of it is readable by the people drinking the water. Annual Consumer Confidence Reports run 14+ pages of regulatory jargon. Roughly 50 million Americans are served by systems with recent violations, and most have no idea.

And water that's perfectly legal for humans can still kill your goldfish overnight — chloramine doesn't gas off like chlorine does. Nobody tells you that either.

## What TapCheck does

- **Letter grade + plain-English summary** for your water system, built from live EPA SDWIS data
- **Contaminant trading cards**: human-readable names (not raw EPA codes), what each one is, health effects, exceeded-limit badges — every claim carries a citation chip pointing to the underlying EPA violation record
- **Filter recommendation**: activated carbon vs reverse osmosis vs "you don't need one"
- **Not just for humans 🐟🪴🐾**: fish, plant, and pet safety verdicts (chlorine vs chloramine reasoning for aquariums, fluoride-sensitive species for plants)
- **Shareable holo cards**: every report has a dynamic 1200×630 OG image — paste a report link into iMessage/X/Slack and it unfurls into a graded card; download it as a PNG
- **Honest by design**: zero-violation systems get a deterministic "clean bill" (no AI call at all); where EPA data is missing a parameter, TapCheck says so instead of guessing

## Sample ZIPs to try

| ZIP | System | Why it's interesting |
|---|---|---|
| `07030` | Hoboken, NJ | Grade B, cited violation |
| `12866` | Saratoga Springs, NY | Grade C, multiple contaminants, two systems |
| `10001` | New York City (Croton) | Big-city ZIP resolved via geocoding fallback |
| `30301` | Atlanta, GA | Disinfection-byproduct history (TTHM/HAA5) |

## Architecture

```
ZIP input
  └─ EPA Envirofacts SDWIS (GEOGRAPHIC_AREA → PWSID → WATER_SYSTEM + VIOLATION)
       └─ fallback: Zippopotam.us geocoding + Census reverse-geocoder
          → CITY_SERVED / COUNTY_SERVED lookup (EPA ZIP coverage is partial)
  └─ GPT-5.6 (Responses API, strict structured outputs)
       └─ citation IDs schema-constrained to the actual EPA violation IDs
  └─ Next.js 15 report card UI + dynamic OG share images
```

- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind), server-rendered
- **AI:** GPT-5.6 via the OpenAI Responses API with strict JSON Schema structured outputs
- **Data:** EPA Envirofacts SDWIS (live), Zippopotam.us + US Census geocoder (fallback resolution)
- **Caching:** disk cache keyed by query (EPA) and PWSID + violations-hash (reports); `CACHE_DIR`-configurable, fail-soft writes, checked-in `seeds/` make demo ZIPs instant and API-independent
- **Hosting:** Vercel (serverless-safe: writes go to `/tmp`, seeds are read-only fallbacks)

### The anti-hallucination design

Health-adjacent AI output has to be grounded. TapCheck enforces it structurally, not with prompt vibes:

1. The JSON schema's `citationViolationId` field is an **enum of the actual violation IDs** present in the EPA input — the model *cannot* emit a citation that doesn't exist.
2. Zero violations → deterministic clean-bill report generated in code. **No API call is made**, so there is nothing to hallucinate.
3. Missing parameters (e.g., hardness) produce explicit "data not supplied" statements, with pointers to the utility's own report.

## Running locally

```bash
git clone https://github.com/Pr3ndy-ctrl/tapcheck.git
cd tapcheck
npm install
echo 'OPENAI_API_KEY=sk-your-key' > .env.local
npm run dev
# open http://localhost:3000 and try ZIP 07030
```

Tests (fixture-based, run against real captured EPA responses):

```bash
npm test
```

Serverless simulation:

```bash
VERCEL=1 CACHE_DIR=/tmp/tapcheck-cache npm run build
```

## How Codex + GPT-5.6 built this

The entire codebase was written in a single long-running **Codex CLI session** with **GPT-5.6** (session ID submitted via /feedback). GPT-5.6 also powers the product itself at runtime. Highlights of where Codex did the heavy lifting:

- **Reverse-engineered the EPA API by probing it.** Envirofacts sometimes returns XML regardless of the `/JSON` path segment, with formats that differ per table. Codex curled live endpoints, captured real responses as test fixtures, and built the parser around observed reality instead of the docs.
- **Discovered the data gap that became the architecture.** `ZIP_CODE_SERVED` coverage is partial — both initial test ZIPs returned empty. Codex validated the finding and built the geocoding fallback chain (Zippopotam.us → Census reverse-geocoder → CITY_SERVED/COUNTY_SERVED), including vowel-normalized city matching because EPA drops vowels in place names ("SARATOGA SPRNGS").
- **Made the pipeline production-hostile-data-proof.** When live verification hit an EPA 500 on one system, Codex made the cache retain non-success responses and treat unparseable tables as empty — one flaky endpoint can't kill a report. It also narrowed county fan-out (Hudson County alone has 188 systems) to active community water systems.
- **Designed the grounded-citation schema.** The enum-constrained `citationViolationId` approach — hallucination prevention in the schema layer rather than the prompt — came out of the Codex session implementing OpenAI's structured-outputs pattern.
- **Self-corrected continuously.** Caught `create-next-app` defaulting to Next 16 and pinned 15 per spec; diagnosed and fixed its own lint failures; reviewed its own generated OG images and fixed a text-wrap issue before committing; survived a mid-task crash and reconciled state from git on resume.
- **Shipped serverless safely.** Refactored all disk access behind a `CACHE_DIR`-aware cache module with fail-soft writes and committed seed data, verified under `VERCEL=1` before the first deploy attempt.

## Data sources & disclaimers

- Violation and system data: [EPA Envirofacts SDWIS](https://www.epa.gov/enviro/sdwis-model). Geocoding: [Zippopotam.us](https://zippopotam.us), [US Census Geocoder](https://geocoding.geo.census.gov).
- AI-generated summaries — every claim cites an EPA record. TapCheck is informational only and is **not medical advice**. For current test results, consult your utility's Consumer Confidence Report.

## What's next

Email alerts when new violations hit your system, historical trend charts, an interactive service-area map showing which system serves your exact address, and a public gallery of the systems that need attention most.

---

*Built during OpenAI Build Week, July 2026 — by Dwain Prendergast.*
