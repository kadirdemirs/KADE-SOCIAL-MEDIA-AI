import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { THUMBNAIL_SYSTEM_PROMPT, buildThumbnailPrompt } from '@/lib/ai/prompts'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { ThumbnailRequest } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: ThumbnailRequest = await req.json()
    const { title, platform, niche, model, style = 'dikkat çekici' } = body

    if (!title || !platform || !niche || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildThumbnailPrompt(title, platform, niche, style),
      model,
      systemPrompt: THUMBNAIL_SYSTEM_PROMPT,
      maxTokens: 1500,
    })

    let concepts: unknown[] = []
    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) concepts = JSON.parse(jsonMatch[0])
    } catch {
      concepts = []
    }

    return NextResponse.json({ concepts, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
