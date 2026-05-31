'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { Platform, ContentTone, AIModel } from '@/types'
import { getPlatformLabel, getModelLabel, getModelColor, cn } from '@/lib/utils'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'pinterest']
const tones: ContentTone[] = ['bilgilendirici', 'eğlenceli', 'ilham verici', 'dikkat çekici', 'samimi']

interface TitleResult {
  titles: string[]
  model: AIModel
}

export default function TitlePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [tone, setTone] = useState<ContentTone>('bilgilendirici')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [allLoading, setAllLoading] = useState(false)
  const [result, setResult] = useState<TitleResult | null>(null)
  const [allResults, setAllResults] = useState<TitleResult[]>([])
  const [error, setError] = useState('')

  const generate = async (model: AIModel = selectedModel): Promise<TitleResult> => {
    const res = await fetch('/api/generate/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, platform, tone, model, keywords }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { titles: data.titles, model }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setAllResults([])
    try {
      const r = await generate(selectedModel)
      setResult(r)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleAskAll = async () => {
    if (!topic.trim()) return
    setAllLoading(true)
    setError('')
    setResult(null)
    try {
      const [c, g, m] = await Promise.allSettled([
        generate('claude'),
        generate('gpt4o'),
        generate('gemini'),
      ])
      const results: TitleResult[] = []
      if (c.status === 'fulfilled') results.push(c.value)
      if (g.status === 'fulfilled') results.push(g.value)
      if (m.status === 'fulfilled') results.push(m.value)
      setAllResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setAllLoading(false)
    }
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
          {/* Form */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Konusu</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Türkiye'de en iyi 10 gizli tatil yeri"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={cn(
                        'py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        platform === p
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                      )}
                    >
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ton</label>
                <div className="space-y-1">
                  {tones.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={cn(
                        'w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors capitalize',
                        tone === t
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Anahtar Kelimeler <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="SEO, viral, tıklanabilir..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-2">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Üretiliyor...' : 'Başlık Üret'}
                </button>
                <button
                  type="button"
                  onClick={handleAskAll}
                  disabled={allLoading || !topic.trim()}
                  className="w-full py-2.5 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {allLoading ? 'Tüm modeller yanıtlıyor...' : 'Tüm Modellere Sor'}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            {loading && <LoadingState model={selectedModel} />}
            {allLoading && (
              <div className="space-y-2">
                <LoadingState model="claude" />
                <LoadingState model="gpt4o" />
                <LoadingState model="gemini" />
              </div>
            )}

            {result && !allLoading && (
              <div className="space-y-3">
                <p className={cn('text-xs font-medium', getModelColor(result.model))}>
                  {getModelLabel(result.model)} — {result.titles.length} başlık
                </p>
                {result.titles.map((title, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4"
                  >
                    <span className="text-zinc-600 text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                    <p className="flex-1 text-zinc-200 text-sm leading-relaxed">{title}</p>
                    <div className="flex gap-2 flex-shrink-0">
                      <CopyButton text={title} />
                      <button
                        onClick={() => sendToScript(title)}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-700 text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                      >
                        Script'e Gönder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allResults.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {allResults.map((r) => (
                  <div key={r.model} className="space-y-2">
                    <p className={cn('text-xs font-medium', getModelColor(r.model))}>
                      {getModelLabel(r.model)}
                    </p>
                    {r.titles.map((title, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3 space-y-2"
                      >
                        <p className="text-zinc-200 text-xs leading-relaxed">{title}</p>
                        <CopyButton text={title} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {!loading && !allLoading && !result && allResults.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konuyu gir ve başlık üret butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
