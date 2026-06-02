import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { YOUTUBE_SEO_SYSTEM_PROMPT, buildYoutubeSeoPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { title, description, tags, niche, model } = await req.json()
    if (!title || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildYoutubeSeoPrompt(title, description || '', tags || '', niche || ''),
      model: model as AIModel,
      systemPrompt: YOUTUBE_SEO_SYSTEM_PROMPT,
      maxTokens: 2500,
    })

    let seo: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) seo = JSON.parse(m[0])
    } catch { seo = { raw: result.content } }

    return NextResponse.json({ seo, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}
