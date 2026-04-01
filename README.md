# VectorWatch

Real-time vector-borne disease surveillance dashboard for the United States. Aggregates data from CDC ArboNET, WHO GOARN, NIH PubMed, and NSF EcoHealth. Activity indices are seasonally adjusted by month. Historical case data goes back to 1999.

🔗 **Live:** [vector-watch.vercel.app](https://vector-watch.vercel.app)  
📁 **Related:** [pathogen-tracking](https://github.com/Vjp802/pathogen-tracking)

---

## Features

| Feature | Status |
|---|---|
| US choropleth map — activity index by state | ✅ Live |
| 8 vector-borne pathogens tracked | ✅ Live |
| Season-aware risk logic (monthly multipliers) | ✅ Live |
| Historical case charts (CDC data, 1999–2024) | ✅ Live |
| CDC NNDSS weekly case data — West Nile, EEE, Dengue | ✅ Live |
| Lyme disease — CDC 2023 annual state counts | ✅ Live |
| WHO Disease Outbreak News RSS alerts | ✅ Live |
| NIH PubMed literature surveillance | ✅ Live |
| NSF / iNaturalist vector observation data | ✅ Live |
| AI-synthesized insight (Anthropic API, server-side) | ✅ Live |
| Auto-refresh every 6 hours (Vercel cron) | ✅ Live |
| CSV + JSON export | ✅ Live |
| Pathogen detail modal with trend + history | ✅ Live |
| Regional sortable table (all 51 states) | ✅ Live |
| Alert feed with severity filtering | ✅ Live |
| Data sources tab with connection status | ✅ Live |

---

## How the activity index works

Each state's activity index (0–100) is calculated in three steps:

**1. Base index from CDC case data**
- West Nile, EEE, Dengue: pulled from the NNDSS Weekly Data API (`data.cdc.gov/resource/x9gk-5huc.json`), normalized to cases per 100k population, then scaled against the historical peak rate for that disease
- Lyme disease: uses CDC's 2023 confirmed + probable annual case counts by state, same normalization
- States with no live data fall back to curated seed values based on historical burden

**2. Seasonal adjustment**
Each pathogen has a monthly multiplier (0.02–1.0) reflecting real entomological patterns:
- Tick-borne diseases (Lyme, RMSF, Ehrlichiosis, Anaplasmosis): peak April–October, near-zero in winter
- Mosquito-borne diseases (West Nile, Dengue, Zika): peak July–September
- EEE: peaks late August–October

The base index is multiplied by the current month's factor and floored at 5 so the map is never blank.

**3. Display**
The scaled index drives the map color scale:
- 0–20: Low (light green)
- 20–40: (medium green)
- 40–60: Moderate (bright green)
- 60–80: High (amber)
- 80–100: Critical (red)

---

## How alerts work

Alerts come from two layers merged together:

**Live alerts** (when available):
- CDC Health Alert Network (HAN) RSS — filtered for vector-borne keywords
- WHO Disease Outbreak News RSS — filtered for vector-borne keywords
- NIH PubMed — recent publications on vector-borne disease

**Seed alerts** (baseline):
- Curated representative alerts based on real historical outbreak patterns
- Serve as a floor so the alert feed is never empty during quiet seasons
- Live alerts are deduped against seed alerts by title and displayed first

Alert severity levels:
- **Critical** — confirmed fatalities, rapidly expanding outbreaks
- **Warning** — elevated vector populations, early-season clusters, rising case counts
- **Info** — travel advisories, research publications, vaccine trial updates

---

## Historical data

The Pathogen Detail modal includes a bar chart of national case counts sourced from CDC ArboNET finalized annual summaries:

| Pathogen | Years available |
|---|---|
| West Nile Virus | 1999–2024 |
| Lyme Disease | 2000–2023 |
| Rocky Mountain Spotted Fever | 2000–2022 |
| Dengue | 2010–2024 |
| EEE | 2003–2024 |

Data lives in `lib/historical.ts` and is updated manually when CDC publishes annual summaries.

---

## Data sources

| Source | API | What we use | Updates |
|---|---|---|---|
| **CDC NNDSS** | `data.cdc.gov/resource/x9gk-5huc.json` (Socrata, free) | West Nile, EEE, Dengue weekly case counts by state | Weekly |
| **CDC Lyme** | Annual CSV (parsed into `lib/data.ts`) | Lyme confirmed + probable cases by state | Annually |
| **CDC HAN** | `emergency.cdc.gov/han/rss.asp` | Vector-borne health alerts | As published |
| **WHO GOARN** | `who.int/rss-feeds/news-releases-en.xml` | Disease Outbreak News alerts | As published |
| **NIH PubMed** | NCBI E-utilities (free, optional key) | Recent vector-borne publications | Daily |
| **NSF / iNaturalist** | `api.inaturalist.org/v1/` | Tick + mosquito observation counts | Weekly |

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

```bash
ANTHROPIC_API_KEY=    # Required — AI Insight button (server-side, never exposed)
NCBI_API_KEY=         # Optional — increases PubMed rate limit from 3 to 10 req/sec
CDC_API_KEY=          # Optional — CDC Data Modernization Initiative API
```

## Deploy

```bash
npx vercel
# Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables
```

Vercel auto-refreshes data every 6 hours via the cron job in `vercel.json`.

---

## Project structure

```
vectorwatch/
├── app/
│   ├── api/
│   │   ├── vector/route.ts       # Aggregates all adapters, 6hr cache
│   │   └── insight/route.ts      # Server-side Anthropic API call
│   └── page.tsx
├── adapters/
│   ├── IDataAdapter.ts           # Interface all adapters implement
│   ├── cdcAdapter.ts             # CDC NNDSS Socrata + HAN RSS
│   ├── whoAdapter.ts             # WHO DON RSS
│   ├── nihAdapter.ts             # NIH PubMed E-utilities
│   └── nsfAdapter.ts             # NSF / iNaturalist
├── components/
│   ├── VectorDashboard.tsx       # Root client component + tab routing
│   ├── TopBar.tsx
│   ├── SeasonBadge.tsx           # Seasonal phase indicator
│   ├── tabs/
│   │   ├── OverviewTab.tsx       # Map + sparklines + alerts
│   │   ├── PathogenTab.tsx       # Card grid → modal
│   │   ├── RegionalTab.tsx       # Sortable state table
│   │   ├── AlertsTab.tsx         # Full alert feed
│   │   └── SourcesTab.tsx        # Source status + toggle
│   ├── map/USMap.tsx             # D3 choropleth
│   ├── charts/
│   │   ├── TrendChart.tsx        # 12-week national trend
│   │   ├── SparkLine.tsx         # Per-pathogen sparkline
│   │   └── HistoricalChart.tsx   # Multi-year bar chart
│   └── modals/PathogenModal.tsx  # Detail modal with history + season
└── lib/
    ├── types.ts                  # Zod schemas + TypeScript types
    ├── data.ts                   # Seed data + utility functions
    ├── historical.ts             # CDC historical case data 1999–2024
    ├── season.ts                 # Monthly seasonal multipliers
    └── cache.ts                  # 6-hour in-memory cache
```

---

## Disclaimer

VectorWatch is for informational and educational purposes only. It is not intended to provide medical advice or replace official public health guidance. For authoritative outbreak information consult [CDC](https://www.cdc.gov), [WHO](https://www.who.int), or your local health department.
