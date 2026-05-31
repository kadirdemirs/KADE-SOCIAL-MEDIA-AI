'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { Platform } from '@/types'
import { getPlatformLabel, cn } from '@/lib/utils'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'pinterest']

export default function DescriptionPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [audience, setAudience] = useState('')
  const [includeCTA, setIncludeCTA] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !audience.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, summary, platform, targetAudience: audience,
          model: selectedModel, includeHashtags, includeCTA,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.description)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Video Açıklama" description="Platform uyumlu, CTA içeren açıklamalar yaz" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Videonun başlığı"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Özeti</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Videonun kısa içeriği..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
                />
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
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Kitle</label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Örn: 18-25 yaş, teknoloji meraklıları"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeCTA} onChange={(e) => setIncludeCTA(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-500" />
                  <span className="text-zinc-400 text-sm">CTA ekle</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-500" />
                  <span className="text-zinc-400 text-sm">Hashtag ekle</span>
                </label>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim() || !summary.trim() || !audience.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Yazılıyor...' : 'Açıklama Yaz'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-200 font-medium text-sm">Açıklama</h3>
                  <CopyButton text={result} />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Formu doldurup açıklama yaz butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
