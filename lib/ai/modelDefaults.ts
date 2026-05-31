import { AIModel } from '@/types'

export interface ToolModelConfig {
  model: AIModel
  reason: string
}

/**
 * Her araç için en iyi model ve gerekçesi.
 *
 * Claude  → uzun formlu yaratıcı yazı, ton & stil kontrolü, Türkçe kalitesi
 * GPT-4o  → yapılandırılmış JSON çıktısı, analitik skorlama, format tutarlılığı
 * Gemini  → geniş web bilgisi gerektiren içerikler, trend analizi
 */
export const TOOL_MODEL_DEFAULTS: Record<string, ToolModelConfig> = {
  title: {
    model: 'claude',
    reason: 'Claude yaratıcı, merak uyandıran başlıklarda daha güçlü',
  },
  description: {
    model: 'claude',
    reason: 'Claude uzun formlu yapılandırılmış metinlerde üstün',
  },
  hook: {
    model: 'claude',
    reason: 'Claude duygusal tetikleyicili hook yazmada öne çıkıyor',
  },
  script: {
    model: 'claude',
    reason: 'Claude uzun, tutarlı ve akıcı script üretiminde en iyi',
  },
  hashtag: {
    model: 'gpt4o',
    reason: 'GPT-4o JSON kategorileme ve format tutarlılığında daha güvenilir',
  },
  'viral-score': {
    model: 'gpt4o',
    reason: 'GPT-4o analitik skorlama ve yapılandırılmış analizde daha tutarlı',
  },
  repurpose: {
    model: 'claude',
    reason: 'Claude ton ve stil adaptasyonunda platforma göre en iyi uyumu sağlıyor',
  },
  dubbing: {
    model: 'claude',
    reason: 'Claude kültürel nüans ve doğal çeviri kalitesinde öne çıkıyor',
  },
}
