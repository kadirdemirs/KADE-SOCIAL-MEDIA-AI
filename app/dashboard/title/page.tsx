'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { Platform, ContentTone, AIModel } from '@/types'
import { getPlatformLabel, getModelLabel, getModelColor, cn } from '@/lib/utils'
import { COMPARE_MODELS } from '@/lib/ai/models'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'pinterest']
const tones: ContentTone[] = ['bilgilendirici', 'eğlenceli', 'ilham verici', 'dikkat çekici', 'samimi']

interface PlatformResult { platform: Platform; titles: string[]; model: AIModel }

export default function TitlePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic]           = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube'])
  const [tone, setTone]             = useState<ContentTone>('bilgilendirici')
  const [keywords, setKeywords]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [results, setResults]       = useState<PlatformResult[]>([])
  const [error, setError]           = useState('')

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p])

  const generate = async (platform: Platform, model: AIModel): Promise<PlatformResult> => {
    const res = await fetch('/api/generate/title', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, platform, tone, model, keywords }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { platform, titles: data.titles, model: data.model || model }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      const settled = await Promise.allSettled(
        selectedPlatforms.map(p => generate(p, selectedModel))
      )
      const ok = settled
        .filter((r): r is PromiseFulfilledResult<PlatformResult> => r.status === 'fulfilled')
        .map(r => r.value)
      setResults(ok)
    } catch (err) { setError(err instanceof Error ? err.message : 'Hata oluştu') }
    finally { setLoading(false) }
  }

  const handleAskAll = async () => {
    if (!topic.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      const models: AIModel[] = COMPARE_MODELS
      const platform = selectedPlatforms[0]
      const settled = await Promise.allSettled(models.map(m => generate(platform, m)))
      const ok = settled
        .filter((r): r is PromiseFulfilledResult<PlatformResult> => r.status === 'fulfilled')
        .map(r => r.value)
      setResults(ok)
    } catch (err) { setError(err instanceof Error ? err.message : 'Hata oluştu') }
    finally { setLoading(false) }
  }

  const sendToScript = (title: string) => {
    localStorage.setItem('contentai_selected_title', title)
    window.location.href = '/dashboard/script'
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Başlık Üretici" description="SEO odaklı, tıklanabilir video başlıkları üret" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Konusu</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="Örn: Türkiye'de en iyi 10 gizli tatil yeri" rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Platform <span className="text-zinc-600">(çoklu seçim)</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        selectedPlatforms.includes(p)
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ton</label>
                <div className="space-y-1">
                  {tones.map(t => (
                    <button key={t} type="button" onClick={() => setTone(t)}
                      className={cn('w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors capitalize',
                        tone === t ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Anahtar Kelimeler <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <input value={keywords} onChange={e => setKeywords(e.target.value)}
                  placeholder="SEO, viral, tıklanabilir..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>

              <div className="space-y-2">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
                <button type="submit" disabled={loading || !topic.trim()}
                  className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {loading ? 'Üretiliyor...' : `${selectedPlatforms.length} Platforma Başlık Üret`}
                </button>
                <button type="button" onClick={handleAskAll} disabled={loading || !topic.trim()}
                  className="w-full py-2.5 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors">
                  {loading ? 'Yanıtlanıyor...' : '3 Groq Modeline Sor'}
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}

            {results.length > 0 && !loading && (
              <div className={cn('grid gap-4', results.length > 1 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {results.map((r, ri) => (
                  <div key={`${r.platform}-${ri}`} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-300">{getPlatformLabel(r.platform)}</span>
                      <span className={cn('text-xs font-medium', getModelColor(r.model))}>{getModelLabel(r.model)}</span>
                      <span className="text-zinc-600 text-xs">{r.titles.length} başlık</span>
                    </div>
                    {r.titles.map((title, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                        <span className="text-zinc-600 text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                        <p className="flex-1 text-zinc-200 text-sm leading-relaxed">{title}</p>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <CopyButton text={title} />
                          <button onClick={() => sendToScript(title)}
                            className="text-xs px-2 py-1.5 rounded-lg bg-zinc-700 text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors">
                            Script
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konu gir, platform seç ve üret
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
