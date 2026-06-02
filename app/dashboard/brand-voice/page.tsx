'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'

interface BrandVoiceResult {
  marka_sesi: Record<string, string>
  platform_tonlari: Record<string, string>
  icerik_ornekleri: { iyi: string; kotu: string }[]
  tutarlilik_ipuclari: string[]
}

export default function BrandVoicePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('')
  const [values, setValues] = useState('')
  const [sampleContent, setSampleContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrandVoiceResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/brand-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, niche, values, sampleContent, model: selectedModel }),
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
      <TopBar title="Marka Sesi" description="Marka kimliği ve ton rehberi oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Marka Adı</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Marka veya kanal adı..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niş / Sektör</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="Teknoloji, moda, finans..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Marka Değerleri</label>
                <textarea value={values} onChange={(e) => setValues(e.target.value)}
                  placeholder="Güven, yenilik, sürdürülebilirlik..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Örnek İçerik <span className="text-zinc-600">(opsiyonel)</span></label>
                <textarea value={sampleContent} onChange={(e) => setSampleContent(e.target.value)}
                  placeholder="Mevcut içeriklerinden örnekler yapıştır..." rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !name.trim() || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Marka Sesi Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.marka_sesi && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">Marka Sesi</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.marka_sesi).map(([key, val]) => (
                        <div key={key} className="bg-zinc-800/50 rounded-lg p-2.5">
                          <p className="text-zinc-500 text-[10px] font-semibold capitalize mb-0.5">{key.replace(/_/g, ' ')}</p>
                          <p className="text-zinc-200 text-xs">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.platform_tonlari && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Platform Tonları</p>
                    <div className="space-y-2">
                      {Object.entries(result.platform_tonlari).map(([platform, ton]) => (
                        <div key={platform} className="flex gap-3 items-start">
                          <span className="text-violet-400 text-xs font-semibold w-20 flex-shrink-0 capitalize">{platform}</span>
                          <span className="text-zinc-300 text-xs leading-relaxed">{ton}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.icerik_ornekleri?.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">İçerik Örnekleri</p>
                    <div className="space-y-3">
                      {result.icerik_ornekleri.map((ex, i) => (
                        <div key={i} className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                            <p className="text-emerald-400 text-[10px] font-semibold mb-1">✓ İyi</p>
                            <p className="text-zinc-300 text-xs">{ex.iyi}</p>
                          </div>
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5">
                            <p className="text-red-400 text-[10px] font-semibold mb-1">✕ Kötü</p>
                            <p className="text-zinc-300 text-xs">{ex.kotu}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.tutarlilik_ipuclari?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Tutarlılık İpuçları</p>
                    <ul className="space-y-1">
                      {result.tutarlilik_ipuclari.map((tip, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-amber-400">→</span>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Marka bilgilerini gir ve ses rehberi oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
