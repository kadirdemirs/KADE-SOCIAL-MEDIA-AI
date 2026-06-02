'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface SponsorResult {
  gecis_cumlesi: string
  ana_script: string
  cta: string
  kapat_cumlesi: string
  alternatif_gecis: string
  sure_tahmini: string
  ipuclari: string[]
}

export default function SponsorScriptPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [brand, setBrand] = useState('')
  const [product, setProduct] = useState('')
  const [channel, setChannel] = useState('')
  const [duration, setDuration] = useState('60sn')
  const [keyPoints, setKeyPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SponsorResult | null>(null)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand.trim() || !product.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/sponsor-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, product, channel, duration, keyPoints, model: selectedModel }),
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
      <TopBar title="Sponsor Script" description="Sponsor geçiş ve okuma metni oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Marka Adı</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)}
                  placeholder="Sponsor marka adı..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ürün / Hizmet</label>
                <input value={product} onChange={(e) => setProduct(e.target.value)}
                  placeholder="Tanıtılacak ürün veya hizmet..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kanal / Niş</label>
                <input value={channel} onChange={(e) => setChannel(e.target.value)}
                  placeholder="Kanalın konusu veya niş..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Süre</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="30sn">30 saniye</option>
                  <option value="45sn">45 saniye</option>
                  <option value="60sn">60 saniye</option>
                  <option value="90sn">90 saniye</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Önemli Noktalar <span className="text-zinc-600">(opsiyonel)</span></label>
                <textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="Vurgulanması gereken özellikler..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !brand.trim() || !product.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Script Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Geçiş Cümlesi', key: 'gecis_cumlesi', value: result.gecis_cumlesi },
                    { label: 'Alternatif Geçiş', key: 'alt_gecis', value: result.alternatif_gecis },
                    { label: 'CTA', key: 'cta', value: result.cta },
                    { label: 'Kapanış Cümlesi', key: 'kapat', value: result.kapat_cumlesi },
                  ].map(({ label, key, value }) => (
                    <div key={key} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-zinc-400 text-xs font-semibold">{label}</p>
                        <button onClick={() => handleCopy(value, key)} className="text-zinc-500 hover:text-violet-400 transition-colors">
                          {copiedField === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-zinc-200 text-sm leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Ana Script</p>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 text-xs">{result.sure_tahmini}</span>
                      <button onClick={() => handleCopy(result.ana_script, 'ana')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                        {copiedField === 'ana' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{result.ana_script}</p>
                </div>
                {result.ipuclari?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">İpuçları</p>
                    <ul className="space-y-1">
                      {result.ipuclari.map((tip, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-amber-500">•</span>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Marka ve ürün bilgilerini gir, script oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
