# VectorWatch

Real-time vector-borne disease surveillance dashboard. Aggregates data from CDC ArboNET, WHO GOARN, NIH PubMed, and NSF EcoHealth, with AI-synthesized insights via the Anthropic API.

🔗 **Live:** [vector-watch.vercel.app](https://vector-watch.vercel.app)

---

## How alerts work

VectorWatch has two alert layers:

### 1. Seed alerts (current)
The alerts currently displayed are **curated seed data** — representative examples based on real seasonal patterns and historically documented outbreaks (Lyme northeast corridor, RMSF in Oklahoma/Arkansas, West Nile Gulf Coast expansion). They are not pulled live from an institution in real time. They exist to demonstrate the alert feed structure and severity classification system.

### 2. Live adapter pipeline (in progress)
The `adapters/` directory contains adapters for each data source that are wired to fetch real alerts:

| Adapter | Source | Method | Status |
|---|---|---|---|
| `cdcAdapter.ts` | CDC ArboNET / HAN | CDC Health Alert Network RSS + data.cdc.gov Socrata API | Fallback to seed |
| `whoAdapter.ts` | WHO GOARN | WHO Disease Outbreak News RSS feed | Parsing wired, filtering in progress |
| `nihAdapter.ts` | NIH PubMed | NCBI E-utilities API (free, no key required) | Returns recent publications |
| `nsfAdapter.ts` | NSF / iNaturalist | iNaturalist observation counts as vector density proxy | Returns observation alerts |

When a live adapter returns results they are merged with the seed alerts, deduplicated by title, and displayed together. The seed alerts serve as a baseline so the dashboard is never empty.

### Alert severity levels
- **Critical** — confirmed fatalities, rapidly expanding outbreaks, or activity indices >80 in multiple states
- **Warning** — elevated vector populations, early-season clusters, rising case counts
- **Info** — travel advisories, research publications, vaccine trial updates

---

## Data sources

**CDC ArboNET** — CDC Arboviral Diseases Branch national surveillance network. Tracks confirmed and probable arboviral disease cases across all 50 US states. Public data via [data.cdc.gov](https://data.cdc.gov) (Socrata API). Health alerts via the [Health Alert Network (HAN)](https://emergency.cdc.gov/han/).

**WHO GOARN** — Global Outbreak Alert and Response Network. Monitors international vector-borne disease activity relevant to US border and travel health. Disease Outbreak News published at [who.int](https://www.who.int/emergencies/disease-outbreak-news) via RSS.

**NIH PubMed** — NCBI E-utilities API scans PubMed for recent peer-reviewed publications on vector-borne disease trends and treatment outcomes. Free; add `NCBI_API_KEY` to `.env.local` for higher rate limits.

**NSF EcoHealth / iNaturalist** — Citizen science tick and mosquito observation counts via [iNaturalist API](https://api.inaturalist.org/v1/), used as a proxy for regional vector density.

---

## State activity index

The activity index (0–100) on the map is currently **modeled seed data** based on historical CDC ArboNET case distribution patterns. It is designed to be replaced with live normalized case counts once the CDC API pipeline is fully wired.

---

## AI insight

The "Fetch" button calls the Anthropic API server-side (your key is never exposed to the browser). It sends the current surveillance context and returns a 2–3 sentence epidemiological synthesis, cached for 2 hours.

---

## Setup

```bash
git clone https://github.com/Vjp802/vectorwatch
cd vectorwatch
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Environment variables

```
ANTHROPIC_API_KEY=    # Required for AI Insight
NCBI_API_KEY=         # Optional — increases PubMed rate limit
CDC_API_KEY=          # Optional — CDC Data Modernization Initiative API
```

## Project structure

```
vectorwatch/
├── app/
│   ├── api/
│   │   ├── vector/route.ts     # Aggregates all adapters, 6hr cache
│   │   └── insight/route.ts    # Server-side Anthropic call
│   └── page.tsx
├── adapters/
│   ├── IDataAdapter.ts
│   ├── cdcAdapter.ts
│   ├── whoAdapter.ts
│   ├── nihAdapter.ts
│   └── nsfAdapter.ts
├── components/
│   ├── VectorDashboard.tsx
│   ├── tabs/
│   ├── map/USMap.tsx
│   ├── charts/
│   └── modals/PathogenModal.tsx
└── lib/
    ├── types.ts
    ├── data.ts
    └── cache.ts
```

## Related

Spun out of [pathogen-tracking](https://github.com/Vjp802/pathogen-tracking) — compatible adapter architecture.

## Disclaimer

For informational and educational purposes only. Not intended as medical advice. For authoritative outbreak information consult [CDC](https://www.cdc.gov), [WHO](https://www.who.int), or your local health department.
