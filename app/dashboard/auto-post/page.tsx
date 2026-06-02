'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

const allPlatforms = ['instagram', 'tiktok', 'youtube', 'x', 'linkedin', 'pinterest']
const platformIcons: Record<string, string> = { instagram: '📸', tiktok: '🎵', youtube: '▶️', x: '𝕏', linkedin: '💼', pinterest: '📌' }

type PostData = Record<string, Record<string, unknown>>

export default function AutoPostPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState('video')
  const [targetPlatforms, setTargetPlatforms] = useState(['instagram', 'tiktok', 'youtube', 'x'])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ platformlar: PostData; en_iyi_zamanlama: Record<string, string>; cross_promo_stratejisi: string } | null>(null)
  const [error, setError] = useState('')
  const [activeP, setActiveP] = useState('instagram')
  const [copied, setCopied] = useState<string | null>(null)

  const toggle = (p: string) => setTargetPlatforms(ps => ps.includes(p) ? ps.filter(x => x !== p) : [...ps, p])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/generate/auto-post', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentType, targetPlatforms, model: selectedModel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.posts)
      setActiveP(targetPlatforms[0] || 'instagram')
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(String(text)); setCopied(key); setTimeout(() => setCopied(null), 2000) }

  const activePlatformData = data?.platformlar?.[activeP]

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Otomatik Paylaşım" description="Ana içerikten 6 platforma kopyala-yapıştır hazır postlar" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">İçerik Türü</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['video', 'blog', 'podcast', 'ürün', 'etkinlik', 'haber'].map((t) => (
                    <button key={t} type="button" onClick={() => setContentType(t)}
                      className={cn('py-1.5 rounded-lg text-xs capitalize border transition-colors',
                        contentType === t ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ana İçerik</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
                  placeholder="Video başlığı, konu özeti veya script gir. AI her platform için uyarlayacak..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Platformlar</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {allPlatforms.map((p) => (
                    <button key={p} type="button" onClick={() => toggle(p)}
                      className={cn('py-1.5 rounded-lg text-xs capitalize border transition-colors',
                        targetPlatforms.includes(p) ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700')}>
                      {platformIcons[p]} {p}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !content.trim() || !targetPlatforms.length}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Hazırlanıyor...' : `${targetPlatforms.length} Platform İçin Üret`}
              </button>
            </form>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                {/* Platform tabs */}
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(data.platformlar || {}).map((p) => (
                    <button key={p} onClick={() => setActiveP(p)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                        activeP === p ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300')}>
                      {platformIcons[p] || ''} {p}
                    </button>
                  ))}
                </div>
                {/* Platform content */}
                {activePlatformData && (
                  <div className="space-y-3">
                    {Object.entries(activePlatformData).map(([key, val]) => {
                      if (!val || (Array.isArray(val) && !val.length)) return null
                      const text = Array.isArray(val) ? val.join(', ') : String(val)
                      return (
                        <div key={key} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-zinc-500 text-xs capitalize">{key.replace(/_/g, ' ')}</p>
                            <button onClick={() => copy(text, `${activeP}_${key}`)}
                              className="text-xs text-zinc-500 hover:text-zinc-300">{copied === `${activeP}_${key}` ? '✓ Kopyalandı' : 'Kopyala'}</button>
                          </div>
                          <p className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
                {/* Cross promo + timing */}
                <div className="grid grid-cols-2 gap-3">
                  {data.en_iyi_zamanlama && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="text-emerald-400 text-xs font-semibold mb-1">En İyi Zamanlama</p>
                      {Object.entries(data.en_iyi_zamanlama).map(([k, v]) => <p key={k} className="text-zinc-400 text-xs"><span className="text-zinc-500 capitalize">{k}:</span> {String(v)}</p>)}
                    </div>
                  )}
                  {data.cross_promo_stratejisi && (
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                      <p className="text-violet-400 text-xs font-semibold mb-1">Çapraz Tanıtım</p>
                      <p className="text-zinc-300 text-xs">{data.cross_promo_stratejisi}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">İçerik gir, platformlar seç, hazır post al</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
