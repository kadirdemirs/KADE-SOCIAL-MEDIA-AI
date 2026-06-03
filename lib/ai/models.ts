import { AIModel } from '@/types'

export interface ModelConfig {
  id: AIModel
  label: string
  shortLabel: string
  description: string
  provider: 'groq' | 'openrouter' | 'anthropic' | 'openai' | 'google'
  groqModel?: string
  openRouterModel?: string
  geminiModel?: string
  colorClass: string
  activeClass: string
  dotClass: string
}

export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  'groq-llama-70b': {
    id: 'groq-llama-70b',
    label: 'Groq Llama 3.3 70B',
    shortLabel: 'Llama 70B',
    description: 'Genel kalite, uzun metin, Türkçe içerik',
    provider: 'groq',
    groqModel: 'llama-3.3-70b-versatile',
    colorClass: 'text-violet-400',
    activeClass: 'border-violet-300 bg-violet-50 text-violet-700 shadow-sm',
    dotClass: 'bg-violet-400',
  },
  'groq-gpt-oss-120b': {
    id: 'groq-gpt-oss-120b',
    label: 'Groq GPT-OSS 120B',
    shortLabel: 'GPT-OSS 120B',
    description: 'Analiz, mantık, yapılandırılmış çıktı',
    provider: 'groq',
    groqModel: 'openai/gpt-oss-120b',
    colorClass: 'text-emerald-400',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm',
    dotClass: 'bg-emerald-400',
  },
  'groq-llama-8b': {
    id: 'groq-llama-8b',
    label: 'Groq Llama 3.1 8B',
    shortLabel: 'Hızlı 8B',
    description: 'Çok hızlı taslak ve kısa içerik',
    provider: 'groq',
    groqModel: 'llama-3.1-8b-instant',
    colorClass: 'text-sky-400',
    activeClass: 'border-sky-300 bg-sky-50 text-sky-700 shadow-sm',
    dotClass: 'bg-sky-400',
  },
  'groq-gpt-oss-20b': {
    id: 'groq-gpt-oss-20b',
    label: 'Groq GPT-OSS 20B',
    shortLabel: 'GPT-OSS 20B',
    description: 'Hızlı analiz ve formatlı cevap',
    provider: 'groq',
    groqModel: 'openai/gpt-oss-20b',
    colorClass: 'text-teal-400',
    activeClass: 'border-teal-300 bg-teal-50 text-teal-700 shadow-sm',
    dotClass: 'bg-teal-400',
  },
  'groq-qwen-32b': {
    id: 'groq-qwen-32b',
    label: 'Groq Qwen3 32B',
    shortLabel: 'Qwen 32B',
    description: 'Mantık, planlama, teknik içerik',
    provider: 'groq',
    groqModel: 'qwen/qwen3-32b',
    colorClass: 'text-amber-400',
    activeClass: 'border-amber-300 bg-amber-50 text-amber-700 shadow-sm',
    dotClass: 'bg-amber-400',
  },
  'openrouter-free': {
    id: 'openrouter-free',
    label: 'OpenRouter Free',
    shortLabel: 'OR Free',
    description: 'OpenRouter ücretsiz model router',
    provider: 'openrouter',
    openRouterModel: 'openrouter/free',
    colorClass: 'text-fuchsia-400',
    activeClass: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 shadow-sm',
    dotClass: 'bg-fuchsia-400',
  },
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Gemini 2.5 Flash',
    shortLabel: 'Gemini Flash',
    description: 'Google AI Studio free tier',
    provider: 'google',
    geminiModel: 'gemini-2.5-flash',
    colorClass: 'text-blue-400',
    activeClass: 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm',
    dotClass: 'bg-blue-400',
  },
  claude: {
    id: 'claude',
    label: 'Claude Sonnet',
    shortLabel: 'Claude',
    description: 'ANTHROPIC_API_KEY varsa kullanılır',
    provider: 'anthropic',
    colorClass: 'text-orange-400',
    activeClass: 'border-orange-300 bg-orange-50 text-orange-700 shadow-sm',
    dotClass: 'bg-orange-400',
  },
  gpt4o: {
    id: 'gpt4o',
    label: 'GPT-4o',
    shortLabel: 'GPT-4o',
    description: 'OPENAI_API_KEY varsa kullanılır',
    provider: 'openai',
    colorClass: 'text-emerald-400',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm',
    dotClass: 'bg-emerald-400',
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini Pro',
    shortLabel: 'Gemini',
    description: 'GEMINI_API_KEY varsa kullanılır',
    provider: 'google',
    colorClass: 'text-blue-400',
    activeClass: 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm',
    dotClass: 'bg-blue-400',
  },
}

export const FREE_GROQ_MODELS: AIModel[] = [
  'groq-llama-70b',
  'groq-gpt-oss-120b',
  'openrouter-free',
  'gemini-flash',
  'groq-llama-8b',
  'groq-gpt-oss-20b',
  'groq-qwen-32b',
]

export const COMPARE_MODELS: AIModel[] = ['groq-llama-70b', 'openrouter-free', 'gemini-flash']

export function getModelConfig(model: AIModel): ModelConfig {
  return MODEL_CONFIGS[model] || MODEL_CONFIGS['groq-llama-70b']
}
