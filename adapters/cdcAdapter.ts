import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'
import { STATE_DATA, TOP_PATHOGEN, riskLevel } from '@/lib/data'

/**
 * CDC Adapter — real data from two sources:
 *
 * 1. NNDSS Weekly Data (Socrata, no key needed)
 *    Dataset ID: x9gk-5huc  at data.cdc.gov
 *    Covers: West Nile, EEE, Dengue (weekly by state)
 *
 * 2. Lyme Disease 2023 Annual counts by state (CDC static data)
 *    Published: https://www.cdc.gov/lyme/data-research/facts-stats/
 *
 * Activity index = min(100, cases_per_100k / historical_peak * 100)
 */

const NNDSS_API = 'https://data.cdc.gov/resource/x9gk-5huc.json'

const PEAK_RATES: Record<string, number> = {
  'West Nile virus disease': 2.8,
  'Eastern equine encephalitis': 0.05,
  'Dengue virus infection': 0.8,
  'Lyme disease': 42.0,
}

const STATE_POP: Record<string, number> = {
  Alabama:4110,Alaska:733,Arizona:7431,Arkansas:3067,California:38965,
  Colorado:5877,Connecticut:3617,Delaware:1031,Florida:22610,Georgia:11030,
  Hawaii:1435,Idaho:1964,Illinois:12582,Indiana:6862,Iowa:3207,
  Kansas:2940,Kentucky:4526,Louisiana:4573,Maine:1402,Maryland:6180,
  Massachusetts:7029,Michigan:10037,Minnesota:5737,Mississippi:2940,
  Missouri:6196,Montana:1132,Nebraska:1978,Nevada:3194,'New Hampshire':1402,
  'New Jersey':9290,'New Mexico':2114,'New York':19571,'North Carolina':10698,
  'North Dakota':779,Ohio:11780,Oklahoma:4053,Oregon:4233,Pennsylvania:13002,
  'Rhode Island':1094,'South Carolina':5373,'South Dakota':919,
  Tennessee:7126,Texas:30503,Utah:3417,Vermont:647,Virginia:8683,
  Washington:7785,'West Virginia':1770,Wisconsin:5955,Wyoming:584,
  'District of Columbia':678,
}

// CDC 2023 confirmed + probable Lyme cases by state (annual summary)
const LYME_2023: Record<string, number> = {
  Maine:2589,'New Hampshire':1714,Vermont:1183,Massachusetts:7812,
  'Rhode Island':1388,Connecticut:4911,'New York':8924,'New Jersey':5621,
  Pennsylvania:10419,Delaware:1027,Maryland:3124,Virginia:2201,
  'West Virginia':731,Minnesota:1884,Wisconsin:3421,Michigan:697,
  Ohio:380,Indiana:212,Illinois:299,Iowa:178,Missouri:243,
  'North Carolina':398,Georgia:201,Florida:127,Texas:162,
  California:124,Colorado:89,Washington:112,Oregon:78,
}

function calcIndex(casesPerHundredK: number, disease: string): number {
  const peak = PEAK_RATES[disease] ?? 1.0
  return Math.min(100, Math.round((casesPerHundredK / peak) * 100))
}

interface NNDSSRow {
  reporting_area?: string
  label?: string
  cum_2025?: string
  cum_2024?: string
  [key: string]: string | undefined
}

export class CDCAdapter implements IDataAdapter {
  name = 'CDC ArboNET'

  async fetchStateData(): Promise<StateData[]> {
    try {
      const diseases = ['West Nile virus disease', 'Eastern equine encephalitis', 'Dengue virus infection']
      const stateIndexMap: Record<string, number[]> = {}

      // Fetch NNDSS weekly data for mosquito-borne diseases
      await Promise.allSettled(diseases.map(async (disease) => {
        const url = `${NNDSS_API}?$where=label=%27${encodeURIComponent(disease)}%27&$limit=60&$order=mmwr_week DESC`
        const res = await fetch(url, { next: { revalidate: 21600 }, headers: { Accept: 'application/json' } })
        if (!res.ok) return
        const rows: NNDSSRow[] = await res.json()
        rows.forEach(row => {
          const state = row.reporting_area?.trim()
          if (!state || !STATE_POP[state]) return
          const cases = parseInt(row.cum_2025 ?? row.cum_2024 ?? '0', 10)
          if (!cases || cases <= 0) return
          const per100k = (cases / (STATE_POP[state] * 1000)) * 100000
          const idx = calcIndex(per100k, disease)
          if (!stateIndexMap[state]) stateIndexMap[state] = []
          stateIndexMap[state].push(idx)
        })
      }))

      // Layer in Lyme annual data
      Object.entries(LYME_2023).forEach(([state, cases]) => {
        const pop = STATE_POP[state]
        if (!pop) return
        const per100k = (cases / (pop * 1000)) * 100000
        const idx = calcIndex(per100k, 'Lyme disease')
        if (!stateIndexMap[state]) stateIndexMap[state] = []
        stateIndexMap[state].push(idx)
      })

      // Build result — average indices per state, fall back to seed
      const results: StateData[] = Object.keys(STATE_POP).map(name => {
        const indices = stateIndexMap[name]
        const activityIndex = indices?.length
          ? Math.round(indices.reduce((a, b) => a + b, 0) / indices.length)
          : (STATE_DATA[name] ?? 10)
        return {
          name,
          activityIndex: Math.min(100, Math.max(0, activityIndex)),
          riskLevel: riskLevel(activityIndex),
          topPathogen: TOP_PATHOGEN[name] ?? 'Lyme disease',
          source: indices?.length ? 'CDC NNDSS (live)' : 'CDC NNDSS (seed)',
          lastUpdated: new Date().toISOString(),
        }
      })

      const live = results.filter(r => r.source.includes('live')).length
      console.log(`CDC adapter: ${live}/${results.length} states with live data`)
      return results
    } catch (err) {
      console.error('CDC adapter failed, using seed:', err)
      return Object.entries(STATE_DATA).map(([name, v]) => ({
        name,
        activityIndex: v,
        riskLevel: riskLevel(v),
        topPathogen: TOP_PATHOGEN[name] ?? 'Lyme disease',
        source: 'CDC NNDSS (seed)',
        lastUpdated: new Date().toISOString(),
      }))
    }
  }

  async fetchAlerts(): Promise<Alert[]> {
    try {
      const res = await fetch('https://emergency.cdc.gov/han/rss.asp', { next: { revalidate: 3600 } })
      if (!res.ok) throw new Error(`HAN RSS ${res.status}`)
      const xml = await res.text()
      const keywords = ['tick','lyme','west nile','dengue','zika','mosquito','arboviral','ehrlichia','anaplasmosis','rocky mountain','spotted fever','eee','encephalitis']
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
      const alerts: Alert[] = []
      items.forEach((item, i) => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
        const desc  = item.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? item.match(/<description>(.*?)<\/description>/)?.[1] ?? ''
        const date  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
        if (!keywords.some(k => title.toLowerCase().includes(k) || desc.toLowerCase().includes(k))) return
        alerts.push({
          id: `cdc-han-${i}`,
          level: title.toLowerCase().includes('emergency') ? 'critical' : 'warning',
          title: title.slice(0, 100),
          body: desc.replace(/<[^>]+>/g, '').slice(0, 300),
          time: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          source: 'CDC Health Alert Network',
          region: 'National',
        })
      })
      return alerts.slice(0, 5)
    } catch {
      return []
    }
  }

  async fetchPathogenUpdates(): Promise<Partial<Pathogen>[]> {
    return []
  }
}
