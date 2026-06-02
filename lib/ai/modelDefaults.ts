import { AIModel } from '@/types'

export interface ToolModelConfig {
  model: AIModel
  reason: string
}

export const TOOL_MODEL_DEFAULTS: Record<string, ToolModelConfig> = {
  title: {
    model: 'groq-llama-70b',
    reason: 'Llama 70B yaratıcı başlık ve Türkçe ton için varsayılan',
  },
  description: {
    model: 'groq-llama-70b',
    reason: 'Llama 70B uzun açıklama ve akıcı metinlerde daha dengeli',
  },
  hook: {
    model: 'groq-llama-70b',
    reason: 'Llama 70B hook ve yaratıcı varyasyonlarda güçlü',
  },
  script: {
    model: 'groq-llama-70b',
    reason: 'Llama 70B uzun script tutarlılığı için seçildi',
  },
  hashtag: {
    model: 'groq-gpt-oss-20b',
    reason: 'GPT-OSS 20B hızlı JSON ve kategori çıktıları için iyi',
  },
  'viral-score': {
    model: 'groq-gpt-oss-120b',
    reason: 'GPT-OSS 120B analiz ve skorlama için seçildi',
  },
  repurpose: {
    model: 'groq-llama-70b',
    reason: 'Llama 70B platform tonuna uyarlamada dengeli',
  },
  dubbing: {
    model: 'groq-qwen-32b',
    reason: 'Qwen 32B çeviri, planlama ve nüanslı düzenleme için seçildi',
  },
}
