import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { cacheGet, cacheSet } from '@/lib/cache'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CACHE_KEY = 'ai-insight'
const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours

export async function POST(req: NextRequest) {
  const cached = cacheGet<{ insight: string; generatedAt: string }>(CACHE_KEY)
  if (cached) return NextResponse.json({ ...cached, sources: ['CDC','WHO','NIH','NSF'], cacheHit: true })

  const body = await req.json().catch(() => ({}))
  const activeSources: string[] = body.sources ?? ['CDC ArboNET', 'WHO GOARN', 'NIH PubMed', 'NSF EcoHealth']

  const prompt = `You are a senior vector-borne disease epidemiologist reviewing national surveillance data from ${activeSources.join(', ')}.

Current situation (week of March 24, 2026):
- Lyme disease activity index: 82/100 (Critical) — 12 NE states elevated
- RMSF activity index: 74/100 (High) — early cluster in OK/AR
- West Nile activity index: 61/100 (Moderate) — Gulf Coast expanding
- Tick season onset ~3 weeks earlier than 5-year average
- One RMSF fatality confirmed in Arkansas

In 3 sentences (max 80 words total): provide a concise synthesis of the current situation, the single highest-risk pathogen this week, and one specific actionable public health recommendation. Be precise and data-driven.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const insight = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    const result = {
      insight,
      sources: activeSources,
      generatedAt: new Date().toISOString(),
    }

    cacheSet(CACHE_KEY, result, CACHE_TTL)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Anthropic API error:', err)
    return NextResponse.json({ error: 'AI insight unavailable' }, { status: 503 })
  }
}
