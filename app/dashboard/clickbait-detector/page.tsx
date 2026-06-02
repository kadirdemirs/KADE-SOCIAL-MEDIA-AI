'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn, copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin'

interface ClickbaitResult {
  clickbait_skoru: number
  seviye: string
  sorunlar: string[]
  alternatifler: string[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'
  const barColor = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <span className={cn('text-4xl font-bold', color)}>{score}</span>
        <p className="text-zinc-500 text-xs mt-0.5">/ 100</p>
      </div>
      <div className="flex-1">
        <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${score}%` }} />
        </div>
        <div className="flex justify-between text-zinc-600 text-[10px] mt-0.5">
          <span>Temiz</span><span>Orta</span><span>Clickbait</span>
        </div>
      </div>
    </div>
  )
}

export default function ClickbaitDetectorPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClickbaitResult | null>(null)
  const [error, setError] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/clickbait-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, platform, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const seviyeColor = (seviye: string) => {
    if (seviye?.toLowerCase().includes('yüksek') || seviye?.toLowerCase().includes('çok')) return 'bg-red-500/20 text-red-300 border-red-500/30'
    if (seviye?.toLowerCase().includes('orta')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Clickbait Dedektörü" description="Başlığının clickbait seviyesini ölç ve düzelt" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Başlık</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Analiz edilecek başlık..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(platformLabels) as Platform[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {platformLabels[p]}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Analiz ediliyor...' : 'Analiz Et'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Clickbait Skoru</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', seviyeColor(result.seviye))}>
                      {result.seviye}
                    </span>
                  </div>
                  <ScoreGauge score={result.clickbait_skoru} />
                </div>
                {result.sorunlar?.length > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-red-400 text-xs font-semibold mb-2">Tespit Edilen Sorunlar</p>
                    <ul className="space-y-1">
                      {result.sorunlar.map((sorun, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-red-400">✕</span>{sorun}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.alternatifler?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-2">Alternatif Başlıklar</p>
                    <div className="space-y-2">
                      {result.alternatifler.map((alt, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 bg-zinc-800/50 rounded-lg px-3 py-2">
                          <p className="text-zinc-200 text-sm flex-1">{alt}</p>
                          <button onClick={() => handleCopy(alt, i)} className="text-zinc-500 hover:text-emerald-400 transition-colors flex-shrink-0">
                            {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Başlığı gir ve clickbait analizi yap
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
