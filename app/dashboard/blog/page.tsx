'use client'
import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'

interface Blog { meta_title: string; meta_description: string; slug: string; tahmini_okuma_suresi: string; makale: string; anahtar_kelimeler: string[]; ic_baglanti_fikirleri: string[] }

export default function BlogPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Blog | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true); setError(''); setData(null)
    try {
      const res = await fetch('/api/generate/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, targetKeyword: keyword, model: selectedModel }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json.blog)
    } catch (e) { setError(e instanceof Error ? e.message : 'Hata') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Blog Yazısı" description="Video script'inden SEO blog makalesine dönüştür" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6">
          <div className="w-80 flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Video Başlığı</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video başlığı (opsiyonel)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Anahtar Kelime</label>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Örn: yapay zeka araçları 2024"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Script / Transkript</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                  placeholder="Video scriptini veya transkriptini yapıştır..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !content.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
                {loading ? 'Yazılıyor...' : 'Blog Yaz'}
              </button>
            </form>
          </div>
          <div className="flex-1 min-w-0">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm mb-4">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {data && !loading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <p className="text-zinc-500 text-xs mb-1">Meta Başlık</p>
                    <p className="text-zinc-200 text-sm font-medium">{data.meta_title}</p>
                    <p className={`text-xs mt-1 ${data.meta_title?.length > 60 ? 'text-red-400' : 'text-emerald-400'}`}>{data.meta_title?.length}/60</p>
                  </div>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <p className="text-zinc-500 text-xs mb-1">Slug</p>
                    <p className="text-violet-400 text-sm font-mono">/{data.slug}</p>
                    <p className="text-zinc-600 text-xs mt-1">{data.tahmini_okuma_suresi}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3">
                  <p className="text-zinc-500 text-xs mb-1">Meta Description</p>
                  <p className="text-zinc-300 text-sm">{data.meta_description}</p>
                  <p className={`text-xs mt-1 ${data.meta_description?.length > 160 ? 'text-red-400' : 'text-emerald-400'}`}>{data.meta_description?.length}/160</p>
                </div>
                {data.anahtar_kelimeler?.length > 0 && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-3">
                    <p className="text-zinc-500 text-xs mb-2">Anahtar Kelimeler</p>
                    <div className="flex flex-wrap gap-1.5">{data.anahtar_kelimeler.map((k, i) => <span key={i} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded">{k}</span>)}</div>
                  </div>
                )}
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-400 text-xs font-semibold">Makale (Markdown)</p>
                    <button onClick={() => { navigator.clipboard.writeText(data.makale); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">{copied ? '✓' : 'Kopyala'}</button>
                  </div>
                  <pre className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">{data.makale}</pre>
                </div>
              </div>
            )}
            {!data && !loading && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">Script yapıştır ve SEO blog makalesine dönüştür</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
