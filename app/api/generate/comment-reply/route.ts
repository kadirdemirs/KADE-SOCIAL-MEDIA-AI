import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { COMMENT_REPLY_SYSTEM_PROMPT, buildCommentReplyPrompt } from '@/lib/ai/prompts'
import { AIModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { comment, context, style, model } = await req.json()
    if (!comment || !model) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })

    const result = await generateContent({
      prompt: buildCommentReplyPrompt(comment, context || 'genel içerik üreticisi', style || 'samimi'),
      model: model as AIModel,
      systemPrompt: COMMENT_REPLY_SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    let replies: Record<string, unknown> = {}
    try {
      const m = result.content.match(/\{[\s\S]*\}/)
      if (m) replies = JSON.parse(m[0])
    } catch { replies = { raw: result.content } }

    return NextResponse.json({ replies, tokensUsed: result.tokensUsed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 })
  }
}

