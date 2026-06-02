export type AIModel =
  | 'groq-llama-70b'
  | 'groq-gpt-oss-120b'
  | 'groq-llama-8b'
  | 'groq-gpt-oss-20b'
  | 'groq-qwen-32b'
  | 'claude'
  | 'gpt4o'
  | 'gemini'

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'x' | 'linkedin' | 'pinterest'

export type ContentTone = 'bilgilendirici' | 'eğlenceli' | 'ilham verici' | 'dikkat çekici' | 'samimi'

export interface GenerateRequest {
  prompt: string
  model: AIModel
  systemPrompt?: string
  maxTokens?: number
}

export interface GenerateResult {
  content: string
  model: AIModel
  tokensUsed?: number
}

export interface TitleGenerateRequest {
  topic: string
  platform: Platform
  tone: ContentTone
  model: AIModel
  keywords?: string
}

export interface DescriptionGenerateRequest {
  title: string
  summary: string
  platform: Platform
  targetAudience: string
  model: AIModel
  includeHashtags?: boolean
  includeCTA?: boolean
}

export interface HookGenerateRequest {
  topic: string
  format: 'reels' | 'shorts' | 'tiktok' | 'youtube'
  niche: string
  model: AIModel
}

export interface HashtagRequest {
  topic: string
  platform: Platform
  niche: string
  model: AIModel
  count?: number
}

export interface ScriptRequest {
  title: string
  hook?: string
  duration: '30s' | '60s' | '3min' | '5min' | '10min'
  platform: Platform
  tone: ContentTone
  model: AIModel
}

export interface ViralScoreRequest {
  title: string
  platform: Platform
  model: AIModel
  description?: string
  hashtags?: string
}

export interface IdeasRequest {
  niche: string
  platform: Platform
  model: AIModel
  count?: number
  style?: string
}

export interface ThumbnailRequest {
  title: string
  platform: Platform
  niche: string
  model: AIModel
  style?: string
}

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
export type TTSModel = 'tts-1' | 'tts-1-hd'

export interface TTSRequest {
  text: string
  voice: TTSVoice
  model: TTSModel
}

export type DubbingLanguage =
  | 'english' | 'german' | 'french' | 'spanish' | 'arabic'
  | 'japanese' | 'korean' | 'russian' | 'portuguese' | 'italian'

export interface TranslateRequest {
  content: string
  sourceLang: string
  targetLang: DubbingLanguage
  model: AIModel
  includePronunciation?: boolean
  includeTimingNotes?: boolean
  includeCulturalNotes?: boolean
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  category: string
}
