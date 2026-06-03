import { AIModel } from '@/types'

export interface ToolModelConfig {
  model: AIModel
  reason: string
}

const creative = 'groq-llama-70b'
const longContext = 'gemini-flash'
const longContextLatest = 'gemini-flash-latest'
const fastBatch = 'cerebras-glm-4-7'
const structuredFast = 'groq-gpt-oss-20b'
const analysis = 'mistral-magistral'

export const TOOL_MODEL_DEFAULTS: Record<string, ToolModelConfig> = {
  title: {
    model: creative,
    reason: 'Başlık için Groq Llama 70B seçildi: Türkçe ton ve yaratıcı varyasyonlarda dengeli.',
  },
  description: {
    model: longContext,
    reason: 'Açıklama için Gemini Flash seçildi: uzun bağlam ve akıcı metinlerde güçlü.',
  },
  hook: {
    model: creative,
    reason: 'Hook için Groq Llama 70B seçildi: kısa, yaratıcı ve vurucu Türkçe cümlelerde iyi.',
  },
  script: {
    model: longContextLatest,
    reason: 'Script için Gemini Flash Latest seçildi: uzun bağlam ve tutarlı akış için uygun.',
  },
  hashtag: {
    model: structuredFast,
    reason: 'Hashtag için Groq GPT-OSS 20B seçildi: hızlı, kategorili ve formatlı çıktı verir.',
  },
  thread: {
    model: creative,
    reason: 'Thread için Groq Llama 70B seçildi: kısa parçalarda tutarlı anlatı kurar.',
  },
  carousel: {
    model: 'gemini-flash-lite',
    reason: 'Carousel için Gemini Flash-Lite seçildi: slayt slayt net ve hızlı çıktı verir.',
  },
  podcast: {
    model: longContextLatest,
    reason: 'Podcast için Gemini Flash Latest seçildi: uzun konuşma akışı ve bölüm yapısında iyi.',
  },
  blog: {
    model: longContext,
    reason: 'Blog için Gemini Flash seçildi: uzun form içerikte bağlamı iyi korur.',
  },
  newsletter: {
    model: creative,
    reason: 'Newsletter için Groq Llama 70B seçildi: Türkçe ton ve akıcı pazarlama dili için iyi.',
  },
  'sponsor-script': {
    model: creative,
    reason: 'Sponsor scripti için Groq Llama 70B seçildi: doğal reklam metni ve ton uyumu için.',
  },
  'collab-mail': {
    model: creative,
    reason: 'Kolaborasyon maili için Groq Llama 70B seçildi: ikna edici ve samimi Türkçe için.',
  },
  giveaway: {
    model: structuredFast,
    reason: 'Çekiliş metni için GPT-OSS 20B seçildi: kurallı ve formatlı çıktı hızlı gelir.',
  },
  bulk: {
    model: fastBatch,
    reason: 'Toplu içerik için Cerebras GLM 4.7 seçildi: yüksek hız ve çoklu çıktı için.',
  },
  thumbnail: {
    model: 'gemini-3-1-lite',
    reason: 'Thumbnail konsepti için Gemini 3.1 Lite seçildi: görsel fikir ve hızlı varyasyon için.',
  },
  storyboard: {
    model: longContextLatest,
    reason: 'Storyboard için Gemini Flash Latest seçildi: uzun sahne akışını daha iyi taşır.',
  },
  broll: {
    model: 'gemini-flash-lite',
    reason: 'B-roll için Gemini Flash-Lite seçildi: hızlı shot list ve pratik sahne önerileri için.',
  },
  'story-series': {
    model: 'gemini-flash-lite',
    reason: 'Story dizisi için Gemini Flash-Lite seçildi: seri kısa içerik üretiminde hızlı.',
  },
  dubbing: {
    model: longContext,
    reason: 'Dublaj ve çeviri için Gemini Flash seçildi: uzun metin ve dil dönüşümünde güçlü.',
  },
  'viral-score': {
    model: analysis,
    reason: 'Viral skor için Magistral seçildi: reasoning ve değerlendirme işlerinde daha iyi.',
  },
  'comment-analysis': {
    model: analysis,
    reason: 'Yorum analizi için Magistral seçildi: sınıflandırma ve çıkarımda güçlü.',
  },
  'clickbait-detector': {
    model: analysis,
    reason: 'Clickbait analizi için Magistral seçildi: muhakeme ve risk değerlendirmesi için.',
  },
  'youtube-seo': {
    model: 'groq-qwen-32b',
    reason: 'YouTube SEO için Qwen3 32B seçildi: planlama, anahtar kelime ve yapılandırmada iyi.',
  },
  trends: {
    model: 'openrouter-free',
    reason: 'Trend bulucu için OpenRouter Free Router seçildi: farklı ücretsiz modelleri dener.',
  },
  competitor: {
    model: 'mistral-medium',
    reason: 'Rakip analizi için Mistral Medium seçildi: daha kaliteli analiz ve kıyaslama için.',
  },
  performance: {
    model: analysis,
    reason: 'Performans tahmini için Magistral seçildi: puanlama ve neden-sonuç analizi için.',
  },
  analytics: {
    model: analysis,
    reason: 'Analitik için Magistral seçildi: veri yorumu ve çıkarım için daha uygun.',
  },
  faq: {
    model: structuredFast,
    reason: 'FAQ için GPT-OSS 20B seçildi: soru-cevap formatını hızlı ve temiz üretir.',
  },
  'quote-extractor': {
    model: structuredFast,
    reason: 'Alıntı çıkarma için GPT-OSS 20B seçildi: seçim ve formatlı listeleme için hızlı.',
  },
  'comment-reply': {
    model: creative,
    reason: 'Yorum yanıtı için Groq Llama 70B seçildi: doğal, samimi ve Türkçe yanıtlar için.',
  },
  'community-post': {
    model: creative,
    reason: 'Topluluk postu için Groq Llama 70B seçildi: sıcak ve etkileşimli metin için.',
  },
  poll: {
    model: structuredFast,
    reason: 'Anket için GPT-OSS 20B seçildi: çoklu soru ve seçenek formatı için hızlı.',
  },
  livestream: {
    model: longContext,
    reason: 'Livestream scripti için Gemini Flash seçildi: uzun akış ve segment planı için.',
  },
  chapters: {
    model: 'groq-qwen-32b',
    reason: 'YouTube chapters için Qwen3 32B seçildi: zamanlama ve yapılandırmada iyi.',
  },
  'auto-post': {
    model: 'gemini-flash-lite',
    reason: 'Otomatik paylaşım için Gemini Flash-Lite seçildi: hızlı platform metinleri için.',
  },
  repurpose: {
    model: 'gemini-flash-lite',
    reason: 'Repurpose için Gemini Flash-Lite seçildi: hızlı platform uyarlaması için pratik.',
  },
  humanizer: {
    model: creative,
    reason: 'Humanizer için Groq Llama 70B seçildi: doğal Türkçe üslup için.',
  },
  audience: {
    model: analysis,
    reason: 'Hedef kitle için Magistral seçildi: analiz ve segment çıkarımı için.',
  },
  'brand-voice': {
    model: creative,
    reason: 'Marka sesi için Groq Llama 70B seçildi: ton ve ifade tutarlılığı için.',
  },
  'brand-voice-train': {
    model: 'mistral-medium',
    reason: 'Ses eğitimi için Mistral Medium seçildi: örneklerden stil çıkarımında güçlü.',
  },
  'niche-finder': {
    model: analysis,
    reason: 'Niche bulucu için Magistral seçildi: stratejik muhakeme ve fırsat analizi için.',
  },
  'pillar-planner': {
    model: longContext,
    reason: 'Pillar planner için Gemini Flash seçildi: uzun vadeli içerik yapısı için.',
  },
  'brand-deal': {
    model: analysis,
    reason: 'Brand deal için Magistral seçildi: fiyatlama ve pazarlık analizi için.',
  },
  course: {
    model: longContextLatest,
    reason: 'Kurs taslağı için Gemini Flash Latest seçildi: uzun müfredat ve modül planı için.',
  },
  ideas: {
    model: fastBatch,
    reason: 'Fikir üretimi için Cerebras GLM 4.7 seçildi: çok hızlı varyasyon üretir.',
  },
  'content-plan': {
    model: longContext,
    reason: 'İçerik planı için Gemini Flash seçildi: uzun takvim ve bağlam yönetimi için.',
  },
  'bio-link': {
    model: creative,
    reason: 'Bio link için Groq Llama 70B seçildi: kısa, ikna edici ve marka uyumlu metin için.',
  },
}
