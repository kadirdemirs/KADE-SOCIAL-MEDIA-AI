'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn, copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

type Platform = 'youtube' | 'instagram' | 'linkedin' | 'twitter'

interface HumanizerResult {
  humanize_edilmis: string
  degisiklikler: string[]
  orijinallik_skoru: number
  ai_izleri: string[]
}

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
}

export default function HumanizerPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [text, setText] = useState('')
  const [targetTone, setTargetTone] = useState('samimi')
  const [targetPlatform, setTargetPlatform] = useState<Platform>('instagram')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HumanizerResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetTone, targetPlatform, model: selectedModel }),
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

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400'
  const barColor = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Metin İnsanlaştırıcı" description="AI metnini doğal ve insani bir dile dönüştür" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Metin</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="İnsanlaştırılacak metni yapıştır..." rows={10}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Ton</label>
                <select value={targetTone} onChange={(e) => setTargetTone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="samimi">Samimi & Arkadaşça</option>
                  <option value="profesyonel">Profesyonel</option>
                  <option value="esprili">Esprili</option>
                  <option value="duygusal">Duygusal</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(platformLabels) as Platform[]).map((p) => (
                    <button key={p} type="button" onClick={() => setTargetPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        targetPlatform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {platformLabels[p]}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !text.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'İnsanlaştırılıyor...' : 'İnsanlaştır'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">İnsanlaştırılmış Metin</p>
                    <button onClick={async () => { await copyToClipboard(result.humanize_edilmis); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="text-zinc-500 hover:text-emerald-400 transition-colors">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{result.humanize_edilmis}</p>
                </div>
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-400 text-xs font-semibold">Orijinallik Skoru</p>
                    <span className={cn('text-lg font-bold', scoreColor(result.orijinallik_skoru))}>{result.orijinallik_skoru}/100</span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', barColor(result.orijinallik_skoru))} style={{ width: `${result.orijinallik_skoru}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {result.degisiklikler?.length > 0 && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="text-violet-400 text-xs font-semibold mb-2">Yapılan Değişiklikler</p>
                      <ul className="space-y-1">
                        {result.degisiklikler.map((d, i) => (
                          <li key={i} className="text-zinc-300 text-xs flex gap-1.5"><span className="text-violet-400">→</span>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.ai_izleri?.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="text-amber-400 text-xs font-semibold mb-2">Tespit Edilen AI İzleri</p>
                      <ul className="space-y-1">
                        {result.ai_izleri.map((iz, i) => (
                          <li key={i} className="text-zinc-300 text-xs flex gap-1.5"><span className="text-amber-400">⚠</span>{iz}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Metni gir ve insanlaştır butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
