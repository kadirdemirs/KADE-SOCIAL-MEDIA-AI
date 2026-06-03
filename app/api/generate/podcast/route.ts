import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { PODCAST_SYSTEM_PROMPT, buildPodcastPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, duration, format, hostName, model } = await req.json()
    if (!topic || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildPodcastPrompt(topic, duration || '30 dakika', format || 'solo', hostName || ''),
      model: model as AIModel,
      systemPrompt: PODCAST_SYSTEM_PROMPT,
      maxTokens: 6000,
    })

    let podcast: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) podcast = JSON.parse(m[0])
    } catch { podcast = { raw: result.content } }

    return NextResponse.json({ podcast, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

