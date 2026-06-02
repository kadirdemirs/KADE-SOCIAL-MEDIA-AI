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

const ageRanges = [
  { id: '13-17', label: '13–17' },
  { id: '18-24', label: '18–24' },
  { id: '18-34', label: '18-34' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45+',   label: '45+' },
  { id: 'genel', label: 'Genel' },
]

interface PlatformDesc { platform: Platform; description: string }

export default function DescriptionPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle]               = useState('')
  const [summary, setSummary]           = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['youtube'])
  const [ageRange, setAgeRange]         = useState('18-34')
  const [extraAudience, setExtraAudience] = useState('')
  const [includeCTA, setIncludeCTA]     = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [results, setResults]           = useState<PlatformDesc[]>([])
  const [error, setError]               = useState('')

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p])

  const generateFor = async (platform: Platform): Promise<PlatformDesc> => {
    const targetAudience = `${ageRange} yaş${extraAudience ? `, ${extraAudience}` : ''}`
    const res = await fetch('/api/generate/description', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, platform, targetAudience, model: selectedModel, includeHashtags, includeCTA }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return { platform, description: data.description }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      const settled = await Promise.allSettled(selectedPlatforms.map(generateFor))
      setResults(settled.filter((r): r is PromiseFulfilledResult<PlatformDesc> => r.status === 'fulfilled').map(r => r.value))
    } catch (err) { setError(err instanceof Error ? err.message : 'Hata') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Video Açıklama" description="Platform uyumlu, yaş hedefli açıklamalar yaz" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Videonun başlığı"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Özeti</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Videonun kısa içeriği..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Platform <span className="text-zinc-600">(çoklu)</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {platforms.map(p => (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        selectedPlatforms.includes(p)
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {getPlatformLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Yaş Aralığı</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ageRanges.map(a => (
                    <button key={a.id} type="button" onClick={() => setAgeRange(a.id)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        ageRange === a.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Ek Hedef Kitle <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <input value={extraAudience} onChange={e => setExtraAudience(e.target.value)}
                  placeholder="teknoloji meraklıları, girişimciler..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { label: 'CTA ekle', checked: includeCTA, set: setIncludeCTA },
                  { label: 'Hashtag ekle', checked: includeHashtags, set: setIncludeHashtags },
                ].map(item => (
                  <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={item.checked} onChange={e => item.set(e.target.checked)}
                      className="w-4 h-4 rounded accent-violet-500" />
                    <span className="text-zinc-400 text-sm">{item.label}</span>
                  </label>
                ))}
              </div>

              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim() || !summary.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Yazılıyor...' : `${selectedPlatforms.length} Platforma Açıklama Yaz`}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {results.map(r => (
              <div key={r.platform} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-200 font-semibold text-sm">{getPlatformLabel(r.platform)}</h3>
                  <CopyButton text={r.description} />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{r.description}</p>
              </div>
            ))}
            {!loading && results.length === 0 && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Formu doldurup açıklama yaz
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
