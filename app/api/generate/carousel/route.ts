import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { CAROUSEL_SYSTEM_PROMPT, buildCarouselPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, slideCount, tone, model } = await req.json()
    if (!topic || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildCarouselPrompt(topic, platform || 'instagram', slideCount || 7, tone || 'bilgilendirici'),
      model: model as AIModel,
      systemPrompt: CAROUSEL_SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    let carousel: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) carousel = JSON.parse(m[0])
    } catch { carousel = { raw: result.content } }

    return NextResponse.json({ carousel, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}
