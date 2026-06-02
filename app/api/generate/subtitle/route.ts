import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

interface GroqWord { word: string; start: number; end: number }

function toSRT(words: GroqWord[], chunkSize = 6): string {
  if (!words.length) return ''
  const chunks: Array<{ text: string; start: number; end: number }> = []
  for (let i = 0; i < words.length; i += chunkSize) {
    const g = words.slice(i, i + chunkSize)
    chunks.push({ text: g.map(w => w.word).join(' '), start: g[0].start, end: g[g.length - 1].end })
  }
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60), ms = Math.round((s % 1) * 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms).padStart(3,'0')}`
  }
  return chunks.map((c, i) => `${i+1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.text}`).join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = (formData.get('language') as string) || undefined
    const chunkSize = parseInt(formData.get('chunkSize') as string || '6')

    if (!audioFile) return NextResponse.json({ error: 'Ses dosyası bulunamadı' }, { status: 400 })
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) return NextResponse.json({ error: 'GROQ_API_KEY eksik' }, { status: 500 })

    const groq = new Groq({ apiKey: groqKey })
    const transcription = (await groq.audio.transcriptions.create({
      file: audioFile, model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json', timestamp_granularities: ['word'],
      ...(language ? { language } : {}),
    })) as unknown as { text: string; words?: GroqWord[]; language?: string }

    const words: GroqWord[] = transcription.words ?? []
    const srt = toSRT(words, chunkSize)

    return NextResponse.json({ srt, transcript: transcription.text, wordCount: words.length, detectedLanguage: transcription.language })
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Sunucu hatası' }, { status: 500 }) }
}
