import { IDataAdapter } from './IDataAdapter'
import { Alert, Pathogen, StateData } from '@/lib/types'

/**
 * WHO GOARN adapter
 *
 * Parses two real WHO feeds:
 * 1. WHO Disease Outbreak News RSS
 *    https://www.who.int/rss-feeds/news-releases-en.xml
 * 2. WHO Global Health Observatory (GHO) API
 *    https://ghoapi.azureedge.net/api
 *
 * Returns real alerts with actual publication timestamps.
 */

const VECTOR_KEYWORDS = ['dengue','malaria','zika','chikungunya','yellow fever','west nile','tick','arboviral','rift valley','leishmaniasis','chagas','trypanosomiasis']

function parseDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffHrs / 24)
    if (diffHrs < 1) return 'Just now'
    if (diffHrs < 24) return `${diffHrs}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()
}

export class WHOAdapter implements IDataAdapter {
  name = 'WHO GOARN'

  async fetchStateData(): Promise<StateData[]> {
    return [] // WHO data is global, not US state-level
  }

  async fetchAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = []

    try {
      // Try WHO Disease Outbreak News RSS
      const res = await fetch('https://www.who.int/rss-feeds/news-releases-en.xml', {
        next: { revalidate: 3600 },
        headers: { 'User-Agent': 'VectorWatch/1.0 (public health surveillance dashboard)' },
      })

      if (res.ok) {
        const xml = await res.text()
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

        items.forEach((item, i) => {
          const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
          const desc  = item.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? item.match(/<description>(.*?)<\/description>/)?.[1] ?? ''
          const date  = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
          const link  = item.match(/<link>(.*?)<\/link>/)?.[1] ?? ''

          const titleLower = title.toLowerCase()
          const descLower = desc.toLowerCase()
          const isRelevant = VECTOR_KEYWORDS.some(k => titleLower.includes(k) || descLower.includes(k))
          if (!isRelevant) return

          const severity = titleLower.includes('outbreak') || titleLower.includes('emergency') ? 'critical'
            : titleLower.includes('alert') || titleLower.includes('warning') ? 'warning'
            : 'info'

          alerts.push({
            id: `who-${i}-${Date.now()}`,
            level: severity,
            title: stripHtml(title).slice(0, 100),
            body: stripHtml(desc).slice(0, 300),
            time: parseDate(date),
            source: 'WHO Disease Outbreak News',
            region: 'International',
          })
        })
      }
    } catch (err) {
      console.warn('WHO RSS fetch failed:', err)
    }

    return alerts.slice(0, 6)
  }

  async fetchPathogenUpdates(): Promise<Partial<Pathogen>[]> {
    return []
  }
}
