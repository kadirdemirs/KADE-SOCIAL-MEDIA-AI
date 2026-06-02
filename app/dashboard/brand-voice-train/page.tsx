'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface BrandVoiceTrainResult {
  tespit_edilen_ses: Record<string, string>
  karakteristik_ozellikler: string[]
  sikca_kullanilan_ifadeler: string[]
  kacinilan_ifadeler: string[]
  yeni_icerik_rehberi: string
  test_prompt: string
}

export default function BrandVoiceTrainPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [brandName, setBrandName] = useState('')
  const [samples, setSamples] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrandVoiceTrainResult | null>(null)
  const [error, setError] = useState('')
  const [promptCopied, setPromptCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandName.trim() || !samples.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/brand-voice-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, samples, model: selectedModel }),
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
      <TopBar title="Marka Sesi Eğitici" description="Örnek içeriklerinden marka sesini analiz et ve rehber oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Marka Adı</label>
                <input value={brandName} onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Marka veya kanal adı..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Örnek İçerikler <span className="text-zinc-600">(3-5 örnek yapıştır)</span>
                </label>
                <textarea value={samples} onChange={(e) => setSamples(e.target.value)}
                  placeholder="Daha önce yazdığın içerikleri buraya yapıştır. Her örneği boş satırla ayır...

Örnek 1: ...

Örnek 2: ...

Örnek 3: ..." rows={12}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !brandName.trim() || !samples.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Analiz ediliyor...' : 'Sesi Eğit'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.tespit_edilen_ses && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">Tespit Edilen Ses</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.tespit_edilen_ses).map(([key, val]) => (
                        <div key={key} className="bg-zinc-800/50 rounded-lg p-2.5">
                          <p className="text-zinc-500 text-[10px] font-semibold capitalize mb-0.5">{key.replace(/_/g, ' ')}</p>
                          <p className="text-zinc-200 text-xs">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {result.karakteristik_ozellikler?.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Karakteristik Özellikler</p>
                      <ul className="space-y-1">
                        {result.karakteristik_ozellikler.map((item, i) => (
                          <li key={i} className="text-zinc-300 text-[10px] flex gap-1.5"><span className="text-emerald-400">✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.sikca_kullanilan_ifadeler?.length > 0 && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                      <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Sık Kullanılan İfadeler</p>
                      <ul className="space-y-1">
                        {result.sikca_kullanilan_ifadeler.map((item, i) => (
                          <li key={i} className="text-zinc-300 text-[10px]">"{item}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.kacinilan_ifadeler?.length > 0 && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                      <p className="text-red-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Kaçınılan İfadeler</p>
                      <ul className="space-y-1">
                        {result.kacinilan_ifadeler.map((item, i) => (
                          <li key={i} className="text-zinc-300 text-[10px] flex gap-1.5"><span className="text-red-400">✕</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {result.yeni_icerik_rehberi && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold mb-2">Yeni İçerik Rehberi</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{result.yeni_icerik_rehberi}</p>
                  </div>
                )}
                {result.test_prompt && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-amber-400 text-xs font-semibold">Test Prompt (AI için)</p>
                      <button onClick={async () => { await copyToClipboard(result.test_prompt); setPromptCopied(true); setTimeout(() => setPromptCopied(false), 2000) }}
                        className="text-zinc-500 hover:text-amber-400 transition-colors">
                        {promptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed font-mono bg-zinc-900/50 rounded-lg p-3">{result.test_prompt}</p>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Örnek içerikler yapıştır ve marka sesini analiz et
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
