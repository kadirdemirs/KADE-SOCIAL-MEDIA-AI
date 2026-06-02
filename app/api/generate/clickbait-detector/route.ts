import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { CLICKBAIT_SYSTEM_PROMPT, buildClickbaitPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { title, platform, model } = await req.json()
    if (!title || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildClickbaitPrompt(title, platform || 'youtube'), model: model as AIModel, systemPrompt: CLICKBAIT_SYSTEM_PROMPT, maxTokens: 2000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatasÄ±' }, { status: 500 }) }
}

