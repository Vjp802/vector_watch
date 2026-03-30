import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'

/**
 * NIH PubMed adapter
 *
 * Uses the NCBI E-utilities API (free, no key required for low volume):
 *   https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
 *
 * This adapter searches PubMed for recent publications on vector-borne
 * diseases and surfaces them as informational alerts / trend signals.
 *
 * Rate limit: 3 requests/sec without API key, 10/sec with key.
 * Set NCBI_API_KEY in .env.local to increase rate limit.
 */

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const API_KEY = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : ''

const SEARCH_TERMS = [
  'lyme disease outbreak 2026',
  'west nile virus surveillance 2026',
  'rocky mountain spotted fever',
  'dengue United States 2026',
]

export class NIHAdapter implements IDataAdapter {
  name = 'NIH PubMed'

  async fetchStateData(): Promise<StateData[]> {
    return []
  }

  async fetchAlerts(): Promise<Alert[]> {
    try {
      const term = encodeURIComponent(SEARCH_TERMS[0])
      const searchRes = await fetch(
        `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=5&sort=pub+date&retmode=json${API_KEY}`,
        { next: { revalidate: 21600 } }
      )
      if (!searchRes.ok) throw new Error(`PubMed search ${searchRes.status}`)
      const searchData = await searchRes.json()
      const ids: string[] = searchData.esearchresult?.idlist ?? []
      if (!ids.length) return []

      const summaryRes = await fetch(
        `${EUTILS_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json${API_KEY}`,
        { next: { revalidate: 21600 } }
      )
      if (!summaryRes.ok) throw new Error(`PubMed summary ${summaryRes.status}`)
      const summaryData = await summaryRes.json()
      const uids: string[] = summaryData.result?.uids ?? []

      return uids.slice(0, 3).map((uid, i) => {
        const article = summaryData.result[uid]
        return {
          id: `nih-${uid}`,
          level: 'info' as const,
          title: (article.title ?? 'New publication').slice(0, 80),
          body:  `${article.source ?? 'PubMed'} · ${article.authors?.[0]?.name ?? ''} et al.`,
          time:  article.pubdate ?? 'Recent',
          source: 'NIH PubMed',
          region: 'Research',
        }
      })
    } catch {
      return []
    }
  }

  async fetchPathogenUpdates(): Promise<Partial<Pathogen>[]> {
    return []
  }
}
