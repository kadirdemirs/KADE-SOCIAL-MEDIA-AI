'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'

interface Scene {
  numara: number
  zaman: string
  script_parcasi: string
  gorsel_aciklama: string
  kamera_acisi: string
  gecis_efekti: string
}

interface StoryboardResult {
  sahneler: Scene[]
}

export default function StoryboardPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [script, setScript] = useState('')
  const [videoStyle, setVideoStyle] = useState('youtube_vlog')
  const [duration, setDuration] = useState('5-10')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StoryboardResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!script.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, videoStyle, duration, model: selectedModel }),
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
      <TopBar title="Storyboard Üretici" description="Scriptinden sahne sahne çekim planı oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Script / Senaryo</label>
                <textarea value={script} onChange={(e) => setScript(e.target.value)}
                  placeholder="Video scriptini yapıştır..." rows={9}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Stili</label>
                <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="youtube_vlog">YouTube Vlog</option>
                  <option value="ders">Eğitim / Ders</option>
                  <option value="tanitim">Ürün Tanıtımı</option>
                  <option value="kisa_film">Kısa Film</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Süre (dakika)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="1-3">1-3 dakika</option>
                  <option value="5-10">5-10 dakika</option>
                  <option value="10-20">10-20 dakika</option>
                  <option value="20+">20+ dakika</option>
                </select>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !script.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Storyboard Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-3">
                <p className="text-zinc-500 text-xs"><span className="text-violet-400 font-semibold">{result.sahneler?.length}</span> sahne planlandı</p>
                {result.sahneler?.map((scene) => (
                  <div key={scene.numara} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-300 text-xs font-bold">{scene.numara}</span>
                      </div>
                      <span className="text-zinc-500 text-xs font-mono">{scene.zaman}</span>
                      <span className="text-zinc-600 text-xs ml-auto">Geçiş: {scene.gecis_efekti}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-zinc-600 text-[10px] font-semibold uppercase mb-1">Script</p>
                        <p className="text-zinc-300 text-xs leading-relaxed italic">"{scene.script_parcasi}"</p>
                      </div>
                      <div>
                        <p className="text-zinc-600 text-[10px] font-semibold uppercase mb-1">Görsel</p>
                        <p className="text-zinc-300 text-xs leading-relaxed">{scene.gorsel_aciklama}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-700/30">
                      <span className="text-zinc-600 text-[10px] font-semibold">Kamera: </span>
                      <span className="text-zinc-400 text-[10px]">{scene.kamera_acisi}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Script gir ve storyboard oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
