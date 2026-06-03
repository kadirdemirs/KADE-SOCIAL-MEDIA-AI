import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { CHAPTERS_SYSTEM_PROMPT, buildChaptersPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { transcript, videoDuration, model } = await req.json()
    if (!transcript || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildChaptersPrompt(transcript, videoDuration || 'bilinmiyor'),
      model: model as AIModel,
      systemPrompt: CHAPTERS_SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    let chapters: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) chapters = JSON.parse(m[0])
    } catch { chapters = { raw: result.content } }

    return NextResponse.json({ chapters, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

