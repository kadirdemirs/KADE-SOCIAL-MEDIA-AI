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

interface GroqWord {
  word: string
  start: number
  end: number
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const videoDuration = parseFloat((formData.get('videoDuration') as string) || '0')

    if (!audioFile) {
      return NextResponse.json({ error: 'Ses dosyası bulunamadı' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY .env.local dosyasına eklenmemiş' }, { status: 500 })
    }

    const groq = new Groq({ apiKey: groqApiKey })

    // ── 1. Groq Whisper: ses → transkript + kelime timestamp'leri ──────────────
    const transcription = (await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    })) as unknown as { text: string; words?: GroqWord[]; language?: string }

    const transcript = transcription.text?.trim()
    const words: GroqWord[] = transcription.words ?? []

    if (!transcript || transcript.length < 20) {
      return NextResponse.json(
        { error: 'Transkripsiyon çok kısa veya boş. Video ses içeriyor mu?' },
        { status: 400 }
      )
    }

    // ── 2. Groq LLaMA 3.3 70B: viral klip analizi (ücretsiz) ──────────────────
    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048,
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
      return NextResponse.json(
        { error: 'AI yanıtı JSON parse edilemedi. Tekrar dene.' },
        { status: 500 }
      )
    }

    if (!clips.length) {
      return NextResponse.json(
        { error: 'Hiç klip bulunamadı. Video yeterince uzun mu?' },
        { status: 400 }
      )
    }

    // ── 3. Her klibe kelimelerini ekle ─────────────────────────────────────────
    const clipsWithWords: ClipSuggestion[] = clips.map((clip) => ({
      ...clip,
      words: words.filter((w) => w.start >= clip.start - 0.1 && w.end <= clip.end + 0.5),
    }))

    return NextResponse.json({
      clips: clipsWithWords,
      fullTranscript: transcript,
      detectedLanguage: transcription.language,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
