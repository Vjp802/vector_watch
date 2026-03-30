'use client'

import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js'
import { Pathogen } from '@/lib/types'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler)

export function TrendChart({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const inst = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (inst.current) inst.current.destroy()
    inst.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: ['Jan', '', '', 'Feb', '', '', 'Mar', '', '', 'Apr', '', ''],
        datasets: [{
          data,
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46,125,50,0.07)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8a9688', font: { size: 7 }, maxRotation: 0 } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#8a9688', font: { size: 7 } }, min: 0, max: 100 },
        },
      },
    })
    return () => inst.current?.destroy()
  }, [data])

  return <div className="relative h-16"><canvas ref={ref} /></div>
}

export function SparkLine({ pathogen: p }: { pathogen: Pathogen }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const inst = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (inst.current) inst.current.destroy()
    const vals = p.trend.map(v => Math.max(0, Math.min(100, v + Math.round((Math.random() - 0.5) * 6))))
    inst.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: Array(vals.length).fill(''),
        datasets: [{ data: vals, borderColor: p.color, borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false, min: 0, max: 100 } },
        animation: { duration: 400 },
      },
    })
    return () => inst.current?.destroy()
  }, [p])

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-medium">{p.name}</span>
        <span className="text-[9px] font-mono" style={{ color: p.color }}>{p.act}</span>
      </div>
      <div className="relative h-4"><canvas ref={ref} /></div>
    </div>
  )
}
