'use client'

import { DataSource } from '@/lib/types'

interface Props {
  sources: DataSource[]
  activeSources: Set<string>
  onToggle: (name: string) => void
}

export function SourcesTab({ sources, activeSources, onToggle }: Props) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {sources.map(s => {
          const online = s.status === 'online'
          const active = activeSources.has(s.name)
          return (
            <div key={s.id} className="bg-white border border-vw-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[13px] font-semibold">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono" style={{ color: online ? '#2e7d32' : '#c62828' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: online ? '#4caf50' : '#c62828' }} />
                    {online ? 'Online' : 'Offline'}
                  </div>
                  <button
                    onClick={() => onToggle(s.name)}
                    className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-all ${
                      active
                        ? 'bg-vw-green-lt text-vw-green border-green-300'
                        : 'bg-vw-surface2 text-vw-text3 border-vw-border'
                    }`}
                  >
                    {active ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-vw-text2 leading-relaxed mb-3">{s.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Last updated', value: s.updated },
                  { label: 'Records',      value: s.records },
                  { label: 'Coverage',     value: s.coverage },
                ].map(m => (
                  <div key={m.label} className="bg-vw-surface2 rounded p-2">
                    <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-0.5">{m.label}</div>
                    <div className="text-[10px] font-medium">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {s.datasets.map(d => (
                  <span key={d} className="text-[8px] px-2 py-0.5 bg-vw-surface2 text-vw-text2 border border-vw-border rounded">
                    {d}
                  </span>
                ))}
              </div>

              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-[9px] text-vw-blue hover:underline font-mono"
                >
                  {s.url} ↗
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
