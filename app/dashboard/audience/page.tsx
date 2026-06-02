'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin'

interface Persona {
  isim: string
  yas: string
  meslek: string
  ilgi_alanlari: string[]
  aci_noktalari: string[]
  hedefler: string[]
  hook_formuller: string[]
}

interface AudienceResult {
  personalar: Persona[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
}

const personaColors = [
  { border: 'border-violet-500/30', bg: 'bg-violet-500/5', accent: 'text-violet-400' },
  { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', accent: 'text-emerald-400' },
  { border: 'border-blue-500/30', bg: 'bg-blue-500/5', accent: 'text-blue-400' },
]

export default function AudiencePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [currentStats, setCurrentStats] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AudienceResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, platform, currentStats, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setActiveTab(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const activePersona = result?.personalar?.[activeTab]
  const colors = personaColors[activeTab] || personaColors[0]

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Kitle Analizi" description="Hedef kitle personaları oluştur" />
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
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Mevcut İstatistikler <span className="text-zinc-600">(opsiyonel)</span></label>
                <textarea value={currentStats} onChange={(e) => setCurrentStats(e.target.value)}
                  placeholder="Abone sayısı, görüntüleme, demografik bilgiler..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Analiz ediliyor...' : 'Persona Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && result.personalar?.length > 0 && (
              <div>
                <div className="flex gap-2 mb-4">
                  {result.personalar.map((p, i) => (
                    <button key={i} onClick={() => setActiveTab(i)}
                      className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-colors',
                        activeTab === i ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {p.isim}
                    </button>
                  ))}
                </div>
                {activePersona && (
                  <div className={cn('rounded-xl border p-5 space-y-4', colors.border, colors.bg)}>
                    <div>
                      <h3 className={cn('text-base font-bold', colors.accent)}>{activePersona.isim}</h3>
                      <p className="text-zinc-400 text-xs mt-0.5">{activePersona.yas} · {activePersona.meslek}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-zinc-800/50 p-3">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">İlgi Alanları</p>
                        <ul className="space-y-1">
                          {activePersona.ilgi_alanlari?.map((item, j) => (
                            <li key={j} className="text-zinc-300 text-xs flex gap-1.5"><span className={colors.accent}>•</span>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-zinc-800/50 p-3">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Acı Noktaları</p>
                        <ul className="space-y-1">
                          {activePersona.aci_noktalari?.map((item, j) => (
                            <li key={j} className="text-zinc-300 text-xs flex gap-1.5"><span className="text-red-400">✕</span>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-lg bg-zinc-800/50 p-3">
                      <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Hedefler</p>
                      <ul className="space-y-1">
                        {activePersona.hedefler?.map((item, j) => (
                          <li key={j} className="text-zinc-300 text-xs flex gap-1.5"><span className="text-emerald-400">✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-zinc-800/50 p-3">
                      <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Hook Formülleri</p>
                      <ul className="space-y-1.5">
                        {activePersona.hook_formuller?.map((hook, j) => (
                          <li key={j} className="text-zinc-300 text-xs italic">"{hook}"</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Niş gir ve kitle personaları oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
