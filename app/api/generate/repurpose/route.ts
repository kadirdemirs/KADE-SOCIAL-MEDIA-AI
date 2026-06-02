import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { REPURPOSE_SYSTEM_PROMPT, buildRepurposePrompt } from '@/lib/ai/prompts'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const { content, sourcePlatform, targetPlatform, model } = await req.json()

    if (!content || !sourcePlatform || !targetPlatform || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildRepurposePrompt(content, sourcePlatform, targetPlatform),
      model: model as AIModel,
      systemPrompt: REPURPOSE_SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    return NextResponse.json({ content: result.content, model: result.model })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
