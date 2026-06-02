'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

interface LiveSection {
  baslik: string
  sure: string
  script: string
}

interface LivestreamResult {
  baslik: string
  acilis_script: string
  bolumler: LiveSection[]
  kapanis_script: string
  teknik_kontrol_listesi: string[]
}

export default function LivestreamPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('60')
  const [platform, setPlatform] = useState('youtube')
  const [goals, setGoals] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LivestreamResult | null>(null)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/livestream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, platform, goals, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setActiveSection(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Canlı Yayın Planı" description="Canlı yayın scripti ve bölüm planı oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Yayın Konusu</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Canlı yayının konusu ve amacı..." rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Süre (dakika)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="30">30 dakika</option>
                  <option value="60">1 saat</option>
                  <option value="90">1.5 saat</option>
                  <option value="120">2 saat</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['youtube', 'twitch', 'instagram', 'tiktok'].map((p) => (
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
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedefler <span className="text-zinc-600">(opsiyonel)</span></label>
                <input value={goals} onChange={(e) => setGoals(e.target.value)}
                  placeholder="Satış, etkileşim, topluluk..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Yayın Planı Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <p className="text-violet-400 text-xs font-semibold mb-1">Yayın Başlığı</p>
                  <p className="text-zinc-100 text-base font-semibold">{result.baslik}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-2">Açılış Scripti</p>
                    <p className="text-zinc-300 text-xs leading-relaxed">{result.acilis_script}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Kapanış Scripti</p>
                    <p className="text-zinc-300 text-xs leading-relaxed">{result.kapanis_script}</p>
                  </div>
                </div>
                {result.bolumler?.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                    <div className="flex border-b border-zinc-700/50 overflow-x-auto">
                      {result.bolumler.map((b, i) => (
                        <button key={i} onClick={() => setActiveSection(i)}
                          className={cn('px-4 py-2.5 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
                            activeSection === i ? 'bg-violet-500/20 text-violet-300 border-b-2 border-violet-500'
                              : 'text-zinc-500 hover:text-zinc-300')}>
                          {b.baslik}
                          <span className="ml-1.5 text-zinc-600">{b.sure}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-4">
                      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.bolumler[activeSection]?.script}
                      </p>
                    </div>
                  </div>
                )}
                {result.teknik_kontrol_listesi?.length > 0 && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <p className="text-blue-400 text-xs font-semibold mb-2">Teknik Kontrol Listesi</p>
                    <ul className="space-y-1">
                      {result.teknik_kontrol_listesi.map((item, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-blue-400">☐</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konu gir ve yayın planı oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
