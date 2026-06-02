import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { AUTO_POST_SYSTEM_PROMPT, buildAutoPostPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { content, contentType, targetPlatforms, model } = await req.json()
    if (!content || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildAutoPostPrompt(content, contentType || 'video', targetPlatforms || ['instagram', 'tiktok', 'youtube', 'x', 'linkedin']),
      model: model as AIModel,
      systemPrompt: AUTO_POST_SYSTEM_PROMPT,
      maxTokens: 4000,
    })

    let posts: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) posts = JSON.parse(m[0])
    } catch { posts = { raw: result.content } }

    return NextResponse.json({ posts, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}
