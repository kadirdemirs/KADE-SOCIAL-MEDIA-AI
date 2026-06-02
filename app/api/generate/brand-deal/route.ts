import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { BRAND_DEAL_SYSTEM_PROMPT, buildBrandDealPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { platform, followers, avgViews, engagementRate, niche, dealType, model } = await req.json()
    if (!followers || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildBrandDealPrompt(platform || 'youtube', followers, avgViews || '0', engagementRate || '0', niche || '', dealType || 'sponsorluk'), model: model as AIModel, systemPrompt: BRAND_DEAL_SYSTEM_PROMPT, maxTokens: 2000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
