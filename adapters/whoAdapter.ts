import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'

/**
 * WHO GOARN adapter
 *
 * WHO publishes Disease Outbreak News (DON) via:
 *   https://www.who.int/emergencies/disease-outbreak-news
 *
 * There is no official WHO REST API for DON — scraping or RSS parsing
 * is the practical approach. WHO does offer the Global Health Observatory
 * API (GHO) for longer-term epidemiological data.
 *
 * To wire up:
 *   1. Parse the DON RSS feed at https://www.who.int/rss-feeds/news-releases-en.xml
 *   2. Filter entries mentioning vector-borne diseases
 *   3. Map to our Alert schema
 *
 * GHO API (no key required):
 *   https://ghoapi.azureedge.net/api/Indicator
 */

const WHO_GHO_BASE = 'https://ghoapi.azureedge.net/api'

export class WHOAdapter implements IDataAdapter {
  name = 'WHO GOARN'

  async fetchStateData(): Promise<StateData[]> {
    // WHO data is global — not broken down by US state
    // This adapter contributes alerts, not state-level data
    return []
  }

  async fetchAlerts(): Promise<Alert[]> {
    try {
      // WHO DON RSS feed
      const res = await fetch(
        'https://www.who.int/rss-feeds/news-releases-en.xml',
        { next: { revalidate: 3600 } }
      )
      if (!res.ok) throw new Error(`WHO RSS ${res.status}`)
      const xml = await res.text()

      // Parse <item> blocks for vector-borne disease keywords
      const vectorKeywords = ['dengue','malaria','zika','chikungunya','rift valley','yellow fever','west nile','tick']
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
      const alerts: Alert[] = []

      items.forEach((item, i) => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
        const desc  = item.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? ''
        const date  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
        const isVectorBorne = vectorKeywords.some(kw => title.toLowerCase().includes(kw) || desc.toLowerCase().includes(kw))
        if (!isVectorBorne) return
        alerts.push({
          id: `who-${i}`,
          level: 'warning',
          title: title.slice(0, 80),
          body:  desc.replace(/<[^>]+>/g, '').slice(0, 200),
          time:  date ? new Date(date).toLocaleDateString() : 'Recent',
          source: 'WHO GOARN',
          region: 'International',
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
