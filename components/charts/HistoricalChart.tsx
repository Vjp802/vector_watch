'use client'

import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, BarController, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js'
import { YearlyPoint, lastNYears } from '@/lib/historical'

Chart.register(LineController, LineElement, BarController, BarElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

interface Props {
  data: YearlyPoint[]
  color: string
  label: string
  pathogenId: string
  height?: number
}

export function HistoricalChart({ data, color, label, height = 140 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const inst = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (inst.current) inst.current.destroy()

    const pts = lastNYears(data, 12)

    inst.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: pts.map(p => p.year),
        datasets: [{
          label,
          data: pts.map(p => p.cases),
          backgroundColor: color + '99',
          borderColor: color,
          borderWidth: 1.5,
          borderRadius: 3,
          hoverBackgroundColor: color,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} cases`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#8a9688', font: { size: 8 } },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              color: '#8a9688',
              font: { size: 8 },
              callback: (v) => Number(v) >= 1000 ? `${(Number(v)/1000).toFixed(0)}k` : v,
            },
            beginAtZero: true,
          },
        },
      },
    })

    return () => inst.current?.destroy()
  }, [data, color, label])

  return <div style={{ position: 'relative', height }}><canvas ref={ref} /></div>
}
