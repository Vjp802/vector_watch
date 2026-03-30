'use client'

import { useEffect, useState } from 'react'
import { DataSource } from '@/lib/types'

interface Props {
  activeSources: Set<string>
  onToggleSource: (name: string) => void
  sources: DataSource[]
}

const SOURCE_SHORT: Record<string, string> = {
  'CDC ArboNET': 'CDC',
  'WHO GOARN':   'WHO',
  'NIH PubMed':  'NIH',
  'NSF EcoHealth':'NSF',
  'ProMED':      'ProMED',
}

export function TopBar({ activeSources, onToggleSource, sources }: Props) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => setTime(new Date().toLocaleTimeString())
    fmt()
    const id = setInterval(fmt, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-white border-b border-vw-border px-3 flex items-center justify-between flex-shrink-0 h-9">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-vw-green rounded-md flex items-center justify-center text-white text-[10px] font-bold">
          VW
        </div>
        <span className="text-[13px] font-semibold">VectorWatch</span>
        <span className="text-[9px] text-vw-text3 font-mono ml-1">· Vector-borne disease surveillance</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {sources.map(s => {
            const short = SOURCE_SHORT[s.name] ?? s.name
            const on = activeSources.has(s.name)
            return (
              <button
                key={s.id}
                onClick={() => onToggleSource(s.name)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold border transition-all ${
                  on
                    ? 'bg-vw-green-lt text-vw-green border-green-300'
                    : 'bg-vw-surface2 text-vw-text3 border-vw-border'
                }`}
              >
                {short}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-vw-green-lt text-[8px] text-vw-green font-mono">
          <span className="w-1 h-1 rounded-full bg-vw-green-md animate-pulse" />
          Live
        </div>

        <span className="text-[8px] text-vw-text3 font-mono">{time}</span>
      </div>
    </div>
  )
}
