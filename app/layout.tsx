import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VectorWatch — Vector-Borne Disease Surveillance',
  description: 'Real-time vector-borne disease surveillance dashboard pulling from CDC, WHO, NIH, and NSF data sources.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-vw-bg text-vw-text">{children}</body>
    </html>
  )
}
