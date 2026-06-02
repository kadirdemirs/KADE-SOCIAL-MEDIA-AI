import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'

// Browser'a Groq API key'ini güvenli şekilde iletir (rate-limited)
export async function GET(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  const key = process.env.GROQ_API_KEY
  if (!key) return NextResponse.json({ error: 'GROQ_API_KEY .env.local dosyasına eklenmemiş' }, { status: 500 })

  return NextResponse.json({ key })
}
