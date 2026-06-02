'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface NewsletterResult {
  konu_satiri: string
  preview_text: string
  giris: string
  ana_icerik: string
  cta_butonu: string
  kapanis: string
  ps_notu: string
  en_iyi_gonderim_gunu: string
}

function CopyCard({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <button onClick={handleCopy} className="text-zinc-500 hover:text-violet-400 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <p className="text-zinc-200 text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export default function NewsletterPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [content, setContent] = useState('')
  const [brand, setBrand] = useState('')
  const [tone, setTone] = useState('samimi')
  const [includePromo, setIncludePromo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NewsletterResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, brand, tone, includePromo, model: selectedModel }),
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

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Newsletter Üretici" description="E-bülten içeriği ve konu satırı oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">İçerik / Konu</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Newsletter konusu veya içerik özeti..." rows={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Marka / Gönderici Adı</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)}
                  placeholder="Marka adı..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ton</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="samimi">Samimi</option>
                  <option value="profesyonel">Profesyonel</option>
                  <option value="esprili">Esprili</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="promo" checked={includePromo} onChange={(e) => setIncludePromo(e.target.checked)}
                  className="w-4 h-4 accent-violet-500" />
                <label htmlFor="promo" className="text-zinc-400 text-xs">Promosyon/CTA içeriği ekle</label>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !content.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Newsletter Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-3">
                <CopyCard label="Konu Satırı" value={result.konu_satiri} />
                <CopyCard label="Preview Text" value={result.preview_text} />
                <CopyCard label="Giriş" value={result.giris} />
                <CopyCard label="Ana İçerik" value={result.ana_icerik} />
                <CopyCard label="CTA Butonu" value={result.cta_butonu} />
                <CopyCard label="Kapanış" value={result.kapanis} />
                {result.ps_notu && <CopyCard label="P.S. Notu" value={result.ps_notu} />}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-amber-400 text-xs font-semibold mb-1">En İyi Gönderim Günü</p>
                  <p className="text-zinc-200 text-sm">{result.en_iyi_gonderim_gunu}</p>
                </div>
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                İçerik gir ve newsletter oluştur butonuna tıkla
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
