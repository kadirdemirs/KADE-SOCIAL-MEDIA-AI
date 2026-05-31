'use client'

import { useState, useEffect } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { Platform, ContentTone } from '@/types'
import { getPlatformLabel, cn } from '@/lib/utils'

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin']
const tones: ContentTone[] = ['bilgilendirici', 'eğlenceli', 'ilham verici', 'dikkat çekici', 'samimi']
const durations = [
  { id: '30s', label: '30 Saniye' },
  { id: '60s', label: '60 Saniye' },
  { id: '3min', label: '3 Dakika' },
  { id: '5min', label: '5 Dakika' },
  { id: '10min', label: '10 Dakika' },
] as const

type Duration = '30s' | '60s' | '3min' | '5min' | '10min'

export default function ScriptPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [title, setTitle] = useState('')
  const [hook, setHook] = useState('')
  const [duration, setDuration] = useState<Duration>('3min')
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [tone, setTone] = useState<ContentTone>('bilgilendirici')
  const [loading, setLoading] = useState(false)
  const [script, setScript] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const savedTitle = localStorage.getItem('contentai_selected_title')
    const savedHook = localStorage.getItem('contentai_selected_hook')
    if (savedTitle) { setTitle(savedTitle); localStorage.removeItem('contentai_selected_title') }
    if (savedHook) { setHook(savedHook); localStorage.removeItem('contentai_selected_hook') }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, hook, duration, platform, tone, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScript(data.script)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Script Yazarı" description="Hook → İçerik → CTA yapısında tam video scripti" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video başlığını gir"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                  Hook <span className="text-zinc-600">(opsiyonel)</span>
                </label>
                <textarea value={hook} onChange={(e) => setHook(e.target.value)}
                  placeholder="Hook Jeneratörü'nden gelen hook ya da kendin yaz..."
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Süresi</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {durations.map((d) => (
                    <button key={d.id} type="button" onClick={() => setDuration(d.id)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        duration === d.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {d.label}
                    </button>
                  ))}
                </div>
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
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ton</label>
                <div className="space-y-1">
                  {tones.map((t) => (
                    <button key={t} type="button" onClick={() => setTone(t)}
                      className={cn('w-full text-left py-1.5 px-3 rounded-lg text-xs transition-colors capitalize',
                        tone === t ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !title.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Yazılıyor...' : 'Script Yaz'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {script && !loading && (
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-zinc-200 font-medium text-sm">Video Script</h3>
                  <CopyButton text={script} />
                </div>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs">
                  {script}
                </div>
              </div>
            )}
            {!loading && !script && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Başlığı gir ve script yaz butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
