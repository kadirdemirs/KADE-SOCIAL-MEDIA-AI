'use client'
import { useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import { Download, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react'

const styles = [
  { id: 'cinematic', label: 'Sinematik', prompt: 'cinematic photo, dramatic lighting, 8k, professional photography' },
  { id: 'minimalist', label: 'Minimalist', prompt: 'minimalist clean design, white background, bold text space, modern' },
  { id: 'bold', label: 'Cesur / Bold', prompt: 'bold vibrant colors, high contrast, eye-catching, thumbnail style' },
  { id: 'tech', label: 'Teknoloji', prompt: 'futuristic tech background, neon lights, dark theme, digital art' },
  { id: 'lifestyle', label: 'Lifestyle', prompt: 'bright lifestyle photography, natural light, authentic, warm tones' },
  { id: 'cartoon', label: 'Çizgi/İllüstrasyon', prompt: 'digital illustration, colorful cartoon style, flat design' },
]

const ratios = [
  { id: '16:9', label: 'YouTube (16:9)', w: 1280, h: 720 },
  { id: '9:16', label: 'Reels/TikTok (9:16)', w: 720, h: 1280 },
  { id: '1:1', label: 'Kare (1:1)', w: 1080, h: 1080 },
  { id: '4:5', label: 'Instagram (4:5)', w: 1080, h: 1350 },
]

export default function AiThumbnailPage() {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('cinematic')
  const [ratio, setRatio] = useState('16:9')
  const [extraPrompt, setExtraPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [seed, setSeed] = useState(Math.floor(Math.random() * 9999))

  const selectedStyle = styles.find(s => s.id === style)
  const selectedRatio = ratios.find(r => r.id === ratio)

  const generate = () => {
    if (!topic.trim()) return
    setLoading(true)
    setImageUrl(null)
    const newSeed = Math.floor(Math.random() * 99999)
    setSeed(newSeed)

    const fullPrompt = [
      `youtube thumbnail, ${topic}`,
      selectedStyle?.prompt,
      extraPrompt,
      'no text overlay, high quality, professional'
    ].filter(Boolean).join(', ')

    const encoded = encodeURIComponent(fullPrompt)
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${selectedRatio?.w}&height=${selectedRatio?.h}&seed=${newSeed}&nologo=true&model=flux`

    // Preload image
    const img = new window.Image()
    img.src = url
    img.onload = () => { setImageUrl(url); setLoading(false) }
    img.onerror = () => { setLoading(false) }
  }

  const download = async () => {
    if (!imageUrl) return
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thumbnail_${topic.slice(0, 20).replace(/\s+/g, '_')}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="AI Thumbnail Üretici" description="Pollinations.ai ile ücretsiz thumbnail görseli üret" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-xs font-medium">✦ 100% Ücretsiz — API key gerekmez</span>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Thumbnail Konusu</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                placeholder="Örn: Yapay zeka ile para kazanmak, laptopla çalışan genç..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Stil</label>
              <div className="grid grid-cols-2 gap-1.5">
                {styles.map((s) => (
                  <button key={s.id} type="button" onClick={() => setStyle(s.id)}
                    className={cn('py-1.5 rounded-lg text-xs transition-colors border text-left px-2',
                      style === s.id ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Boyut / Oran</label>
              <div className="space-y-1.5">
                {ratios.map((r) => (
                  <button key={r.id} type="button" onClick={() => setRatio(r.id)}
                    className={cn('w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors border',
                      ratio === r.id ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                    {r.label} <span className="text-zinc-600 ml-1">{r.w}×{r.h}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ek Prompt <span className="text-zinc-600">(opsiyonel)</span></label>
              <input value={extraPrompt} onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="mavi arka plan, güneş batımı, gece..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
            </div>

            <button onClick={generate} disabled={loading || !topic.trim()}
              className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Üretiliyor...</> : <><ImageIcon className="w-4 h-4" /> Thumbnail Üret</>}
            </button>
          </div>

          <div className="flex-1 min-w-0 flex flex-col items-center justify-start gap-4">
            {imageUrl && (
              <>
                <img src={imageUrl} alt="Generated thumbnail" className="rounded-xl border border-zinc-700/50 max-w-full shadow-xl" />
                <div className="flex gap-2">
                  <button onClick={generate} disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors border border-zinc-700">
                    <RefreshCw className="w-3.5 h-3.5" /> Yeniden Üret
                  </button>
                  <button onClick={download}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm hover:bg-violet-600 transition-colors">
                    <Download className="w-3.5 h-3.5" /> İndir
                  </button>
                </div>
              </>
            )}
            {loading && (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-zinc-500 text-sm">Görsel üretiliyor... (~5-15 sn)</p>
                <p className="text-zinc-700 text-xs">Pollinations.ai Flux modeli çalışıyor</p>
              </div>
            )}
            {!imageUrl && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <ImageIcon className="w-12 h-12 text-zinc-800" />
                <p className="text-zinc-600 text-sm">Konu gir ve thumbnail üret</p>
                <p className="text-zinc-700 text-xs">Pollinations.ai · Flux · Tamamen Ücretsiz</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
