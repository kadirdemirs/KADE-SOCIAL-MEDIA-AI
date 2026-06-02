'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin'

interface ContentPillar {
  ad: string
  aciklama: string
  yuzde: number
  icerik_fikirleri: string[]
  formatlar: string[]
  ornek_basliklar: string[]
  renk: string
}

interface PillarResult {
  sutunlar: ContentPillar[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
}

const pillarColors = [
  { border: 'border-violet-500/30', bg: 'bg-violet-500/10', bar: 'bg-violet-500', text: 'text-violet-300' },
  { border: 'border-blue-500/30', bg: 'bg-blue-500/10', bar: 'bg-blue-500', text: 'text-blue-300' },
  { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', text: 'text-emerald-300' },
  { border: 'border-amber-500/30', bg: 'bg-amber-500/10', bar: 'bg-amber-500', text: 'text-amber-300' },
  { border: 'border-pink-500/30', bg: 'bg-pink-500/10', bar: 'bg-pink-500', text: 'text-pink-300' },
]

export default function PillarPlannerPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [niche, setNiche] = useState('')
  const [audience, setAudience] = useState('')
  const [goals, setGoals] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PillarResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/pillar-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, audience, goals, platform, model: selectedModel }),
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

  return (
    <div className="flex flex-col h-full">
      <TopBar title="İçerik Sütunları" description="Stratejik içerik sütunları ve kategoriler oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niş / Alan</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="Kanal veya içerik alanın..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Kitle</label>
                <input value={audience} onChange={(e) => setAudience(e.target.value)}
                  placeholder="Kitleni tanımla..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedefler</label>
                <input value={goals} onChange={(e) => setGoals(e.target.value)}
                  placeholder="Marka bilinirliği, satış, etkileşim..."
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
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Sütunları Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.sutunlar?.map((pillar, i) => {
                  const colors = pillarColors[i % pillarColors.length]
                  return (
                    <div key={i} className={cn('rounded-xl border p-5', colors.border, colors.bg)}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className={cn('font-bold text-sm', colors.text)}>{pillar.ad}</h3>
                          <p className="text-zinc-400 text-xs mt-0.5">{pillar.aciklama}</p>
                        </div>
                        <div className="text-right">
                          <span className={cn('text-lg font-bold', colors.text)}>{pillar.yuzde}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-700 rounded-full mb-3 overflow-hidden">
                        <div className={cn('h-full rounded-full', colors.bar)} style={{ width: `${pillar.yuzde}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1">İçerik Fikirleri</p>
                          <ul className="space-y-0.5">
                            {pillar.icerik_fikirleri?.slice(0, 3).map((idea, j) => (
                              <li key={j} className="text-zinc-400 text-[10px]">• {idea}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Formatlar</p>
                          <ul className="space-y-0.5">
                            {pillar.formatlar?.map((fmt, j) => (
                              <li key={j} className="text-zinc-400 text-[10px]">• {fmt}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Örnek Başlıklar</p>
                          <ul className="space-y-0.5">
                            {pillar.ornek_basliklar?.slice(0, 3).map((title, j) => (
                              <li key={j} className="text-zinc-400 text-[10px]">• {title}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Niş ve hedefleri gir, içerik sütunlarını oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
