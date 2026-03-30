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
  const cached = cacheGet(CACHE_KEY)
  if (cached) {
    return NextResponse.json({ ...cached, cacheHit: true })
  }

  const adapters = [
    new CDCAdapter(),
    new WHOAdapter(),
    new NIHAdapter(),
    new NSFAdapter(),
  ]

  // Run all adapters in parallel, fail gracefully
  const [stateResults, alertResults] = await Promise.all([
    Promise.allSettled(adapters.map(a => a.fetchStateData())),
    Promise.allSettled(adapters.map(a => a.fetchAlerts())),
  ])

  // Merge state data — first successful non-empty result wins
  const states = stateResults
    .filter((r): r is PromiseFulfilledResult<StateData[]> => r.status === 'fulfilled' && r.value.length > 0)
    .flatMap(r => r.value)

  // Merge alerts — combine all, dedupe by title, sort by severity
  const adapterAlerts = alertResults
    .filter((r): r is PromiseFulfilledResult<Alert[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  const allAlerts = [...adapterAlerts, ...ALERTS]
    .filter((a, i, arr) => arr.findIndex(b => b.title === a.title) === i)
    .slice(0, 12)

  const payload = {
    pathogens:  PATHOGENS,
    states:     states.length > 0 ? states : Object.entries(
      await new CDCAdapter().fetchStateData().then(s => s)
    ).map(([, v]) => v),
    alerts:     allAlerts,
    sources:    DATA_SOURCES,
    fetchedAt:  new Date().toISOString(),
    cacheHit:   false,
  }

  const validated = VectorDataResponseSchema.safeParse(payload)
  if (!validated.success) {
    console.error('Validation error:', validated.error)
    return NextResponse.json({ error: 'Data validation failed' }, { status: 500 })
  }

  cacheSet(CACHE_KEY, validated.data)
  return NextResponse.json(validated.data)
}
