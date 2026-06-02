import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { GIVEAWAY_SYSTEM_PROMPT, buildGiveawayPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { prize, platform, requirements, endDate, model } = await req.json()
    if (!prize || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildGiveawayPrompt(prize, platform || 'instagram', requirements || 'takip et + beğen + arkadaşını etiketle', endDate || '1 hafta sonra'), model: model as AIModel, systemPrompt: GIVEAWAY_SYSTEM_PROMPT, maxTokens: 2500 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
