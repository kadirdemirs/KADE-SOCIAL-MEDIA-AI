import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { IDEAS_SYSTEM_PROMPT, buildIdeasPrompt } from '@/lib/ai/prompts'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { IdeasRequest } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: IdeasRequest = await req.json()
    const { niche, platform, model, count = 20, style = 'karışık' } = body

    if (!niche || !platform || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildIdeasPrompt(niche, platform, count, style),
      model,
      systemPrompt: IDEAS_SYSTEM_PROMPT,
      maxTokens: 4000,
    })

    let ideas: unknown[] = []
    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) ideas = JSON.parse(jsonMatch[0])
    } catch {
      ideas = []
    }

    return NextResponse.json({ ideas, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

