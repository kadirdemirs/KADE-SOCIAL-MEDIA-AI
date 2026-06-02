import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { QUOTE_SYSTEM_PROMPT, buildQuotePrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { content, authorName, model } = await req.json()
    if (!content || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildQuotePrompt(content, authorName || ''), model: model as AIModel, systemPrompt: QUOTE_SYSTEM_PROMPT, maxTokens: 2000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
