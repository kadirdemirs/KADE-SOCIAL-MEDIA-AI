import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { CONTENT_PLAN_SYSTEM_PROMPT, buildContentPlanPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { niche, platform, goal, frequency, model } = await req.json()
    if (!niche || !platform || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildContentPlanPrompt(niche, platform, goal || 'takipçi büyümesi', frequency || 'haftada 3'),
      model: model as AIModel,
      systemPrompt: CONTENT_PLAN_SYSTEM_PROMPT,
      maxTokens: 8000,
    })

    let plan: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) plan = JSON.parse(m[0])
    } catch { plan = { raw: result.content } }

    return NextResponse.json({ plan, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

