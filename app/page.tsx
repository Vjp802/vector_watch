import { VectorDashboard } from '@/components/VectorDashboard'
import { PATHOGENS, ALERTS, DATA_SOURCES, STATE_DATA, TOP_PATHOGEN, riskLevel } from '@/lib/data'

// Revalidate every 6 hours
export const revalidate = 21600

export default async function Page() {
  // In production this hits the real adapters via the API route.
  // During build / static generation we use seed data directly.
  const states = Object.entries(STATE_DATA).map(([name, v]) => ({
    name,
    activityIndex: v,
    riskLevel: riskLevel(v),
    topPathogen: TOP_PATHOGEN[name] ?? 'Lyme disease',
    source: 'CDC ArboNET',
    lastUpdated: new Date().toISOString(),
  }))

  return (
    <VectorDashboard
      pathogens={PATHOGENS}
      states={states}
      alerts={ALERTS}
      sources={DATA_SOURCES}
    />
  )
}
