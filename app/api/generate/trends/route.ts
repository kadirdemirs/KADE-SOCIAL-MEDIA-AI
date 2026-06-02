import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { TRENDS_SYSTEM_PROMPT, buildTrendsPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { niche, platform, region, model } = await req.json()
    if (!niche || !platform || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildTrendsPrompt(niche, platform, region || 'Türkiye / Türkçe'),
      model: model as AIModel,
      systemPrompt: TRENDS_SYSTEM_PROMPT,
      maxTokens: 2500,
    })

    let trends: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) trends = JSON.parse(m[0])
    } catch { trends = { raw: result.content } }

    return NextResponse.json({ trends, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}
