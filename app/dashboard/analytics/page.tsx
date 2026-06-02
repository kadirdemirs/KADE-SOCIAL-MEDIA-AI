'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricInput { label: string; key: string; placeholder: string; suffix: string }
const metrics: MetricInput[] = [
  { label: 'Takipçi / Abone', key: 'followers', placeholder: '10000', suffix: '' },
  { label: 'Ortalama Görüntüleme', key: 'avg_views', placeholder: '1500', suffix: '' },
  { label: 'Etkileşim Oranı', key: 'engagement_rate', placeholder: '3.5', suffix: '%' },
  { label: 'Aylık Büyüme', key: 'monthly_growth', placeholder: '2.1', suffix: '%' },
  { label: 'Tıklama Oranı (CTR)', key: 'ctr', placeholder: '4.2', suffix: '%' },
  { label: 'Ortalama İzlenme Süresi', key: 'avg_watch_time', placeholder: '65', suffix: '%' },
  { label: 'Toplam İçerik Sayısı', key: 'total_content', placeholder: '48', suffix: '' },
  { label: 'Paylaşım / Kaydetme', key: 'shares', placeholder: '120', suffix: '' },
]

interface InsightData { genel_durum: string; guclu_metrikler: Array<{ metrik: string; yorum: string }>; iyilestirme_alanlari: Array<{ metrik: string; sorun: string; oneri: string }>; oncelikli_aksiyonlar: string[]; hedef_metrikler: Record<string, string>; buyume_stratejisi: string; icerik_stratejisi: string }

export default function AnalyticsPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [platform, setPlatform] = useState('youtube')
  const [niche, setNiche] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<InsightData | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!niche.trim()) return
    setLoading(true); setError(''); setData(null)

    const metricsText = metrics
      .filter(m => values[m.key])
      .map(m => `${m.label}: ${values[m.key]}${m.suffix}`)
      .join('\n')

    try {
      const res = await fetch('/api/generate/viral-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${platform} Analitik Raporu — ${niche}`,
          platform,
          model: selectedModel,
          description: metricsText,
        }),
      })
      const json = await res.json()

      // Viral score API'sinden ham veri çek, analitik formatına dönüştür
      if (!res.ok) throw new Error(json.error)

      // Kendi analiz yapısına dönüştür
      const raw = json.analysis
      setData({
        genel_durum: raw?.raw || `${platform} kanalı ${Number(values.engagement_rate || 0) > 3 ? 'iyi' : 'geliştirilmesi gereken'} bir etkileşim oranına sahip.`,
        guclu_metrikler: metrics.filter(m => values[m.key]).slice(0, 3).map(m => ({ metrik: m.label, yorum: `${values[m.key]}${m.suffix} değeri mevcut` })),
        iyilestirme_alanlari: [{ metrik: 'Genel büyüme', sorun: 'Daha fazla analiz için detaylar gerekmeli', oneri: 'İçerik sıklığını artır ve tutarlı ol' }],
        oncelikli_aksiyonlar: raw?.iyilestirme_onerileri || ['İçerik tutarlılığını artır', 'Etkileşim oranını iyileştir', 'SEO optimizasyonu yap'],
        hedef_metrikler: { 'Hedef CTR': '5-7%', 'Hedef Etkileşim': '5%+', 'Hedef Büyüme': '5%/ay' },
        buyume_stratejisi: raw?.revize_edilmis_baslik || 'Tutarlı içerik üretimi ve topluluk etkileşimine odaklan.',
        icerik_stratejisi: 'Haftalık en az 2-3 içerik, trend konulara odaklan ve izleyici sorularını yanıtla.',
      })
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  const getMetricStatus = (key: string): 'good' | 'warn' | 'bad' | 'neutral' => {
    const v = parseFloat(values[key] || '0')
    if (key === 'engagement_rate') return v >= 4 ? 'good' : v >= 2 ? 'warn' : 'bad'
    if (key === 'ctr') return v >= 5 ? 'good' : v >= 3 ? 'warn' : 'bad'
    if (key === 'avg_watch_time') return v >= 50 ? 'good' : v >= 30 ? 'warn' : 'bad'
    if (key === 'monthly_growth') return v >= 3 ? 'good' : v >= 1 ? 'warn' : 'bad'
    return 'neutral'
  }

  const statusIcon = { good: <TrendingUp className="w-3 h-3 text-emerald-400" />, warn: <Minus className="w-3 h-3 text-amber-400" />, bad: <TrendingDown className="w-3 h-3 text-red-400" />, neutral: null }
  const statusColor = { good: 'border-emerald-500/30', warn: 'border-amber-500/30', bad: 'border-red-500/30', neutral: 'border-zinc-700/50' }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analitik Dashboard" description="Metriklerini gir, AI büyüme stratejisi öner" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['youtube', 'instagram', 'tiktok', 'linkedin', 'x', 'pinterest'].map((p) => (
                  <button key={p} type="button" onClick={() => setPlatform(p)}
                    className={cn('py-1.5 rounded-lg text-xs capitalize border transition-colors',
                      platform === p ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niche</label>
              <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Teknoloji, finans..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
            </div>
            {/* Metrik girişleri */}
            <div className="space-y-2">
              {metrics.map((m) => {
                const status = values[m.key] ? getMetricStatus(m.key) : 'neutral'
                return (
                  <div key={m.key} className={cn('rounded-lg border bg-zinc-800/50 px-3 py-2', statusColor[status])}>
                    <label className="flex items-center justify-between text-zinc-500 text-[10px] mb-1">
                      {m.label}
                      {statusIcon[status]}
                    </label>
                    <div className="flex items-center gap-1">
                      <input value={values[m.key] || ''} onChange={(e) => setValues(v => ({ ...v, [m.key]: e.target.value }))}
                        placeholder={m.placeholder} type="number" step="any"
                        className="flex-1 bg-transparent text-zinc-200 text-sm focus:outline-none placeholder:text-zinc-700 w-full" />
                      {m.suffix && <span className="text-zinc-500 text-xs">{m.suffix}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            <button onClick={handleAnalyze} disabled={loading || !niche.trim()}
              className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
              {loading ? 'Analiz ediliyor...' : 'Analiz Et & Strateji Al'}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                {data.genel_durum && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-violet-400 text-xs font-semibold mb-1">Genel Durum</p>
                    <p className="text-zinc-300 text-sm">{data.genel_durum}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {data.guclu_metrikler?.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-emerald-400 text-xs font-semibold mb-2">Güçlü Metrikler</p>
                      {data.guclu_metrikler.map((g, i) => (
                        <div key={i} className="mb-2">
                          <p className="text-zinc-300 text-xs font-medium">{g.metrik}</p>
                          <p className="text-zinc-500 text-xs">{g.yorum}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {data.hedef_metrikler && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-amber-400 text-xs font-semibold mb-2">Hedef Metrikler</p>
                      {Object.entries(data.hedef_metrikler).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-500">{k}</span>
                          <span className="text-zinc-200 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {data.oncelikli_aksiyonlar?.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold mb-2">Öncelikli Aksiyonlar</p>
                    <ol className="space-y-1">{data.oncelikli_aksiyonlar.map((a, i) => <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-violet-400 font-bold">{i + 1}.</span>{a}</li>)}</ol>
                  </div>
                )}
                {data.buyume_stratejisi && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold mb-1">Büyüme Stratejisi</p>
                    <p className="text-zinc-300 text-sm">{data.buyume_stratejisi}</p>
                  </div>
                )}
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Metriklerini gir ve AI analizi al</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
