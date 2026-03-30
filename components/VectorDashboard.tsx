'use client'

import { useState, useCallback } from 'react'
import { Pathogen, StateData, Alert, DataSource } from '@/lib/types'
import { TopBar } from './TopBar'
import { OverviewTab } from './tabs/OverviewTab'
import { PathogenTab } from './tabs/PathogenTab'
import { RegionalTab } from './tabs/RegionalTab'
import { AlertsTab } from './tabs/AlertsTab'
import { SourcesTab } from './tabs/SourcesTab'

type Tab = 'overview' | 'pathogen' | 'regional' | 'alerts' | 'sources'

interface Props {
  pathogens: Pathogen[]
  states: StateData[]
  alerts: Alert[]
  sources: DataSource[]
}

export function VectorDashboard({ pathogens, states, alerts, sources }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [activeSources, setActiveSources] = useState<Set<string>>(
    new Set(['CDC ArboNET', 'WHO GOARN', 'NIH PubMed', 'NSF EcoHealth'])
  )

  const toggleSource = useCallback((name: string) => {
    setActiveSources(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }, [])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'pathogen',  label: 'Pathogen detail' },
    { id: 'regional',  label: 'Regional' },
    { id: 'alerts',    label: 'Alerts' },
    { id: 'sources',   label: 'Sources' },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        activeSources={activeSources}
        onToggleSource={toggleSource}
        sources={sources}
      />

      {/* Nav */}
      <nav className="bg-white border-b border-vw-border flex px-3 flex-shrink-0 h-7">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 text-[10px] font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'text-vw-green border-vw-green'
                : 'text-vw-text3 border-transparent hover:text-vw-text2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Pages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'overview'  && <OverviewTab  pathogens={pathogens} states={states} alerts={alerts} />}
        {tab === 'pathogen'  && <PathogenTab  pathogens={pathogens} />}
        {tab === 'regional'  && <RegionalTab  states={states} />}
        {tab === 'alerts'    && <AlertsTab    alerts={alerts} />}
        {tab === 'sources'   && <SourcesTab   sources={sources} activeSources={activeSources} onToggle={toggleSource} />}
      </div>
    </div>
  )
}
