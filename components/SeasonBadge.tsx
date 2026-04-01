'use client'

import { getSeasonInfo } from '@/lib/season'

interface Props {
  pathogenId: string
  compact?: boolean
}

const PHASE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'off-season':   { bg: '#f0f1ef', text: '#8a9688', dot: '#c8cbc4', label: 'Off-season' },
  'early-season': { bg: '#fff8e1', text: '#e65100', dot: '#e65100', label: 'Rising' },
  'peak':         { bg: '#ffebee', text: '#c62828', dot: '#c62828', label: 'Peak season' },
  'late-season':  { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50', label: 'Declining' },
}

export function SeasonBadge({ pathogenId, compact = false }: Props) {
  const info = getSeasonInfo(pathogenId)
  const style = PHASE_STYLES[info.phase]

  if (compact) {
    return (
      <span
        style={{ background: style.bg, color: style.text, fontSize: 7, fontFamily: 'monospace', padding: '1px 5px', borderRadius: 3, fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        {style.label}
      </span>
    )
  }

  return (
    <div style={{ background: style.bg, borderRadius: 5, padding: '6px 10px', marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: info.nextPeakMonth ? 2 : 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: style.text }}>{style.label}</span>
        <span style={{ fontSize: 9, color: style.text, fontFamily: 'monospace', marginLeft: 'auto' }}>
          {info.monthName}
        </span>
      </div>
      {info.nextPeakMonth && (
        <div style={{ fontSize: 8, color: style.text, fontFamily: 'monospace', paddingLeft: 11 }}>
          Peak in {info.nextPeakMonth} ({info.daysUntilPeak}d)
        </div>
      )}
    </div>
  )
}
