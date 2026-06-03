import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { COURSE_SYSTEM_PROMPT, buildCoursePrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const { topic, targetAudience, level, duration, model } = await req.json()
    if (!topic || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    const result = await generateContent({ prompt: buildCoursePrompt(topic, targetAudience || 'yeni başlayanlar', level || 'başlangıç', duration || '5 saat'), model: model as AIModel, systemPrompt: COURSE_SYSTEM_PROMPT, maxTokens: 6000 })
    let data: Record<string, unknown> = {}
    try { const m = result.content.match(/\{[\s\S]*\}/); if (m) data = JSON.parse(m[0]) } catch { data = { raw: result.content } }
    return NextResponse.json({ data, tokensUsed: result.tokensUsed })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}

