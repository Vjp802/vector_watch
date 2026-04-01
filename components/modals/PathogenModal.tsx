'use client'

import { useEffect, useRef } from 'react'
import { Pathogen } from '@/lib/types'
import { activityColor } from '@/lib/data'
import { HISTORICAL_BY_PATHOGEN } from '@/lib/historical'
import { getSeasonInfo } from '@/lib/season'
import { HistoricalChart } from '../charts/HistoricalChart'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

interface Props {
  pathogen: Pathogen
  onClose: () => void
}

const PHASE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'off-season':   { bg: '#f0f1ef', text: '#8a9688', dot: '#c8cbc4', label: 'Off-season' },
  'early-season': { bg: '#fff8e1', text: '#e65100', dot: '#e65100', label: 'Rising' },
  'peak':         { bg: '#ffebee', text: '#c62828', dot: '#c62828', label: 'Peak season' },
  'late-season':  { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50', label: 'Declining' },
}

export function PathogenModal({ pathogen: p, onClose }: Props) {
  const trendRef = useRef<HTMLCanvasElement>(null)
  const trendInst = useRef<Chart | null>(null)
  const season = getSeasonInfo(p.id)
  const seasonStyle = PHASE_STYLES[season.phase]
  const historicalData = HISTORICAL_BY_PATHOGEN[p.id]

  useEffect(() => {
    if (!trendRef.current) return
    if (trendInst.current) trendInst.current.destroy()
    trendInst.current = new Chart(trendRef.current, {
      type: 'line',
      data: {
        labels: ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8'],
        datasets: [{
          data: p.trend,
          borderColor: p.color,
          backgroundColor: p.color + '18',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: p.color,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 8 }, color: '#8a9688' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 8 }, color: '#8a9688' }, min: 0, max: 100 },
        },
      },
    })
    return () => trendInst.current?.destroy()
  }, [p])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl border border-vw-border w-[580px] max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-vw-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[15px] font-semibold">{p.name}</span>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-semibold ${
              p.risk === 'H' ? 'bg-vw-red-lt text-vw-red' :
              p.risk === 'M' ? 'bg-vw-amber-lt text-vw-amber' : 'bg-vw-green-lt text-vw-green'
            }`}>{p.risk === 'H' ? 'HIGH' : p.risk === 'M' ? 'MOD' : 'LOW'}</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full border border-vw-border flex items-center justify-center text-vw-text3 text-sm hover:bg-vw-surface2 transition-colors">✕</button>
        </div>

        <div className="p-4">
          {/* Season status */}
          <div style={{ background: seasonStyle.bg, borderRadius: 6, padding: '8px 12px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: seasonStyle.dot }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: seasonStyle.text }}>{seasonStyle.label}</span>
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: seasonStyle.text, marginLeft: 4 }}>
                {season.monthName} · multiplier {(season.multiplier * 100).toFixed(0)}% of peak
              </span>
              {season.nextPeakMonth && (
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: seasonStyle.text, marginLeft: 'auto' }}>
                  Peak season: {season.nextPeakMonth} ({season.daysUntilPeak}d)
                </span>
              )}
              {season.phase === 'peak' && (
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: seasonStyle.text, marginLeft: 'auto' }}>
                  Currently at peak activity
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Activity index', value: String(p.act), color: activityColor(p.act), sub: 'current estimate' },
              { label: 'Annual cases',   value: p.cases.toLocaleString(), sub: 'US reported' },
              { label: 'Incubation',     value: p.inc, sub: 'post-exposure' },
            ].map(s => (
              <div key={s.label} className="bg-vw-surface2 rounded-lg p-2.5">
                <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-[16px] font-semibold leading-none mb-1" style={s.color ? { color: s.color } : {}}>{s.value}</div>
                <div className="text-[8px] font-mono text-vw-text3">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Vector',           value: p.vector },
              { label: 'Primary host',     value: p.host },
              { label: 'Peak season',      value: p.season },
              { label: 'High-risk states', value: p.states },
            ].map(f => (
              <div key={f.label} className="bg-vw-surface2 rounded p-2">
                <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-1">{f.label}</div>
                <div className="text-[11px] font-medium">{f.value}</div>
              </div>
            ))}
          </div>

          {/* 8-week activity trend */}
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-2">8-week activity index</div>
          <div className="relative h-24 mb-4"><canvas ref={trendRef} /></div>

          {/* Historical chart */}
          {historicalData && (
            <>
              <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-1">
                Historical cases — US national (CDC ArboNET)
              </div>
              <div className="text-[8px] text-vw-text3 mb-2">
                {historicalData[historicalData.length - 1].year} most recent · confirmed + probable
              </div>
              <HistoricalChart
                data={historicalData}
                color={p.color}
                label={p.name}
                pathogenId={p.id}
                height={130}
              />
            </>
          )}
          {!historicalData && (
            <div className="text-[9px] text-vw-text3 italic">Historical case data not available for this pathogen.</div>
          )}

          {/* Sources */}
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-2 mt-4">Data sources</div>
          <div className="flex gap-2 flex-wrap">
            {p.sources.map(s => (
              <span key={s} className="text-[8px] font-mono px-2 py-0.5 bg-vw-green-lt text-vw-green border border-green-300 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
