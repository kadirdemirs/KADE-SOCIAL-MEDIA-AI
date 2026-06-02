import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { BRAND_VOICE_TRAIN_SYSTEM_PROMPT, buildBrandVoiceTrainPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { samples, brandName, model } = await req.json()
    if (!samples || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildBrandVoiceTrainPrompt(samples, brandName || 'Marka'), model: model as AIModel, systemPrompt: BRAND_VOICE_TRAIN_SYSTEM_PROMPT, maxTokens: 2500 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
