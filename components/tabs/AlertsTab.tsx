'use client'

import { useState } from 'react'
import { Alert } from '@/lib/types'

interface Props { alerts: Alert[] }

type Filter = 'all' | 'critical' | 'warning' | 'info'

const FILTER_STYLES: Record<Filter, string> = {
  all:      'border-vw-green   text-vw-green   bg-vw-green-lt',
  critical: 'border-vw-red    text-vw-red     bg-vw-red-lt',
  warning:  'border-vw-amber  text-vw-amber   bg-vw-amber-lt',
  info:     'border-vw-blue   text-vw-blue    bg-vw-blue-lt',
}

const LEVEL_COLORS: Record<string, { border: string; badge: string; badgeBg: string; label: string }> = {
  critical: { border: '#c62828', badge: '#c62828', badgeBg: '#ffebee', label: 'CRITICAL' },
  warning:  { border: '#e65100', badge: '#e65100', badgeBg: '#fff3e0', label: 'WARNING' },
  info:     { border: '#1565c0', badge: '#1565c0', badgeBg: '#e3f2fd', label: 'INFO' },
}

export function AlertsTab({ alerts }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const counts = { all: alerts.length, critical: 0, warning: 0, info: 0 }
  alerts.forEach(a => { counts[a.level as Filter] = (counts[a.level as Filter] ?? 0) + 1 })

  const shown = filter === 'all' ? alerts : alerts.filter(a => a.level === filter)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-vw-border px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-semibold mr-2">All alerts</span>
        {(['all', 'critical', 'warning', 'info'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[9px] px-2.5 py-0.5 rounded-full border transition-all font-medium capitalize ${
              filter === f ? FILTER_STYLES[f] : 'border-vw-border text-vw-text3 hover:text-vw-text2'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl">
          {shown.map(a => {
            const lc = LEVEL_COLORS[a.level] ?? LEVEL_COLORS.info
            return (
              <div
                key={a.id}
                className="bg-white border border-vw-border rounded-lg p-3 mb-3"
                style={{ borderLeftWidth: 3, borderLeftColor: lc.border }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-semibold">{a.title}</span>
                  <span
                    className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ background: lc.badgeBg, color: lc.badge }}
                  >
                    {lc.label}
                  </span>
                </div>
                <p className="text-[10px] text-vw-text2 leading-relaxed mb-2">{a.body}</p>
                <div className="flex gap-4">
                  <span className="text-[8px] font-mono text-vw-text3">{a.time}</span>
                  <span className="text-[8px] font-mono text-vw-text3">Source: {a.source}</span>
                  <span className="text-[8px] font-mono text-vw-text3">Region: {a.region}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
