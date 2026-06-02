'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'

interface Chapter { timestamp: string; baslik: string; ozet: string }
interface Chapters { chapters: Chapter[]; youtube_format: string }

export default function ChaptersPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [transcript, setTranscript] = useState('')
  const [videoDuration, setVideoDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Chapters | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transcript.trim()) return
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/generate/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoDuration, model: selectedModel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.chapters)
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  const copy = () => {
    if (!data?.youtube_format) return
    navigator.clipboard.writeText(data.youtube_format)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="YouTube Chapter" description="Transcript'ten otomatik bölümler ve timestamp'ler üret" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Süresi</label>
                <input value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="Örn: 18 dakika 30 saniye"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Transcript / Script</label>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={10}
                  placeholder="Video transkriptini veya scriptini buraya yapıştır..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !transcript.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Üretiliyor...' : 'Chapter Üret'}
              </button>
            </form>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-zinc-400 text-sm"><span className="text-violet-400 font-semibold">{data.chapters?.length}</span> chapter</p>
                  <button onClick={copy} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs hover:text-zinc-200 border border-zinc-700">
                    {copied ? '✓ Kopyalandı' : 'YouTube Format Kopyala'}
                  </button>
                </div>
                {data.youtube_format && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-violet-400 text-xs font-semibold mb-2">YouTube Açıklamasına Yapıştır</p>
                    <pre className="text-zinc-300 text-xs font-mono whitespace-pre-wrap">{data.youtube_format}</pre>
                  </div>
                )}
                <div className="space-y-2">
                  {data.chapters?.map((c, i) => (
                    <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3 flex gap-3">
                      <span className="text-violet-400 text-xs font-mono font-bold flex-shrink-0 w-12">{c.timestamp}</span>
                      <div>
                        <p className="text-zinc-200 text-sm font-medium">{c.baslik}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{c.ozet}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Transcript yapıştır ve chapter üret</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
