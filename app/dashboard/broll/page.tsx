'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

interface BrollShot {
  numara: number
  aciklama: string
  kamera_acisi: string
  hareket: string
  oncelik: string
  stok_footage_alternatifi: string
}

interface BrollResult {
  cekimler: BrollShot[]
}

const priorityStyles: Record<string, string> = {
  yüksek: 'bg-red-500/20 text-red-300 border-red-500/30',
  orta: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  düşük: 'bg-zinc-700 text-zinc-400 border-zinc-600',
}

export default function BrollPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [script, setScript] = useState('')
  const [videoType, setVideoType] = useState('youtube_vlog')
  const [budget, setBudget] = useState('orta')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrollResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!script.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/broll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, videoType, budget, model: selectedModel }),
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
      <TopBar title="B-Roll Planlayıcı" description="Video çekim listesi ve B-roll önerileri oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Script / Senaryo</label>
                <textarea value={script} onChange={(e) => setScript(e.target.value)}
                  placeholder="Video scriptini yapıştır..." rows={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Türü</label>
                <select value={videoType} onChange={(e) => setVideoType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="youtube_vlog">YouTube Vlog</option>
                  <option value="egitim">Eğitim / Tutorial</option>
                  <option value="tanitim">Ürün Tanıtımı</option>
                  <option value="kisa_film">Kısa Film</option>
                  <option value="reels">Reels / Shorts</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Bütçe</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['düşük', 'orta', 'yüksek'].map((b) => (
                    <button key={b} type="button" onClick={() => setBudget(b)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors capitalize',
                        budget === b ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !script.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'B-Roll Listesi Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-3">
                <p className="text-zinc-500 text-xs"><span className="text-violet-400 font-semibold">{result.cekimler?.length}</span> çekim planlandı</p>
                {result.cekimler?.map((shot) => (
                  <div key={shot.numara} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs font-mono w-5">#{shot.numara}</span>
                        <p className="text-zinc-100 text-sm font-medium">{shot.aciklama}</p>
                      </div>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0',
                        priorityStyles[shot.oncelik?.toLowerCase()] || priorityStyles.düşük)}>
                        {shot.oncelik}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="text-zinc-600 text-[10px] font-semibold uppercase mb-0.5">Kamera Açısı</p>
                        <p className="text-zinc-400 text-xs">{shot.kamera_acisi}</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 text-[10px] font-semibold uppercase mb-0.5">Hareket</p>
                        <p className="text-zinc-400 text-xs">{shot.hareket}</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 text-[10px] font-semibold uppercase mb-0.5">Stok Alternatifi</p>
                        <p className="text-zinc-400 text-xs">{shot.stok_footage_alternatifi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Script gir ve B-roll listesi oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
