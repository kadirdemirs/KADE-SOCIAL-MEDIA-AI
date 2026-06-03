import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/ai/provider'
import { SYSTEM_PROMPTS, buildViralScorePrompt } from '@/lib/ai/prompts'
import { clampScore, extractJsonObject } from '@/lib/ai/json'
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit'
import { ViralScoreRequest } from '@/types'

interface ViralCriterion {
  puan: number
  yorum: string
}

interface ViralAnalysis {
  toplam_puan: number
  kriterler: Record<string, ViralCriterion>
  guclu_yonler: string[]
  iyilestirme_onerileri: string[]
  revize_edilmis_baslik: string
}

function textArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function normalizeAnalysis(value: Record<string, unknown>, title: string): ViralAnalysis {
  const criteria = value.kriterler && typeof value.kriterler === 'object'
    ? value.kriterler as Record<string, Record<string, unknown>>
    : {}

  const normalizedCriteria = Object.fromEntries(
    ['baslik_guc', 'platform_uyum', 'seo_guc', 'merak_faktoru', 'cta_guc'].map((key) => {
      const item = criteria[key] || {}
      return [key, {
        puan: clampScore(item.puan, clampScore(value.toplam_puan, 55)),
        yorum: String(item.yorum || 'Analiz tamamlandi.'),
      }]
    })
  )

  return {
    toplam_puan: clampScore(value.toplam_puan, 55),
    kriterler: normalizedCriteria,
    guclu_yonler: textArray(value.guclu_yonler),
    iyilestirme_onerileri: textArray(value.iyilestirme_onerileri),
    revize_edilmis_baslik: String(value.revize_edilmis_baslik || title),
  }
}

export async function POST(req: NextRequest) {
  const { allowed } = rateLimit(getRateLimitKey(req))
  if (!allowed) return NextResponse.json({ error: 'Çok fazla istek. 1 dakika bekle.' }, { status: 429 })

  try {
    const body: ViralScoreRequest = await req.json()
    const { title, platform, model, description, hashtags } = body

    if (!title || !platform || !model) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 })
    }

    const result = await generateContent({
      prompt: buildViralScorePrompt(title, platform, description, hashtags),
      model,
      systemPrompt: SYSTEM_PROMPTS.viralScoreAnalyst,
      maxTokens: 2500,
    })

    const parsed = extractJsonObject(result.content) || {}
    const analysis = normalizeAnalysis(parsed, title)

    return NextResponse.json({ analysis, model: result.model, tokensUsed: result.tokensUsed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

