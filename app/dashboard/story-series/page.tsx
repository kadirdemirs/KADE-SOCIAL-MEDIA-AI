'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type Platform = 'instagram' | 'tiktok'

interface Story {
  kare: number
  icerik: string
  sticker_onerisi: string
  muzik_onerisi: string
}

interface StorySeriesResult {
  seri_adi: string
  ana_hook: string
  hikayeler: Story[]
}

export default function StorySeriesPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [storyCount, setStoryCount] = useState(8)
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StorySeriesResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/story-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, storyCount, goal, model: selectedModel }),
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
      <TopBar title="Hikaye Serisi" description="Story serisi içerikleri ve plan oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Konu</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Hikaye serisinin konusu..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['instagram', 'tiktok'] as Platform[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors capitalize',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {p === 'instagram' ? 'Instagram' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kare Sayısı: <span className="text-violet-400">{storyCount}</span></label>
                <input type="range" min={5} max={15} value={storyCount} onChange={(e) => setStoryCount(Number(e.target.value))}
                  className="w-full accent-violet-500" />
                <div className="flex justify-between text-zinc-600 text-xs mt-0.5"><span>5</span><span>15</span></div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Amaç</label>
                <input value={goal} onChange={(e) => setGoal(e.target.value)}
                  placeholder="Satış, etkileşim, farkındalık..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Seri Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <h3 className="text-violet-300 font-bold text-base">{result.seri_adi}</h3>
                  <p className="text-zinc-400 text-xs mt-1 italic">"{result.ana_hook}"</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {result.hikayeler?.map((story) => (
                    <div key={story.kare} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                      <div className="aspect-[9/16] bg-zinc-900 flex flex-col items-center justify-center p-3 relative">
                        <span className="absolute top-2 left-2 text-zinc-600 text-[10px] font-mono">#{story.kare}</span>
                        <p className="text-zinc-200 text-xs text-center leading-relaxed">{story.icerik}</p>
                      </div>
                      <div className="p-2.5 space-y-1 border-t border-zinc-700/50">
                        {story.sticker_onerisi && (
                          <div className="flex items-start gap-1">
                            <span className="text-zinc-600 text-[10px] flex-shrink-0">Sticker:</span>
                            <span className="text-zinc-400 text-[10px]">{story.sticker_onerisi}</span>
                          </div>
                        )}
                        {story.muzik_onerisi && (
                          <div className="flex items-start gap-1">
                            <span className="text-zinc-600 text-[10px] flex-shrink-0">Müzik:</span>
                            <span className="text-zinc-400 text-[10px]">{story.muzik_onerisi}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konu ve platform seç, hikaye serisi oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
