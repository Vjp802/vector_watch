'use client'

import { useState, useMemo } from 'react'
import { StateData } from '@/lib/types'
import { activityColor } from '@/lib/data'

interface Props { states: StateData[] }

type SortKey = 'name' | 'activityIndex' | 'riskLevel' | 'topPathogen'

export function RegionalTab({ states }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('activityIndex')
  const [sortDir, setSortDir] = useState<1 | -1>(-1)

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortKey(key); setSortDir(-1) }
  }

  const filtered = useMemo(() => {
    return [...states]
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (typeof av === 'number' && typeof bv === 'number') return sortDir * (av - bv)
        return sortDir * String(av).localeCompare(String(bv))
      })
  }, [states, search, sortKey, sortDir])

  function Th({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col
    return (
      <th
        onClick={() => handleSort(col)}
        className={`text-left text-[8px] font-mono uppercase tracking-wider py-1.5 px-2 border-b border-vw-border cursor-pointer select-none ${
          active ? 'text-vw-green' : 'text-vw-text3 hover:text-vw-text2'
        }`}
      >
        {label} {active ? (sortDir === -1 ? '↓' : '↑') : '↕'}
      </th>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-vw-border px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search states..."
          className="px-2 py-1 border border-vw-border rounded text-[11px] bg-vw-surface2 focus:outline-none focus:border-vw-green w-44"
        />
        <span className="text-[9px] font-mono text-vw-text3 ml-auto">{filtered.length} states</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="text-left text-[8px] font-mono uppercase tracking-wider py-1.5 px-2 border-b border-vw-border text-vw-text3 w-6">#</th>
              <Th col="name"          label="State" />
              <Th col="activityIndex" label="Activity" />
              <Th col="riskLevel"     label="Risk level" />
              <Th col="topPathogen"   label="Top pathogen" />
              <th className="text-left text-[8px] font-mono uppercase tracking-wider py-1.5 px-2 border-b border-vw-border text-vw-text3">Bar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.name} className="hover:bg-vw-green-lt transition-colors">
                <td className="py-1.5 px-2 text-[8px] font-mono text-vw-text3">{i + 1}</td>
                <td className="py-1.5 px-2 text-[10px] font-medium">{s.name}</td>
                <td className="py-1.5 px-2 text-[10px] font-mono font-semibold" style={{ color: activityColor(s.activityIndex) }}>
                  {s.activityIndex}
                </td>
                <td className="py-1.5 px-2">
                  <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{
                    background: s.activityIndex >= 80 ? '#ffebee' : s.activityIndex >= 60 ? '#fff3e0' : s.activityIndex >= 40 ? '#fff8e1' : '#e8f5e9',
                    color: activityColor(s.activityIndex),
                  }}>
                    {s.riskLevel}
                  </span>
                </td>
                <td className="py-1.5 px-2 text-[9px] text-vw-text2">{s.topPathogen}</td>
                <td className="py-1.5 px-2">
                  <div className="h-1 rounded-sm" style={{ width: Math.round(s.activityIndex * 0.5), background: activityColor(s.activityIndex) }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
