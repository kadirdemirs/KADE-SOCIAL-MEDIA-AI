import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { BLOG_SYSTEM_PROMPT, buildBlogPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { content, title, targetKeyword, model } = await req.json()
    if (!content || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildBlogPrompt(content, title || '', targetKeyword || ''),
      model: model as AIModel,
      systemPrompt: BLOG_SYSTEM_PROMPT,
      maxTokens: 8000,
    })

    let blog: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) blog = JSON.parse(m[0])
    } catch { blog = { raw: result.content } }

    return NextResponse.json({ blog, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

