# VectorWatch

Real-time vector-borne disease surveillance dashboard. Pulls data from CDC ArboNET, WHO GOARN, NIH PubMed, and NSF EcoHealth, with AI-synthesized insights via the Anthropic API.

## Features

- **5 fully functional tabs** — Overview, Pathogen detail, Regional analysis, Alerts, Data sources
- **Interactive US map** — D3 choropleth, state-level activity index, hover tooltips
- **Pathogen modals** — click any pathogen for incubation, host, vector, trend chart
- **Sortable regional table** — all 51 states, sortable by activity, risk, pathogen
- **Alert feed** — filterable by severity (Critical / Warning / Info)
- **AI Insight** — server-side Anthropic API call, synthesizes cross-source summary
- **Export** — CSV and JSON download
- **Adapter architecture** — pluggable data sources, 6-hour cache, Zod validation

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/vectorwatch
cd vectorwatch
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data sources

| Source | API | Notes |
|---|---|---|
| CDC ArboNET | data.cdc.gov (Socrata) | Free, no key required for low volume |
| WHO GOARN | RSS feed | No key required |
| NIH PubMed | NCBI E-utilities | Free; add `NCBI_API_KEY` for higher rate limit |
| NSF EcoHealth | iNaturalist API | Free, no key required |

All adapters fall back to seed data gracefully if a source is unavailable.

## Environment variables

```
ANTHROPIC_API_KEY=    # Required for AI Insight
NCBI_API_KEY=         # Optional — increases PubMed rate limit
CDC_API_KEY=          # Optional — for official ArboNET API
```

## Project structure

```
vectorwatch/
├── app/
│   ├── api/
│   │   ├── vector/route.ts     # Aggregates all adapters
│   │   └── insight/route.ts    # Server-side Anthropic call
│   ├── page.tsx                # Root page (server component)
│   ├── layout.tsx
│   └── globals.css
├── adapters/
│   ├── IDataAdapter.ts         # Interface all adapters implement
│   ├── cdcAdapter.ts
│   ├── whoAdapter.ts
│   ├── nihAdapter.ts
│   └── nsfAdapter.ts
├── components/
│   ├── VectorDashboard.tsx     # Root client component + tab routing
│   ├── TopBar.tsx
│   ├── tabs/
│   │   ├── OverviewTab.tsx
│   │   ├── PathogenTab.tsx
│   │   ├── RegionalTab.tsx
│   │   ├── AlertsTab.tsx
│   │   └── SourcesTab.tsx
│   ├── map/USMap.tsx
│   ├── charts/TrendChart.tsx
│   └── modals/PathogenModal.tsx
└── lib/
    ├── types.ts                # Zod schemas + TypeScript types
    ├── data.ts                 # Seed data + utility functions
    └── cache.ts                # 6-hour in-memory cache
```

## Deploying to Vercel

```bash
npx vercel
# Set ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## Related

This project was spun out of [pathogen-tracking](https://github.com/Vjp802/pathogen-tracking) — the adapter architecture and caching pattern are compatible.
