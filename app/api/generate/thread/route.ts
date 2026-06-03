import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { THREAD_SYSTEM_PROMPT, buildThreadPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, style, tweetCount, model } = await req.json()
    if (!topic || !platform || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildThreadPrompt(topic, platform, style || 'bilgilendirici', tweetCount || 7),
      model: model as AIModel,
      systemPrompt: THREAD_SYSTEM_PROMPT,
      maxTokens: 4000,
    })

    let thread: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) thread = JSON.parse(m[0])
    } catch { thread = { raw: result.content } }

    return NextResponse.json({ thread, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

