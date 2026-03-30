'use client'

import { useState } from 'react'
import { Pathogen } from '@/lib/types'
import { activityColor } from '@/lib/data'
import { PathogenModal } from '../modals/PathogenModal'

interface Props { pathogens: Pathogen[] }

export function PathogenTab({ pathogens }: Props) {
  const [selected, setSelected] = useState<Pathogen | null>(null)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-vw-border px-4 py-2 flex-shrink-0 text-[10px] text-vw-text3">
        Click any pathogen card for detailed surveillance data, trend charts, and source breakdown.
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {pathogens.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-white border border-vw-border rounded-lg p-3 text-left hover:border-vw-green transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <div className="text-[12px] font-semibold flex-1">{p.name}</div>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  p.risk === 'H' ? 'bg-vw-red-lt text-vw-red' :
                  p.risk === 'M' ? 'bg-vw-amber-lt text-vw-amber' : 'bg-vw-green-lt text-vw-green'
                }`}>{p.risk === 'H' ? 'HIGH' : p.risk === 'M' ? 'MOD' : 'LOW'}</span>
              </div>

              <div className="bg-vw-surface2 rounded-sm h-1.5 mb-1.5">
                <div className="h-1.5 rounded-sm transition-all" style={{ width: `${p.act}%`, background: activityColor(p.act) }} />
              </div>
              <div className="text-[8px] font-mono text-vw-text3 mb-2">
                Activity index: <span className="font-semibold" style={{ color: activityColor(p.act) }}>{p.act}</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: 'Vector',     value: p.vector },
                  { label: 'Season',     value: p.season },
                  { label: 'Incubation', value: p.inc },
                  { label: 'Cases/yr',   value: p.cases.toLocaleString() },
                ].map(f => (
                  <div key={f.label} className="text-[8px] text-vw-text3">
                    {f.label}
                    <span className="block text-vw-text2 font-medium">{f.value}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <PathogenModal pathogen={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
