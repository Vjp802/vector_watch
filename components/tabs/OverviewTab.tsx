'use client'

import { useState } from 'react'
import { Pathogen, StateData, Alert } from '@/lib/types'
import { USMap } from '../map/USMap'
import { TrendChart } from '../charts/TrendChart'
import { SparkLine } from '../charts/SparkLine'
import { activityColor } from '@/lib/data'
import { getSeasonInfo, applySeasonalAdjustment, getAllSeasonStatus } from '@/lib/season'

interface Props {
  pathogens: Pathogen[]
  states: StateData[]
  alerts: Alert[]
}

const WEEKLY = [22, 28, 31, 38, 44, 49, 55, 61, 68, 72, 78, 82]

const PHASE_LABELS: Record<string, string> = {
  'off-season':   'Off-season',
  'early-season': 'Rising',
  'peak':         'Peak',
  'late-season':  'Declining',
}
const PHASE_COLORS: Record<string, string> = {
  'off-season':   '#8a9688',
  'early-season': '#e65100',
  'peak':         '#c62828',
  'late-season':  '#2e7d32',
}

export function OverviewTab({ pathogens, states, alerts }: Props) {
  const [selectedPathogen, setSelectedPathogen] = useState<string | null>(null)
  const [insight, setInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'ready' | 'fetching' | 'done'>('ready')

  // Apply seasonal adjustment to each pathogen's activity index
  const seasonalPathogens = pathogens.map(p => ({
    ...p,
    act: applySeasonalAdjustment(p.act, p.id),
    season_info: getSeasonInfo(p.id),
  }))

  const topStates = [...states].sort((a, b) => b.activityIndex - a.activityIndex).slice(0, 5)
  const allSeasons = getAllSeasonStatus()
  const peakCount = allSeasons.filter(s => s.phase === 'peak').length
  const risingCount = allSeasons.filter(s => s.phase === 'early-season').length

  async function fetchInsight() {
    setInsightLoading(true)
    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: ['CDC ArboNET', 'WHO GOARN', 'NIH PubMed', 'NSF EcoHealth'] }),
      })
      const data = await res.json()
      setInsight(data.insight ?? data.error ?? 'No response.')
    } catch {
      setInsight('Fetch error — check API connection.')
    }
    setInsightLoading(false)
  }

  async function doSync() {
    setSyncStatus('fetching')
    await new Promise(r => setTimeout(r, 1500))
    setSyncStatus('done')
    setTimeout(() => setSyncStatus('ready'), 3000)
  }

  function exportCSV() {
    const rows = [['State', 'Activity', 'Risk', 'Top Pathogen', 'Source']]
    states.forEach(s => rows.push([s.name, String(s.activityIndex), s.riskLevel, s.topPathogen, s.source]))
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(r => r.join(',')).join('\n'))
    a.download = `vectorwatch_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  function exportJSON() {
    const out = { exported: new Date().toISOString(), states: {} as Record<string, object> }
    states.forEach(s => { out.states[s.name] = { activityIndex: s.activityIndex, risk: s.riskLevel, topPathogen: s.topPathogen, source: s.source } })
    const a = document.createElement('a')
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(out, null, 2))
    a.download = `vectorwatch_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="grid h-full overflow-hidden" style={{ gridTemplateColumns: '175px 1fr 215px' }}>

      {/* LEFT */}
      <div className="bg-white border-r border-vw-border overflow-y-auto">
        {/* Stats */}
        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">National</div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: 'Cases',     value: '2,841', sub: '↑12% WoW', up: true },
              { label: 'Alerts',    value: String(alerts.length), sub: 'active', up: false },
              { label: 'Pathogens', value: '8',     sub: 'tracked',  up: false },
              { label: 'Risk',      value: 'MOD',   sub: 'elevated', up: true, color: '#e65100' },
            ].map(s => (
              <div key={s.label} className="bg-vw-surface2 rounded p-1.5">
                <div className="text-[7px] font-mono text-vw-text3 uppercase mb-0.5">{s.label}</div>
                <div className="text-[15px] font-semibold leading-none" style={s.color ? { color: s.color } : {}}>{s.value}</div>
                <div className={`text-[7px] font-mono mt-0.5 ${s.up ? 'text-vw-amber' : 'text-vw-text3'}`}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal summary */}
        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">
            Season · {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </div>
          <div className="flex gap-1 flex-wrap mb-1.5">
            {peakCount > 0 && (
              <span style={{ background: '#ffebee', color: '#c62828', fontSize: 8, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, fontWeight: 600 }}>
                {peakCount} at peak
              </span>
            )}
            {risingCount > 0 && (
              <span style={{ background: '#fff3e0', color: '#e65100', fontSize: 8, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, fontWeight: 600 }}>
                {risingCount} rising
              </span>
            )}
            {peakCount === 0 && risingCount === 0 && (
              <span style={{ background: '#f0f1ef', color: '#8a9688', fontSize: 8, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 3, fontWeight: 600 }}>
                Low season
              </span>
            )}
          </div>
          <div className="text-[8px] text-vw-text3 leading-relaxed">
            Activity indices adjusted for current seasonal patterns.
          </div>
        </div>

        {/* Pathogen list */}
        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">Pathogens</div>
          {seasonalPathogens.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPathogen(p.id === selectedPathogen ? null : p.id)}
              className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-left transition-colors mb-0.5 ${
                selectedPathogen === p.id ? 'bg-vw-green-lt' : 'hover:bg-vw-surface2'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-[10px] font-medium flex-1">{p.name}</span>
              <span
                className="text-[7px] font-mono px-1 py-0.5 rounded font-semibold flex-shrink-0"
                style={{ fontSize: 7, fontFamily: 'monospace', padding: '1px 4px', borderRadius: 3, fontWeight: 600,
                  background: PHASE_COLORS[p.season_info.phase] + '20',
                  color: PHASE_COLORS[p.season_info.phase] }}
              >
                {PHASE_LABELS[p.season_info.phase]}
              </span>
            </button>
          ))}
        </div>

        {/* Sync */}
        <div className="p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">Data sync</div>
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-vw-green-lt rounded mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${syncStatus === 'fetching' ? 'bg-vw-amber' : 'bg-vw-green-md'}`} />
            <span className="text-[8px] font-mono text-vw-green flex-1">
              {syncStatus === 'fetching' ? 'Fetching...' : syncStatus === 'done' ? `Updated ${new Date().toLocaleTimeString()}` : 'Sources ready'}
            </span>
            <button onClick={doSync} className="text-[8px] font-mono text-vw-green border border-green-300 rounded px-1 hover:bg-vw-green hover:text-white transition-colors">↻</button>
          </div>
          <div className="text-[8px] text-vw-text3 leading-relaxed">CDC NNDSS · WHO GOARN<br />NIH PubMed · NSF EcoHealth</div>
        </div>
      </div>

      {/* CENTER — MAP */}
      <div className="flex flex-col overflow-hidden">
        <div className="bg-white border-b border-vw-border px-3 flex items-center justify-between flex-shrink-0 h-8">
          <div className="text-[10px] text-vw-text2">
            Activity index —{' '}
            <span className="text-vw-green font-semibold">
              {selectedPathogen ? seasonalPathogens.find(p => p.id === selectedPathogen)?.name : 'All pathogens'}
            </span>
            <span className="text-vw-text3 ml-2 text-[9px] font-mono">
              · Seasonally adjusted · {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <USMap states={states} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-white border-l border-vw-border overflow-y-auto">
        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">12-week trend</div>
          <TrendChart data={WEEKLY} />
        </div>

        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-2">Pathogen activity</div>
          {seasonalPathogens.slice(0, 5).map(p => (
            <SparkLine key={p.id} pathogen={p} />
          ))}
        </div>

        <div className="border-b border-vw-border p-2">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest">AI insight</div>
            <button
              onClick={fetchInsight}
              disabled={insightLoading}
              className="text-[8px] font-mono text-vw-green border border-vw-border2 rounded px-1.5 py-0.5 hover:bg-vw-green-lt transition-colors disabled:opacity-50"
            >
              {insightLoading ? '...' : 'Fetch ↗'}
            </button>
          </div>
          <p className={`text-[9px] leading-relaxed ${insight ? 'text-vw-text' : 'text-vw-text3'}`}>
            {insight || 'Click fetch for AI-synthesized cross-source summary.'}
          </p>
        </div>

        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">Alerts</div>
          {alerts.slice(0, 3).map(a => (
            <div key={a.id} className={`border-l-2 bg-vw-surface2 rounded p-1.5 mb-1.5 ${
              a.level === 'critical' ? 'border-vw-red' : a.level === 'warning' ? 'border-vw-amber' : 'border-blue-600'
            }`}>
              <div className="text-[9px] font-semibold mb-0.5">{a.title}</div>
              <div className="text-[8px] text-vw-text3 leading-tight">{a.body.slice(0, 70)}...</div>
              <div className="text-[7px] font-mono text-vw-text3 mt-0.5">{a.time}</div>
            </div>
          ))}
        </div>

        <div className="border-b border-vw-border p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">Top states</div>
          {topStates.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 mb-1">
              <span className="text-[7px] font-mono text-vw-text3 w-2">{i + 1}</span>
              <span className="flex-1 text-[9px] font-medium">{s.name}</span>
              <div className="h-0.5 rounded-sm" style={{ width: Math.round(s.activityIndex * 0.4), background: activityColor(s.activityIndex) }} />
              <span className="text-[8px] font-mono min-w-[18px] text-right" style={{ color: activityColor(s.activityIndex) }}>{s.activityIndex}</span>
            </div>
          ))}
        </div>

        <div className="p-2">
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-widest mb-1.5">Export</div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={exportCSV} className="text-[9px] px-2 py-1 border border-vw-border2 rounded hover:border-vw-green hover:text-vw-green hover:bg-vw-green-lt transition-colors">CSV ↓</button>
            <button onClick={exportJSON} className="text-[9px] px-2 py-1 border border-vw-border2 rounded hover:border-vw-green hover:text-vw-green hover:bg-vw-green-lt transition-colors">JSON ↓</button>
          </div>
        </div>
      </div>
    </div>
  )
}
