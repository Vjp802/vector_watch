import { NextResponse } from 'next/server'
import { CDCAdapter } from '@/adapters/cdcAdapter'
import { WHOAdapter } from '@/adapters/whoAdapter'
import { NIHAdapter } from '@/adapters/nihAdapter'
import { NSFAdapter } from '@/adapters/nsfAdapter'
import { PATHOGENS, ALERTS, DATA_SOURCES } from '@/lib/data'
import { cacheGet, cacheSet } from '@/lib/cache'
import { VectorDataResponseSchema, StateData, Alert } from '@/lib/types'

const CACHE_KEY = 'vector-data'

export async function GET() {
  const cached = cacheGet<object>(CACHE_KEY)
  if (cached) return NextResponse.json({ ...cached, cacheHit: true })

  const adapters = [new CDCAdapter(), new WHOAdapter(), new NIHAdapter(), new NSFAdapter()]

  const [stateResults, alertResults] = await Promise.all([
    Promise.allSettled(adapters.map(a => a.fetchStateData())),
    Promise.allSettled(adapters.map(a => a.fetchAlerts())),
  ])

  // Use first successful non-empty state dataset (CDC wins if it returns live data)
  const stateSets = stateResults
    .filter((r): r is PromiseFulfilledResult<StateData[]> => r.status === 'fulfilled' && r.value.length > 0)
    .map(r => r.value)

  const states = stateSets.length > 0 ? stateSets[0] : Object.entries(
    await new CDCAdapter().fetchStateData().then(s => s)
  ).map(([, v]) => v)

  // Merge alerts from all adapters — live alerts take priority over seed
  const liveAlerts = alertResults
    .filter((r): r is PromiseFulfilledResult<Alert[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // Dedupe by title, live alerts first, then seed alerts as fallback
  const seen = new Set<string>()
  const allAlerts: Alert[] = []
  ;[...liveAlerts, ...ALERTS].forEach(a => {
    const key = a.title.toLowerCase().slice(0, 40)
    if (!seen.has(key)) { seen.add(key); allAlerts.push(a) }
  })

  const liveAlertCount = liveAlerts.length
  console.log(`Vector API: ${liveAlertCount} live alerts, ${allAlerts.length} total after merge`)

  const payload = {
    pathogens: PATHOGENS,
    states,
    alerts: allAlerts.slice(0, 12),
    sources: DATA_SOURCES,
    fetchedAt: new Date().toISOString(),
    cacheHit: false,
    meta: {
      liveAlerts: liveAlertCount,
      liveStates: states.filter(s => s.source.includes('live')).length,
    },
  }

  const validated = VectorDataResponseSchema.safeParse(payload)
  if (!validated.success) {
    console.error('Validation error:', validated.error.flatten())
    // Return unvalidated payload rather than a hard 500
    return NextResponse.json(payload)
  }

  cacheSet(CACHE_KEY, validated.data)
  return NextResponse.json(validated.data)
}
