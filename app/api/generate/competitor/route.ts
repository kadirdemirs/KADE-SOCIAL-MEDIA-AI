import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { COMPETITOR_SYSTEM_PROMPT, buildCompetitorPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { competitorInfo, myNiche, myPlatform, model } = await req.json()
    if (!competitorInfo || !myNiche || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildCompetitorPrompt(competitorInfo, myNiche, myPlatform || 'youtube'),
      model: model as AIModel,
      systemPrompt: COMPETITOR_SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    let analysis: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) analysis = JSON.parse(m[0])
    } catch { analysis = { raw: result.content } }

    return NextResponse.json({ analysis, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}
