import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { SYSTEM_PROMPTS, buildViralScorePrompt } from '@/lib/ai/prompts'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { ViralScoreRequest } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Ã‡ok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: ViralScoreRequest = await req.json()
    const { title, platform, model, description, hashtags } = body

    if (!title || !platform || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildViralScorePrompt(title, platform, description, hashtags),
      model,
      systemPrompt: SYSTEM_PROMPTS.viralScoreAnalyst,
      maxTokens: 2500,
    })

    let analysis: Record<string, unknown> = {}
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0])
    } catch {
      analysis = { raw: result.content }
    }

    return NextResponse.json({ analysis, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatasÄ±'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

