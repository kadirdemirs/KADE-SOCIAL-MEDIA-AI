import { NextRequest, NextResponse } from 'next/server'
import { TTSRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: TTSRequest = await req.json()
    const { text, voice = 'nova', model = 'tts-1' } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Metin boş olamaz' }, { status: 400 })
    }
    if (text.length > 4096) {
      return NextResponse.json({ error: 'Metin 4096 karakteri geçemez' }, { status: 400 })
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API anahtarı eksik' }, { status: 500 })
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const mp3 = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: 'mp3',
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="dubbing.mp3"',
        'Content-Length': String(buffer.length),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ses üretim hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
