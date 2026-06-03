import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { SYSTEM_PROMPTS, buildHookPrompt } from '@/lib/ai/prompts'
import { extractJsonArray } from '@/lib/ai/json'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { HookGenerateRequest } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: HookGenerateRequest = await req.json()
    const { topic, format, niche, model } = body

    if (!topic || !format || !niche || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildHookPrompt(topic, format, niche),
      model,
      systemPrompt: SYSTEM_PROMPTS.hookGenerator,
      maxTokens: 2500,
    })

    const parsed = extractJsonArray<{ hook: string; tip: string; neden: string }[]>(result.content)
    const hooks = parsed?.length
      ? parsed
      : [{ hook: result.content, tip: 'genel', neden: 'AI tarafindan uretildi' }]

    return NextResponse.json({ hooks, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

