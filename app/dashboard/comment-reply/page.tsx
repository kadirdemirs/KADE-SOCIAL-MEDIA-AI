'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'

interface ReplyOption { metin: string; ton: string }
interface Replies { yanit_1: ReplyOption; yanit_2: ReplyOption; yanit_3: ReplyOption; ipucu: string }

const styles = ['samimi', 'profesyonel', 'esprili', 'teşekkür odaklı', 'soruyla bitir']

export default function CommentReplyPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [comment, setComment] = useState('')
  const [context, setContext] = useState('')
  const [style, setStyle] = useState('samimi')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Replies | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/generate/comment-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, context, style, model: selectedModel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.replies)
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const tonColors: Record<string, string> = {
    samimi: 'text-emerald-400', esprili: 'text-amber-400', profesyonel: 'text-blue-400',
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Yorum Yanıtlayıcı" description="Yorumlara hızlı, samimi ve etkili yanıtlar üret" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Yorum</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                  placeholder="Yanıtlanacak yorumu buraya yapıştır..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kanal / Hesap Konusu</label>
                <input value={context} onChange={(e) => setContext(e.target.value)}
                  placeholder="Örn: teknoloji ve yazılım YouTuber'ı"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Yanıt Stili</label>
                <div className="space-y-1.5">
                  {styles.map((s) => (
                    <button key={s} type="button" onClick={() => setStyle(s)}
                      className={cn('w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors border',
                        style === s ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !comment.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Üretiliyor...' : 'Yanıt Üret'}
              </button>
            </form>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                {[['yanit_1', data.yanit_1], ['yanit_2', data.yanit_2], ['yanit_3', data.yanit_3]].map(([key, reply]) => {
                  const r = reply as ReplyOption
                  if (!r?.metin) return null
                  return (
                    <div key={key as string} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('text-xs font-medium', tonColors[r.ton] || 'text-zinc-400')}>{r.ton}</span>
                        <button onClick={() => copy(r.metin, key as string)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                          {copied === key ? '✓ Kopyalandı' : 'Kopyala'}
                        </button>
                      </div>
                      <p className="text-zinc-200 text-sm leading-relaxed">{r.metin}</p>
                    </div>
                  )
                })}
                {data.ipucu && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-1">İpucu</p>
                    <p className="text-zinc-300 text-sm">{data.ipucu}</p>
                  </div>
                )}
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Yorumu gir ve yanıt seçenekleri üret</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
