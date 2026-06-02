'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { Platform } from '@/types'
import { getPlatformLabel, cn } from '@/lib/utils'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'linkedin']
const styles = ['dikkat çekici', 'minimalist', 'merak uyandıran', 'renkli & canlı', 'profesyonel', 'duygusal', 'dramatic', 'temiz & modern']

interface ThumbnailConcept {
  konsept_adi: string; ana_gorsel: string; renk_paleti: string[]
  metin_overlay: string; metin_stili: string; kompozisyon: string
  klik_nedeni: string; dikkat_noktasi: string
}

interface PlatformResult { platform: Platform; style: string; concepts: ThumbnailConcept[] }

export default function ThumbnailPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle]       = useState('')
  const [niche, setNiche]       = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube'])
  const [selectedStyles, setSelectedStyles]       = useState<string[]>(['dikkat çekici'])
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState<PlatformResult[]>([])
  const [error, setError]       = useState('')

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p])

  const toggleStyle = (s: string) =>
    setSelectedStyles(prev => prev.includes(s) ? (prev.length > 1 ? prev.filter(x => x !== s) : prev) : [...prev, s])

  const generateFor = async (platform: Platform, style: string): Promise<PlatformResult> => {
    const res = await fetch('/api/generate/thumbnail', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, platform, niche, model: selectedModel, style }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { platform, style, concepts: data.concepts }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !niche.trim()) return
    setLoading(true); setError(''); setResults([])
    const combos = selectedPlatforms.flatMap(p => selectedStyles.map(s => ({ p, s })))
    try {
      const settled = await Promise.allSettled(combos.map(({ p, s }) => generateFor(p, s)))
      setResults(settled.filter((r): r is PromiseFulfilledResult<PlatformResult> => r.status === 'fulfilled').map(r => r.value))
    } catch (err) { setError(err instanceof Error ? err.message : 'Hata') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Thumbnail Konsepti" description="Platform ve stile göre thumbnail fikirleri" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 min-h-full">
          <div className="w-72 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Thumbnail için başlık"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niche</label>
                <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="teknoloji, fitness, finans..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-2">
                  Platform <span className="text-zinc-600">(çoklu)</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {platforms.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={cn('py-1.5 rounded-lg text-xs font-medium transition-colors border text-center',
                        selectedPlatforms.includes(p)
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-2">
                  Stil <span className="text-zinc-600">(çoklu)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {styles.map(s => (
                    <button key={s} type="button" onClick={() => toggleStyle(s)}
                      className={cn('py-1 px-2.5 rounded-full text-xs font-medium transition-colors',
                        selectedStyles.includes(s)
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim() || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Üretiliyor...' : `${selectedPlatforms.length}P × ${selectedStyles.length}S = ${selectedPlatforms.length * selectedStyles.length} Konsept`}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-6">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}

            {results.map((r, ri) => (
              <div key={ri}>
                <p className="text-zinc-300 text-xs font-bold uppercase tracking-wider mb-3">
                  {getPlatformLabel(r.platform)} · {r.style}
                </p>
                <div className="space-y-4">
                  {r.concepts.map((c, i) => (
                    <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-600 text-xs">#{i + 1}</span>
                          <h3 className="text-zinc-200 font-medium text-sm">{c.konsept_adi}</h3>
                        </div>
                        <CopyButton text={`${c.konsept_adi}\nGörsel: ${c.ana_gorsel}\nMetin: ${c.metin_overlay}\nKomposizyon: ${c.kompozisyon}`} />
                      </div>
                      <div className="p-5 grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1">Ana Görsel</p>
                            <p className="text-zinc-300 text-sm leading-relaxed">{c.ana_gorsel}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1">Metin Overlay</p>
                            <p className="text-zinc-100 text-sm font-semibold">{c.metin_overlay || '(Metin yok)'}</p>
                            <p className="text-zinc-500 text-xs mt-0.5">{c.metin_stili}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1">Kompozisyon</p>
                            <p className="text-zinc-300 text-sm leading-relaxed">{c.kompozisyon}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-zinc-500 text-xs font-medium mb-2">Renk Paleti</p>
                            <div className="flex gap-2 flex-wrap">
                              {(c.renk_paleti || []).map((hex, hi) => (
                                <div key={hi} className="flex items-center gap-1.5 cursor-pointer group"
                                  onClick={() => navigator.clipboard.writeText(hex)}>
                                  <div className="w-8 h-8 rounded-lg border border-zinc-700 shadow-sm" style={{ backgroundColor: hex }} />
                                  <span className="text-zinc-500 text-xs group-hover:text-zinc-300">{hex}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-medium mb-1">Dikkat Noktası</p>
                            <p className="text-zinc-300 text-sm leading-relaxed">{c.dikkat_noktasi}</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                            <p className="text-emerald-400 text-xs font-medium mb-1">Neden Tıklanır?</p>
                            <p className="text-zinc-300 text-xs leading-relaxed">{c.klik_nedeni}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!loading && results.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Başlık ve niche gir, konsept üret
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
