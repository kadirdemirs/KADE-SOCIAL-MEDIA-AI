'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

interface PodcastSection { tip: string; baslik: string; sure: string; script: string }
interface Podcast { baslik: string; ozet: string; bolumler: PodcastSection[]; show_notes: string; sosyal_medya_caption: string }

const tipColors: Record<string, string> = {
  intro: 'border-violet-500/50 bg-violet-500/5',
  segment: 'border-zinc-700/50 bg-zinc-800/50',
  reklam_arasi: 'border-amber-500/30 bg-amber-500/5',
  outro: 'border-emerald-500/30 bg-emerald-500/5',
}

export default function PodcastPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('30 dakika')
  const [format, setFormat] = useState('solo')
  const [hostName, setHostName] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Podcast | null>(null)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true); setError(''); setData(null); setActiveSection(0)
    try {
      const res = await fetch('/api/generate/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, format, hostName, model: selectedModel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.podcast)
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Podcast Script" description="Profesyonel podcast bölümleri için tam script yaz" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Bölüm Konusu</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3}
                  placeholder="Örn: Yapay zeka araçlarıyla günlük üretkenlik"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Sunucu Adı</label>
                <input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Adın / podcast adın"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Süre</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['15 dakika', '30 dakika', '45 dakika', '60 dakika', '90 dakika', '120 dakika'].map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={cn('py-1.5 rounded-lg text-xs transition-colors border',
                        duration === d ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Format</label>
                <div className="space-y-1.5">
                  {[['solo', 'Tek sunucu'], ['interview', 'Röportaj'], ['storytelling', 'Hikaye anlatımı'], ['panel', 'Panel tartışma']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setFormat(v)}
                      className={cn('w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors border',
                        format === v ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Yazılıyor...' : 'Script Yaz'}
              </button>
            </form>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-zinc-100 font-semibold text-base">{data.baslik}</h2>
                  <p className="text-zinc-500 text-xs mt-1">{data.ozet}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {data.bolumler?.map((s, i) => (
                    <button key={i} onClick={() => setActiveSection(i)}
                      className={cn('px-2.5 py-1 rounded-lg text-xs transition-colors',
                        activeSection === i ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300')}>
                      {s.baslik}
                    </button>
                  ))}
                </div>
                {data.bolumler?.[activeSection] && (() => {
                  const s = data.bolumler[activeSection]
                  return (
                    <div className={cn('rounded-xl border p-5', tipColors[s.tip] || 'border-zinc-700/50 bg-zinc-800/50')}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-zinc-400 text-xs font-semibold uppercase">{s.tip.replace('_', ' ')}</span>
                        <span className="text-zinc-600 text-xs">· {s.sure}</span>
                      </div>
                      <pre className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{s.script}</pre>
                    </div>
                  )
                })()}
                {data.show_notes && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4">
                    <p className="text-zinc-500 text-xs font-semibold mb-2">Show Notes</p>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{data.show_notes}</p>
                  </div>
                )}
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Konu gir ve podcast script üret</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
