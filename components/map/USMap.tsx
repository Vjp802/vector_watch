'use client'

import { useEffect, useRef } from 'react'
import { StateData } from '@/lib/types'
import { activityColor } from '@/lib/data'

interface Props { states: StateData[] }

export function USMap({ states }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return

    const stateMap = new Map(states.map(s => [s.name, s]))

    async function init() {
      const [d3, topojson] = await Promise.all([
        import('d3'),
        import('topojson-client'),
      ])

      const { width, height } = containerRef.current!.getBoundingClientRect()
      if (!width || !height) return

      const proj = d3.geoAlbersUsa()
        .scale(Math.min(width, height) * 1.2)
        .translate([width / 2, height / 2])

      const pathFn = d3.geoPath(proj)
      const svg = d3.select(svgRef.current!)
        .attr('viewBox', `0 0 ${width} ${height}`)

      const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json') as any
      const features = (topojson as any).feature(us, us.objects.states).features

      // Tooltip div
      const tip = d3.select(containerRef.current!)
        .append('div')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('border', '1px solid #c8cbc4')
        .style('border-radius', '5px')
        .style('padding', '6px 10px')
        .style('display', 'none')
        .style('pointer-events', 'none')
        .style('font-size', '9px')
        .style('font-family', 'monospace')
        .style('min-width', '130px')
        .style('z-index', '10')

      svg.selectAll('path')
        .data(features)
        .join('path')
        .attr('d', (d: any) => pathFn(d) ?? '')
        .attr('fill', (d: any) => {
          const s = stateMap.get(d.properties.name)
          return activityColor(s?.activityIndex ?? 10)
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.7)
        .style('cursor', 'pointer')
        .on('mousemove', function (event: MouseEvent, d: any) {
          const s = stateMap.get(d.properties.name)
          const rect = containerRef.current!.getBoundingClientRect()
          tip
            .style('display', 'block')
            .style('left', (event.clientX - rect.left + 10) + 'px')
            .style('top', (event.clientY - rect.top - 8) + 'px')
            .html(`
              <div style="font-size:11px;font-weight:600;color:#2e7d32;margin-bottom:4px;font-family:system-ui">${d.properties.name}</div>
              <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:2px">
                <span style="color:#8a9688">Index</span>
                <span style="font-weight:600">${s?.activityIndex ?? '–'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:2px">
                <span style="color:#8a9688">Risk</span>
                <span style="font-weight:600">${s?.riskLevel ?? '–'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:10px">
                <span style="color:#8a9688">Pathogen</span>
                <span style="font-weight:600">${s?.topPathogen ?? 'Lyme disease'}</span>
              </div>
            `)
        })
        .on('mouseleave', function () {
          tip.style('display', 'none')
        })
    }

    init()
  }, [states])

  return (
    <div ref={containerRef} className="relative w-full h-full bg-vw-surface2">
      <svg ref={svgRef} className="w-full h-full block" />

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 border border-vw-border rounded p-1.5">
        <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-1">Activity index</div>
        {[
          { bg: '#e8f5e9', label: '0–20 low' },
          { bg: '#a5d6a7', label: '20–40' },
          { bg: '#4caf50', label: '40–60 mod' },
          { bg: '#e65100', label: '60–80 high' },
          { bg: '#c62828', label: '80+ critical' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-1 mb-0.5">
            <div className="w-3 h-1.5 rounded-sm" style={{ background: r.bg }} />
            <span className="text-[7px] font-mono text-vw-text2">{r.label}</span>
          </div>
        ))}
      </div>

      {/* Sources overlay */}
      <div className="absolute bottom-2 right-2 bg-white/90 border border-vw-border rounded p-1.5">
        <div className="text-[7px] font-mono text-vw-text3 uppercase tracking-wider mb-1">Sources</div>
        {[
          { color: '#2e7d32', label: 'CDC ArboNET' },
          { color: '#1565c0', label: 'WHO GOARN' },
          { color: '#6a1b9a', label: 'NIH PubMed' },
          { color: '#00695c', label: 'NSF EcoHealth' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-1 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
            <span className="text-[8px] text-vw-text2">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
