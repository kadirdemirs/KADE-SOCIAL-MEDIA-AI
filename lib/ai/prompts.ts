import { Platform, ContentTone } from '@/types'

export const SYSTEM_PROMPTS = {
  titleGenerator: `Sen YouTube ve sosyal medya başlığı yazma konusunda uzman bir içerik stratejistisisin.
Başlıklar: SEO odaklı, merak uyandıran, tıklanabilir olmalı.
Yanıtını sadece JSON array formatında ver: ["başlık1", "başlık2", "başlık3", "başlık4", "başlık5"]
Açıklama veya ek metin ekleme.`,

  descriptionWriter: `Sen sosyal medya açıklama yazarısın. Platform kurallarını, SEO'yu ve kullanıcı psikolojisini iyi biliyorsun.
Açıklamalar: dikkat çekici hook ile başlamalı, değer sunmalı, CTA ile bitmeli.
Yanıtını Markdown formatında ver.`,

  hookGenerator: `Sen video hook yazma uzmanısın. İzleyiciyi ilk 3 saniyede tutan, bırakmayan açılış cümleleri yazıyorsun.
Her hook için hook tipi (merak, şok, soru, istatistik, hikaye) ve neden işe yaradığını da belirt.
Yanıtını JSON formatında ver.`,

  hashtagExpert: `Sen sosyal medya hashtag stratejistisisin. Platform algoritmalarını ve niche hashtag stratejilerini biliyorsun.
Yanıtını kategorilere ayrılmış JSON formatında ver: { "yuksek": [], "orta": [], "dusuk": [], "niche": [] }`,

  scriptWriter: `Sen video script yazarısın. Hook → İçerik → CTA yapısını iyi biliyorsun.
Scriptler: doğal konuşma dili, net bölümler, platform süresine uygun olmalı.
Her bölümü [HOOK], [IÇERIK], [CTA] etiketleriyle ayır.`,

  viralScoreAnalyst: `Sen sosyal medya içerik analisti ve viral içerik uzmanısın.
İçeriği analiz et ve 1-100 arası puan ver. Her kriter için ayrı puan ve iyileştirme önerisi sun.
Yanıtını JSON formatında ver.`,
}

export function buildTitlePrompt(topic: string, platform: string, tone: ContentTone, keywords?: string): string {
  return `Platform: ${platform}
Konu: ${topic}
Ton: ${tone}
${keywords ? `Anahtar kelimeler: ${keywords}` : ''}

Bu bilgilere göre 5 farklı başlık yaz. Her başlık farklı bir açıdan yaklaşsın (merak, fayda, sayı, soru, şok değeri gibi).`
}

export function buildDescriptionPrompt(
  title: string,
  summary: string,
  platform: Platform,
  audience: string,
  includeCTA: boolean,
  includeHashtags: boolean
): string {
  return `Platform: ${platform}
Başlık: ${title}
Video özeti: ${summary}
Hedef kitle: ${audience}
CTA ekle: ${includeCTA ? 'Evet' : 'Hayır'}
Hashtag ekle: ${includeHashtags ? 'Evet' : 'Hayır'}

Bu videoya uygun bir açıklama yaz. Dikkat çekici bir hook ile başla, içerik değerini anlat${includeCTA ? ', güçlü bir CTA ekle' : ''}${includeHashtags ? ', platforma uygun hashtag seti ekle' : ''}.`
}

export function buildHookPrompt(topic: string, format: string, niche: string): string {
  return `Format: ${format}
Niche: ${niche}
Konu: ${topic}

Bu konuya uygun 5 farklı hook yaz. Her biri farklı bir psikolojik tetikleyici kullansın.
JSON formatı: [{ "hook": "metin", "tip": "merak|soru|şok|istatistik|hikaye", "neden": "kısa açıklama" }]`
}

export function buildHashtagPrompt(topic: string, platform: Platform, niche: string, count: number): string {
  return `Platform: ${platform}
Niche: ${niche}
İçerik konusu: ${topic}
İstenen toplam hashtag: ${count}

Bu içerik için ${platform} platformuna özel hashtag seti oluştur.
Yüksek hacimli (1M+), orta hacimli (100K-1M), düşük hacimli/niche (<100K) olarak grupla.`
}

export function buildScriptPrompt(
  title: string,
  duration: string,
  platform: Platform,
  tone: ContentTone,
  hook?: string
): string {
  return `Başlık: ${title}
Süre: ${duration}
Platform: ${platform}
Ton: ${tone}
${hook ? `Kullanılacak hook: ${hook}` : ''}

Bu video için tam script yaz. [HOOK], [GIRIŞ], [ANA IÇERIK], [SONUÇ], [CTA] bölümleri olsun.
Konuşma dili, doğal, platforma uygun uzunluk.`
}

export function buildViralScorePrompt(title: string, platform: Platform, description?: string, hashtags?: string): string {
  return `Platform: ${platform}
Başlık: ${title}
${description ? `Açıklama: ${description}` : ''}
${hashtags ? `Hashtagler: ${hashtags}` : ''}

Bu içeriği analiz et ve viral potansiyelini değerlendir.
JSON formatı:
{
  "toplam_puan": 0-100,
  "kriterler": {
    "baslik_guc": { "puan": 0-100, "yorum": "" },
    "platform_uyum": { "puan": 0-100, "yorum": "" },
    "seo_guc": { "puan": 0-100, "yorum": "" },
    "merak_faktoru": { "puan": 0-100, "yorum": "" },
    "cta_guc": { "puan": 0-100, "yorum": "" }
  },
  "guclu_yonler": ["...", "..."],
  "iyilestirme_onerileri": ["...", "...", "..."],
  "revize_edilmis_baslik": "..."
}`
}

export const IDEAS_SYSTEM_PROMPT = `Sen içerik stratejisti ve trend araştırmacısısın.
Niche ve platforma göre viral potansiyeli yüksek içerik fikirleri üretiyorsun.
Her fikir için başlık, açıklama ve viral neden içermeli.
Yanıtını JSON array formatında ver.`

export function buildIdeasPrompt(niche: string, platform: string, count: number, style: string): string {
  return `Niche: ${niche}
Platform: ${platform}
İçerik stili: ${style}
İstenen fikir sayısı: ${count}

Bu niche için ${platform}'a özel ${count} adet video/içerik fikri üret. Trend, mevsimsel, evergreen karışımı olsun.
JSON formatı: [{ "baslik": "", "aciklama": "", "tip": "trend|evergreen|mevsimsel", "viral_neden": "", "zorluk": "kolay|orta|zor" }]`
}

export const THUMBNAIL_SYSTEM_PROMPT = `Sen YouTube thumbnail tasarım uzmanı ve görsel pazarlama stratejistisisin.
Tıklanma oranını maksimize eden thumbnail konseptleri üretiyorsun.
Renk psikolojisi, yüz ifadesi, metin yerleşimi ve kontrast konusunda uzmansın.
Yanıtını JSON formatında ver.`

export function buildThumbnailPrompt(title: string, platform: string, niche: string, style: string): string {
  return `Video başlığı: ${title}
Platform: ${platform}
Niche: ${niche}
Stil: ${style}

Bu video için 3 farklı thumbnail konsepti üret. Her biri farklı bir yaklaşım kullansın.
JSON formatı:
[{
  "konsept_adi": "",
  "ana_gorsel": "ana görselin açıklaması",
  "renk_paleti": ["#hex1", "#hex2", "#hex3"],
  "metin_overlay": "thumbnail üzerindeki yazı (varsa)",
  "metin_stili": "font stili ve büyüklük açıklaması",
  "kompozisyon": "görsel düzen açıklaması",
  "klik_nedeni": "neden tıklanır",
  "dikkat_noktasi": "odak noktası nedir"
}]`
}

export const DUBBING_SYSTEM_PROMPT = `Sen profesyonel bir dublaj ve lokalizasyon uzmanısın.
Görevin: verilen içeriği hedef dile çevirmek, seslendirme sanatçısına rehberlik eden notlar eklemek.
Yanıtını her zaman JSON formatında ver.`

export function buildTranslatePrompt(
  content: string,
  sourceLang: string,
  targetLang: string,
  includePronunciation: boolean,
  includeTimingNotes: boolean,
  includeCulturalNotes: boolean
): string {
  return `Kaynak dil: ${sourceLang}
Hedef dil: ${targetLang}
Telaffuz rehberi: ${includePronunciation ? 'Ekle' : 'Ekleme'}
Zamanlama notları: ${includeTimingNotes ? 'Ekle' : 'Ekleme'}
Kültürel uyarlama notları: ${includeCulturalNotes ? 'Ekle' : 'Ekleme'}

İçerik:
${content}

JSON formatı:
{
  "ceviri": "tam çevrilmiş metin",
  "bolumler": [
    {
      "orijinal": "orijinal cümle/paragraf",
      "ceviri": "çevrilmiş hali",
      "telaffuz": "telaffuz rehberi (istenirse)",
      "zamanlama": "yaklaşık süre bilgisi (istenirse)",
      "not": "seslendirme tonu, vurgu, duraklama notları"
    }
  ],
  "kulturel_notlar": ["not1", "not2"],
  "genel_yonerge": "seslendirme sanatçısına genel yönergeler"
}`
}
