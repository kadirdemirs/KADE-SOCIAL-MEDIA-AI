'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn, copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

type Platform = 'youtube_community' | 'facebook' | 'discord'

interface CommunityPost {
  baslik: string
  icerik: string
  cta: string
}

interface CommunityResult {
  postlar: CommunityPost[]
}

const platformLabels: Record<Platform, string> = {
  youtube_community: 'YouTube Topluluk',
  facebook: 'Facebook',
  discord: 'Discord',
}

export default function CommunityPostPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [channelNiche, setChannelNiche] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube_community')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CommunityResult | null>(null)
  const [error, setError] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleCopy = async (text: string, idx: number) => {
    await copyToClipboard(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/community-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, channelNiche, platform, goal, model: selectedModel }),
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
      <TopBar title="Topluluk Postu" description="Topluluk etkileşimi için post içerikleri oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Konu</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Post konusu..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kanal Niş</label>
                <input value={channelNiche} onChange={(e) => setChannelNiche(e.target.value)}
                  placeholder="Kanalın konusu / niş..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="space-y-1.5">
                  {(Object.keys(platformLabels) as Platform[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors text-left',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {platformLabels[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Amaç</label>
                <input value={goal} onChange={(e) => setGoal(e.target.value)}
                  placeholder="Etkileşim artırmak, yorum toplamak..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Post Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                {result.postlar?.map((post, i) => (
                  <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-zinc-500 text-xs font-medium">Versiyon {i + 1}</span>
                        <h3 className="text-zinc-100 font-semibold text-sm mt-0.5">{post.baslik}</h3>
                      </div>
                      <button onClick={() => handleCopy(`${post.baslik}\n\n${post.icerik}\n\n${post.cta}`, i)}
                        className="text-zinc-500 hover:text-violet-400 transition-colors flex-shrink-0">
                        {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-3">{post.icerik}</p>
                    <p className="text-violet-400 text-xs font-medium">{post.cta}</p>
                  </div>
                ))}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konu gir ve topluluk postları oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
