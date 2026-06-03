import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { SPONSOR_SCRIPT_SYSTEM_PROMPT, buildSponsorScriptPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { brand, product, channel, duration, keyPoints, model } = await req.json()
    if (!brand || !product || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildSponsorScriptPrompt(brand, product, channel || '', duration || '60 saniye', keyPoints || ''), model: model as AIModel, systemPrompt: SPONSOR_SCRIPT_SYSTEM_PROMPT, maxTokens: 3000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}

