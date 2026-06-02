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

interface RepurposeResult {
  platform: Platform
  content: string
}

export default function RepurposePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [originalContent, setOriginalContent] = useState('')
  const [sourcePlatform, setSourcePlatform] = useState<Platform>('youtube')
  const [targetPlatforms, setTargetPlatforms] = useState<Platform[]>(['instagram', 'tiktok'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RepurposeResult[]>([])
  const [error, setError] = useState('')

  const toggleTarget = (p: Platform) => {
    setTargetPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalContent.trim() || targetPlatforms.length === 0) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const promises = targetPlatforms.map(async (target) => {
        const res = await fetch('/api/generate/repurpose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: originalContent,
            sourcePlatform,
            targetPlatform: target,
            model: selectedModel,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        return { platform: target, content: data.content } as RepurposeResult
      })
      const settled = await Promise.allSettled(promises)
      const success = settled
        .filter((r): r is PromiseFulfilledResult<RepurposeResult> => r.status === 'fulfilled')
        .map((r) => r.value)
      setResults(success)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="İçerik Dönüştür" description="Bir içeriği farklı platformlara uyarla" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Orijinal İçerik</label>
                <textarea value={originalContent} onChange={(e) => setOriginalContent(e.target.value)}
                  placeholder="Dönüştürmek istediğin içeriği buraya yapıştır..." rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kaynak Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map((p) => (
                    <button key={p} type="button" onClick={() => setSourcePlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        sourcePlatform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Platformlar</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.filter((p) => p !== sourcePlatform).map((p) => (
                    <button key={p} type="button" onClick={() => toggleTarget(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        targetPlatforms.includes(p) ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !originalContent.trim() || targetPlatforms.length === 0}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Dönüştürülüyor...' : `${targetPlatforms.length} Platforma Dönüştür`}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && (
              <div className="space-y-2">
                {targetPlatforms.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs w-24">{getPlatformLabel(p)}</span>
                    <LoadingState model={selectedModel} />
                  </div>
                ))}
              </div>
            )}
            {results.map((r) => (
              <div key={r.platform} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-200 font-medium text-sm">{getPlatformLabel(r.platform)} İçeriği</h3>
                  <CopyButton text={r.content} />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
              </div>
            ))}
            {!loading && results.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                İçeriği yapıştır, platformları seç ve dönüştür
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
