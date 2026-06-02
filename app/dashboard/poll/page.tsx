'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type Platform = 'youtube' | 'instagram' | 'twitter' | 'linkedin'

interface Poll {
  soru: string
  secenekler: string[]
  takip_sorusu: string
}

interface PollResult {
  anketler: Poll[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
}

export default function PollPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [purpose, setPurpose] = useState('etkileşim')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PollResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, platform, purpose, count, model: selectedModel }),
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

  const optionLetters = ['A', 'B', 'C', 'D']
  const optionColors = [
    'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ]

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Anket Üretici" description="Etkileşim artıran anketler oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niş / Alan</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="Fitness, teknoloji, yemek..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
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
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Amaç</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="etkileşim">Etkileşim Artırmak</option>
                  <option value="araştırma">Kitle Araştırması</option>
                  <option value="eğlence">Eğlence</option>
                  <option value="içerik_fikri">İçerik Fikri Toplamak</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Anket Sayısı: <span className="text-violet-400">{count}</span></label>
                <input type="range" min={3} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-zinc-600 text-xs mt-0.5">
                  <span>3</span><span>10</span>
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Anket Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.anketler?.map((poll, i) => (
                  <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
                    <p className="text-zinc-100 font-semibold text-sm mb-3">{poll.soru}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {poll.secenekler?.map((opt, j) => (
                        <div key={j} className={cn('rounded-lg border p-2.5 flex items-center gap-2', optionColors[j] || optionColors[0])}>
                          <span className="font-bold text-xs">{optionLetters[j]}</span>
                          <span className="text-xs">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {poll.takip_sorusu && (
                      <div className="border-t border-zinc-700/50 pt-3">
                        <p className="text-zinc-500 text-xs">Takip sorusu:</p>
                        <p className="text-zinc-400 text-xs mt-0.5 italic">{poll.takip_sorusu}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Niş ve platform seçerek anket oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
