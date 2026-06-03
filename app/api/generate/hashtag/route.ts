import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { SYSTEM_PROMPTS, buildHashtagPrompt } from '@/lib/ai/prompts'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { HashtagRequest } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: HashtagRequest = await req.json()
    const { topic, platform, niche, model, count = 30 } = body

    if (!topic || !platform || !niche || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildHashtagPrompt(topic, platform, niche, count),
      model,
      systemPrompt: SYSTEM_PROMPTS.hashtagExpert,
      maxTokens: 2000,
    })

    let hashtags: { yuksek: string[]; orta: string[]; dusuk: string[]; niche: string[] } = {
      yuksek: [], orta: [], dusuk: [], niche: [],
    }
    try {
      hashtags = JSON.parse(result.content)
    } catch {
      const allTags = result.content.match(/#\w+/g) || []
      hashtags.niche = allTags
    }

    return NextResponse.json({ hashtags, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

