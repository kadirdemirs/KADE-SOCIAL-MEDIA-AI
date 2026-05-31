'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { Platform } from '@/types'
import { getPlatformLabel, cn } from '@/lib/utils'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'pinterest']

interface ViralAnalysis {
  toplam_puan: number
  kriterler: Record<string, { puan: number; yorum: string }>
  guclu_yonler: string[]
  iyilestirme_onerileri: string[]
  revize_edilmis_baslik: string
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
  return <span className={cn('text-2xl font-bold', color)}>{score}</span>
}

function ScoreBar({ score }: { score: number }) {
  const bg = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', bg)} style={{ width: `${score}%` }} />
    </div>
  )
}

const criteriaLabels: Record<string, string> = {
  baslik_guc: 'Başlık Gücü',
  platform_uyum: 'Platform Uyumu',
  seo_guc: 'SEO Gücü',
  merak_faktoru: 'Merak Faktörü',
  cta_guc: 'CTA Gücü',
}

export default function ViralScorePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/viral-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, platform, model: selectedModel, description, hashtags }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Viral Skor" description="İçeriğinin viral potansiyelini analiz et" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Analiz edilecek başlık"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Açıklama <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Video açıklaması..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Hashtagler <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <input value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#teknoloji #youtube #viral"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Analiz ediliyor...' : 'Viral Skor Al'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {analysis && !loading && (
              <>
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 flex items-center gap-6">
                  <div className="text-center">
                    <ScoreBadge score={analysis.toplam_puan} />
                    <p className="text-zinc-500 text-xs mt-1">/ 100</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-zinc-200 font-semibold text-base">Viral Potansiyel Skoru</h3>
                    <ScoreBar score={analysis.toplam_puan} />
                  </div>
                </div>

                {analysis.kriterler && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysis.kriterler).map(([key, val]) => (
                      <div key={key} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-400 text-xs">{criteriaLabels[key] || key}</p>
                          <ScoreBadge score={val.puan} />
                        </div>
                        <ScoreBar score={val.puan} />
                        <p className="text-zinc-500 text-xs leading-relaxed">{val.yorum}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {analysis.guclu_yonler?.length > 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <h4 className="text-emerald-400 text-xs font-semibold mb-2">Güçlü Yönler</h4>
                      <ul className="space-y-1">
                        {analysis.guclu_yonler.map((item, i) => (
                          <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-emerald-500">✓</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.iyilestirme_onerileri?.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <h4 className="text-amber-400 text-xs font-semibold mb-2">İyileştirme Önerileri</h4>
                      <ul className="space-y-1">
                        {analysis.iyilestirme_onerileri.map((item, i) => (
                          <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-amber-500">→</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {analysis.revize_edilmis_baslik && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-violet-400 text-xs font-semibold mb-1">Revize Edilmiş Başlık</p>
                    <p className="text-zinc-200 text-sm">{analysis.revize_edilmis_baslik}</p>
                  </div>
                )}
              </>
            )}
            {!loading && !analysis && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Başlığı gir ve viral skor al butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
