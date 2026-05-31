# ContentAI Studio

Claude + GPT-4o + Gemini destekli sosyal medya içerik üretim platformu.

## Özellikler

- **Başlık Üretici** — SEO odaklı, tıklanabilir YouTube ve sosyal medya başlıkları
- **Video Açıklama** — Platform uyumlu, CTA içeren açıklamalar
- **Hook Jeneratörü** — İlk 3 saniyede izleyiciyi tutan açılış cümleleri
- **Script Yazarı** — Hook → İçerik → CTA yapısında tam video scripti
- **Hashtag AI** — Platform ve niche'e özel hashtag stratejisi
- **Viral Skor** — İçerik viral potansiyelini 5 kriterde analiz
- **İçerik Dönüştür** — Bir içeriği tüm platformlara uyarla
- **İçerik Takvimi** — Yayın planı oluştur ve takip et

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Ortam değişkenlerini ayarla

`.env.local.example` dosyasını `.env.local` olarak kopyala ve API anahtarlarını doldur:

```bash
cp .env.local.example .env.local
```

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### API Key'leri Nereden Alınır?

| Servis | URL |
|--------|-----|
| Anthropic (Claude) | https://console.anthropic.com |
| OpenAI (GPT-4o) | https://platform.openai.com/api-keys |
| Google (Gemini) | https://aistudio.google.com/apikey |
| Supabase | https://supabase.com/dashboard |

### 3. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK** (`@anthropic-ai/sdk`)
- **OpenAI SDK** (`openai`)
- **Google Generative AI SDK** (`@google/generative-ai`)
- **Supabase** (auth + db — ileride kullanım için hazır)
- **Radix UI** + **lucide-react**

## Klasör Yapısı

```
app/
  api/generate/     — AI API route'ları (title, description, hook, hashtag, script, viral-score)
  dashboard/        — Araç sayfaları
components/
  layout/           — Sidebar, TopBar, ModelSelector
  ui/               — CopyButton, ResultCard, LoadingState, PlatformBadge, ToolForm
lib/
  ai/
    provider.ts     — Tüm LLM çağrıları buradan geçer (Claude / GPT-4o / Gemini)
    prompts.ts      — Sistem promptları ve prompt builder'lar
  context/
    ModelContext.tsx — Seçili model state'i
  utils.ts          — cn(), yardımcı fonksiyonlar
types/
  index.ts          — Tüm TypeScript tipleri
```

## Geliştirme

```bash
npm run dev     # geliştirme sunucusu
npm run build   # production build
npm run lint    # ESLint kontrolü
```
