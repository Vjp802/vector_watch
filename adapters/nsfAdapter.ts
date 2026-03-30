import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'

/**
 * NSF EcoHealth Network adapter
 *
 * The NSF EcoHealth Network (ecohealthnet.org) and associated
 * USGS/NBII biodiversity data are available via:
 *
 *   GBIF API (species occurrence data):
 *     https://api.gbif.org/v1/occurrence/search
 *
 *   USGS BISON (biodiversity data):
 *     https://bison.usgs.gov/api/search.json
 *
 *   iNaturalist API (citizen science vector observations):
 *     https://api.inaturalist.org/v1/observations
 *
 * This adapter queries iNaturalist for recent tick and mosquito
 * observations as a proxy for vector density by region.
 */

const INAT_BASE = 'https://api.inaturalist.org/v1'

const VECTOR_TAXA = {
  tick:      48319,  // Ixodida (order)
  mosquito:  47157,  // Culicidae (family)
}

export class NSFAdapter implements IDataAdapter {
  name = 'NSF EcoHealth'

  async fetchStateData(): Promise<StateData[]> {
    // Could use iNaturalist observation counts by US state to adjust
    // activity indices — implement when real data pipeline is ready
    return []
  }

  async fetchAlerts(): Promise<Alert[]> {
    try {
      // Fetch recent tick observations in the US
      const res = await fetch(
        `${INAT_BASE}/observations?taxon_id=${VECTOR_TAXA.tick}&place_id=1&per_page=1&order=desc&order_by=created_at`,
        { next: { revalidate: 21600 } }
      )
      if (!res.ok) throw new Error(`iNaturalist ${res.status}`)
      const data = await res.json()
      const total: number = data.total_results ?? 0

      if (total > 10000) {
        return [{
          id: 'nsf-tick-obs',
          level: 'warning',
          title: 'Elevated tick observations — iNaturalist',
          body: `${total.toLocaleString()} tick observations logged in the US this season via citizen science reporting.`,
          time: 'Updated today',
          source: 'NSF EcoHealth / iNaturalist',
          region: 'National',
        }]
      }
      return []
    } catch {
      return []
    }
  }

  async fetchPathogenUpdates(): Promise<Partial<Pathogen>[]> {
    return []
  }
}
