import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { NICHE_FINDER_SYSTEM_PROMPT, buildNicheFinderPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { interests, skills, platform, monetizationGoal, model } = await req.json()
    if (!interests || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildNicheFinderPrompt(interests, skills || '', platform || 'youtube', monetizationGoal || 'aylık 10.000 TL'), model: model as AIModel, systemPrompt: NICHE_FINDER_SYSTEM_PROMPT, maxTokens: 3000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
