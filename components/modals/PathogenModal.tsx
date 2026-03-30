'use client'

import { useEffect, useRef } from 'react'
import { Pathogen } from '@/lib/types'
import { activityColor } from '@/lib/data'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

interface Props {
  pathogen: Pathogen
  onClose: () => void
}

export function PathogenModal({ pathogen: p, onClose }: Props) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    chartInstance.current = new Chart(chartRef.current, {
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
        }]
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
    return () => { chartInstance.current?.destroy() }
  }, [p])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl border border-vw-border w-[540px] max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-vw-border">
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
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Activity index', value: String(p.act),                  sub: activityColor(p.act), color: activityColor(p.act) },
              { label: 'Annual cases',   value: p.cases.toLocaleString(),        sub: 'US reported' },
              { label: 'Incubation',     value: p.inc,                           sub: 'post-exposure' },
            ].map(s => (
              <div key={s.label} className="bg-vw-surface2 rounded-lg p-2.5">
                <div className="text-[8px] font-mono text-vw-text3 uppercase tracking-wider mb-1">{s.label}</div>
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

          {/* Trend chart */}
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-2">8-week activity trend</div>
          <div className="relative h-24 mb-4">
            <canvas ref={chartRef} />
          </div>

          {/* Sources */}
          <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-2">Data sources</div>
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
