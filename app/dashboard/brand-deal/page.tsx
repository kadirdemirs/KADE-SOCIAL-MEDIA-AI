'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

interface PriceTier {
  fiyat: string
  aciklama: string
  neyi_icerir: string[]
}

interface PackageIdea {
  isim: string
  icerik: string
  fiyat: string
}

interface BrandDealResult {
  onerileri: { minimum: PriceTier; ortalama: PriceTier; premium: PriceTier }
  paket_fikirleri: PackageIdea[]
  muzakere_ipuclari: string[]
  yil_icin_hedef: string
}

export default function BrandDealPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [platform, setPlatform] = useState('youtube')
  const [followers, setFollowers] = useState('')
  const [avgViews, setAvgViews] = useState('')
  const [engagementRate, setEngagementRate] = useState('')
  const [niche, setNiche] = useState('')
  const [dealType, setDealType] = useState('tekil_video')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BrandDealResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followers.trim() || !niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/brand-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, followers, avgViews, engagementRate, niche, dealType, model: selectedModel }),
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

  const tierStyles = [
    { label: 'Minimum', color: 'text-zinc-300', border: 'border-zinc-700/50', bg: 'bg-zinc-800/50' },
    { label: 'Ortalama', color: 'text-violet-300', border: 'border-violet-500/30', bg: 'bg-violet-500/5' },
    { label: 'Premium', color: 'text-amber-300', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  ]

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Brand Deal Hesaplayıcı" description="Sponsorluk fiyatlarını ve anlaşma tekliflerini oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['youtube', 'instagram', 'tiktok', 'podcast'].map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors capitalize',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Takipçi / Abone Sayısı</label>
                <input value={followers} onChange={(e) => setFollowers(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ortalama Görüntüleme</label>
                <input value={avgViews} onChange={(e) => setAvgViews(e.target.value)}
                  placeholder="10000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Etkileşim Oranı (%)</label>
                <input value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)}
                  placeholder="3.5"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niş</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="Teknoloji, finans, yaşam tarzı..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Anlaşma Türü</label>
                <select value={dealType} onChange={(e) => setDealType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="tekil_video">Tekil Video</option>
                  <option value="sponsor_entegrasyon">Sponsor Entegrasyonu</option>
                  <option value="seri">Video Serisi</option>
                  <option value="marka_elcisi">Marka Elçisi</option>
                </select>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !followers.trim() || !niche.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Hesaplanıyor...' : 'Fiyat Hesapla'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.onerileri && (
                  <div className="grid grid-cols-3 gap-3">
                    {(['minimum', 'ortalama', 'premium'] as const).map((tier, i) => {
                      const tierData = result.onerileri[tier]
                      const style = tierStyles[i]
                      return (
                        <div key={tier} className={cn('rounded-xl border p-4', style.border, style.bg)}>
                          <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-1">{style.label}</p>
                          <p className={cn('text-2xl font-bold mb-2', style.color)}>{tierData?.fiyat}</p>
                          <p className="text-zinc-400 text-xs mb-2">{tierData?.aciklama}</p>
                          <ul className="space-y-0.5">
                            {tierData?.neyi_icerir?.map((item, j) => (
                              <li key={j} className="text-zinc-500 text-[10px] flex gap-1"><span>•</span>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}
                {result.yil_icin_hedef && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">Yıllık Gelir Hedefi</p>
                    <p className="text-zinc-200 text-sm">{result.yil_icin_hedef}</p>
                  </div>
                )}
                {result.paket_fikirleri?.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold mb-3">Paket Fikirleri</p>
                    <div className="space-y-2">
                      {result.paket_fikirleri.map((pkg, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-700/30 last:border-0">
                          <div>
                            <p className="text-zinc-200 text-xs font-semibold">{pkg.isim}</p>
                            <p className="text-zinc-500 text-xs">{pkg.icerik}</p>
                          </div>
                          <span className="text-violet-400 text-sm font-bold">{pkg.fiyat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.muzakere_ipuclari?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Müzakere İpuçları</p>
                    <ul className="space-y-1">
                      {result.muzakere_ipuclari.map((tip, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-amber-400">→</span>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Platform ve istatistikleri gir, fiyat hesapla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
