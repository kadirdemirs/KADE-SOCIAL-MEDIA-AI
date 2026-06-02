import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { CLIP_EXTRACTION_SYSTEM_PROMPT, buildClipExtractionPrompt } from '@/lib/ai/prompts'

export const maxDuration = 120

export interface ClipSuggestion {
  id: number
  start: number
  end: number
  title: string
  hook: string
  reason: string
  viralScore: number
  category: string
  words: Array<{ word: string; start: number; end: number }>
}

interface GroqWord { word: string; start: number; end: number }

// Browser'dan gelen: transcript + words (ses yok — ses browser'dan direkt Groq'a gitti)
export async function POST(req: NextRequest) {
  try {
    const { transcript, words, videoDuration } = await req.json() as {
      transcript: string
      words: GroqWord[]
      videoDuration: number
    }

    if (!transcript || transcript.trim().length < 1) {
      return NextResponse.json({ error: 'Transkripsiyon boş. Videoda konuşma var mı?' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY .env.local dosyasına eklenmemiş' }, { status: 500 })
    }

    const groq = new Groq({ apiKey: groqApiKey })

    // LLaMA 3.3 70B — viral klip analizi
    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: CLIP_EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: buildClipExtractionPrompt(transcript, videoDuration) },
      ],
    })

    const raw = chat.choices[0]?.message?.content ?? ''

    let clips: Omit<ClipSuggestion, 'words'>[] = []
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) clips = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'AI yanıtı JSON parse edilemedi. Tekrar dene.' }, { status: 500 })
    }

    if (!clips.length) {
      return NextResponse.json({ error: 'Hiç klip bulunamadı. Video yeterince uzun mu?' }, { status: 400 })
    }

    const clipsWithWords: ClipSuggestion[] = clips.map((clip) => ({
      ...clip,
      words: (words ?? []).filter((w) => w.start >= clip.start - 1.5 && w.end <= clip.end + 1.5),
    }))

    return NextResponse.json({ clips: clipsWithWords })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
