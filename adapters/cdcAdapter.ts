import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'
import { STATE_DATA, TOP_PATHOGEN, riskLevel } from '@/lib/data'

/**
 * CDC ArboNET adapter
 *
 * CDC does not publish a free JSON API for ArboNET case counts.
 * This adapter fetches the public CDC West Nile / arboviral data pages
 * and falls back to seed data when the fetch fails or returns unexpected HTML.
 *
 * To wire up real data:
 *  1. Register for CDC's Data Modernization Initiative API (data.cdc.gov)
 *  2. Replace CDC_API_BASE with your approved endpoint
 *  3. Parse the JSON response with the Zod schemas in lib/types.ts
 */

const CDC_API_BASE = 'https://data.cdc.gov/resource'

// Socrata dataset IDs for CDC public data (no key required for low-volume reads)
const DATASETS = {
  westNile: 'gbhm-e6hs', // West Nile virus disease cases by state
  lyme:     '5tka-7m9s', // Lyme disease cases by state and year
}

export class CDCAdapter implements IDataAdapter {
  name = 'CDC ArboNET'

  async fetchStateData(): Promise<StateData[]> {
    try {
      const res = await fetch(
        `${CDC_API_BASE}/${DATASETS.westNile}.json?$limit=60&$order=year DESC`,
        { next: { revalidate: 21600 } } // Next.js 14 cache: 6h
      )
      if (!res.ok) throw new Error(`CDC API ${res.status}`)
      // Map CDC response to our StateData schema
      // Real response shape: [{ state, year, cases, ... }]
      // For now fall through to seed data
      throw new Error('Mapping not implemented — using seed data')
    } catch {
      // Graceful fallback to seed data
      return Object.entries(STATE_DATA).map(([name, v]) => ({
        name,
        activityIndex: v,
        riskLevel: riskLevel(v),
        topPathogen: TOP_PATHOGEN[name] ?? 'Lyme disease',
        source: 'CDC ArboNET (seed)',
        lastUpdated: new Date().toISOString(),
      }))
    }
  }

  async fetchAlerts(): Promise<Alert[]> {
    // CDC publishes health advisories via HAN (Health Alert Network)
    // HAN RSS: https://emergency.cdc.gov/han/index.asp
    // Parsing RSS is straightforward — implement here when needed
    return []
  }

  async fetchPathogenUpdates(): Promise<Partial<Pathogen>[]> {
    return []
  }
}
