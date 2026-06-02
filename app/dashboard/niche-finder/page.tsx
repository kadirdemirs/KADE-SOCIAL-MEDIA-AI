'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'blog'

interface Niche {
  ad: string
  aciklama: string
  rekabet_seviyesi: number
  potansiyel_seviyesi: number
  para_kazanma_yollari: string[]
  icerik_fikirleri: string[]
  baslamak_icin_aksiyonlar: string[]
}

interface NicheResult {
  nicheler: Niche[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  blog: 'Blog',
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function NicheFinderPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [interests, setInterests] = useState('')
  const [skills, setSkills] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [monetizationGoal, setMonetizationGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NicheResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!interests.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/niche-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, skills, platform, monetizationGoal, model: selectedModel }),
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
      <TopBar title="Niş Bulucu" description="Sana özel karlı niş fırsatları keşfet" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">İlgi Alanları</label>
                <textarea value={interests} onChange={(e) => setInterests(e.target.value)}
                  placeholder="Neleri seviyorsun? Hobi, merak..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Beceriler / Uzmanlıklar</label>
                <textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                  placeholder="Nede iyisin? Profesyonel beceriler..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
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
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Para Kazanma Hedefi</label>
                <input value={monetizationGoal} onChange={(e) => setMonetizationGoal(e.target.value)}
                  placeholder="Aylık 5000₺, tam zamanlı gelir..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !interests.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Analiz ediliyor...' : 'Niş Bul'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.nicheler?.map((niche, i) => (
                  <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-zinc-500 text-xs font-medium">#{i + 1}</span>
                        <h3 className="text-zinc-100 font-bold text-base">{niche.ad}</h3>
                        <p className="text-zinc-400 text-xs mt-0.5">{niche.aciklama}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-500 text-xs">Rekabet</span>
                          <span className="text-red-400 text-xs font-semibold">{niche.rekabet_seviyesi}/100</span>
                        </div>
                        <ScoreBar value={niche.rekabet_seviyesi} color="bg-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-500 text-xs">Potansiyel</span>
                          <span className="text-emerald-400 text-xs font-semibold">{niche.potansiyel_seviyesi}/100</span>
                        </div>
                        <ScoreBar value={niche.potansiyel_seviyesi} color="bg-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-zinc-900/50 p-2.5">
                        <p className="text-emerald-400 text-[10px] font-semibold mb-1">Para Kazanma</p>
                        <ul className="space-y-0.5">
                          {niche.para_kazanma_yollari?.slice(0, 3).map((way, j) => (
                            <li key={j} className="text-zinc-400 text-[10px]">• {way}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-zinc-900/50 p-2.5">
                        <p className="text-violet-400 text-[10px] font-semibold mb-1">İçerik Fikirleri</p>
                        <ul className="space-y-0.5">
                          {niche.icerik_fikirleri?.slice(0, 3).map((idea, j) => (
                            <li key={j} className="text-zinc-400 text-[10px]">• {idea}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-zinc-900/50 p-2.5">
                        <p className="text-amber-400 text-[10px] font-semibold mb-1">İlk Adımlar</p>
                        <ul className="space-y-0.5">
                          {niche.baslamak_icin_aksiyonlar?.slice(0, 3).map((action, j) => (
                            <li key={j} className="text-zinc-400 text-[10px]">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                İlgi alanları ve becerileri gir, niş bul
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
