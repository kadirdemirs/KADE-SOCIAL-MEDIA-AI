'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

type HookFormat = 'reels' | 'shorts' | 'tiktok' | 'youtube'

interface HookItem {
  hook: string
  tip: string
  neden: string
}

const formats: { id: HookFormat; label: string }[] = [
  { id: 'reels', label: 'Instagram Reels' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'shorts', label: 'YouTube Shorts' },
  { id: 'youtube', label: 'YouTube Video' },
]

const tipColors: Record<string, string> = {
  merak: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  soru: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  şok: 'bg-red-500/15 text-red-300 border-red-500/25',
  istatistik: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  hikaye: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  genel: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25',
}

export default function HookPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [format, setFormat] = useState<HookFormat>('reels')
  const [niche, setNiche] = useState('')
  const [loading, setLoading] = useState(false)
  const [hooks, setHooks] = useState<HookItem[]>([])
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || !niche.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, niche, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setHooks(data.hooks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const sendToScript = (hook: string) => {
    localStorage.setItem('contentai_selected_hook', hook)
    window.location.href = '/dashboard/script'
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Hook Jeneratörü" description="İlk 3 saniyede izleyiciyi tutan açılış cümleleri" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          {/* Form */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Konusu</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Sabah rutini ile hayatım değişti"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Format</label>
                <div className="space-y-1">
                  {formats.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id)}
                      className={cn(
                        'w-full text-left py-2 px-3 rounded-lg text-xs transition-colors',
                        format === f.id
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Niche</label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Örn: teknoloji, fitness, yemek"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-2">
                <ModelSelector value={selectedModel} onChange={setSelectedModel} />
                <button
                  type="submit"
                  disabled={loading || !topic.trim() || !niche.trim()}
                  className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Üretiliyor...' : 'Hook Üret'}
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-3">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading && <LoadingState model={selectedModel} />}

            {hooks.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-zinc-100 text-sm leading-relaxed font-medium flex-1">{item.hook}</p>
                  <span
                    className={cn(
                      'flex-shrink-0 text-xs px-2 py-0.5 rounded-md border capitalize',
                      tipColors[item.tip] || tipColors.genel
                    )}
                  >
                    {item.tip}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed">{item.neden}</p>
                <div className="flex gap-2">
                  <CopyButton text={item.hook} />
                  <button
                    onClick={() => sendToScript(item.hook)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-700 text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                  >
                    Bu Hook'u Kullan
                  </button>
                </div>
              </div>
            ))}

            {!loading && hooks.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Konuyu ve niche'i gir, hook üret butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
