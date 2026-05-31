'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import CopyButton from '@/components/ui/CopyButton'
import { Trash2, History } from 'lucide-react'
import { getModelLabel, getModelColor, cn } from '@/lib/utils'
import { AIModel } from '@/types'

interface HistoryEntry {
  id: string
  tool: string
  model: string
  output: string
  input_data: Record<string, string>
  created_at: string
}

const toolLabels: Record<string, string> = {
  title: 'Başlık Üretici',
  description: 'Video Açıklama',
  hook: 'Hook Jeneratörü',
  script: 'Script Yazarı',
  hashtag: 'Hashtag AI',
  'viral-score': 'Viral Skor',
  repurpose: 'İçerik Dönüştür',
  dubbing: 'Dublaj & Çeviri',
  ideas: 'İçerik Fikirleri',
  thumbnail: 'Thumbnail Konsepti',
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState('tümü')

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setEntries(d.history || [])
      })
      .catch(() => setError('Geçmiş yüklenemedi'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const tools = ['tümü', ...Array.from(new Set(entries.map((e) => e.tool)))]
  const filtered = filter === 'tümü' ? entries : entries.filter((e) => e.tool === filter)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Geçmiş" description="Daha önce üretilen içerikler" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">

          {loading && (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">Yükleniyor...</div>
          )}

          {error && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-amber-400 text-sm">
              {error === 'Yetkisiz'
                ? 'Geçmişi görmek için giriş yapman gerekiyor. Supabase yapılandırılmamışsa geçmiş kaydedilmez.'
                : error}
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tools.map((t) => (
                <button key={t} onClick={() => setFilter(t)}
                  className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                    filter === t ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-500 hover:text-zinc-300')}>
                  {t === 'tümü' ? 'Tümü' : (toolLabels[t] || t)}
                  {t === 'tümü' && <span className="ml-1 text-zinc-600">({entries.length})</span>}
                </button>
              ))}
            </div>
          )}

          {filtered.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 text-sm font-medium">{toolLabels[entry.tool] || entry.tool}</span>
                    <span className={cn('text-xs font-medium', getModelColor(entry.model as AIModel))}>
                      {getModelLabel(entry.model as AIModel)}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-xs">
                    {new Date(entry.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={entry.output} />
                  <button onClick={() => handleDelete(entry.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
                {entry.output}
              </p>
              {entry.input_data && Object.keys(entry.input_data).length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(entry.input_data).slice(0, 3).map(([k, v]) => (
                    <span key={k} className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded">
                      {k}: {String(v).slice(0, 30)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!loading && !error && entries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
              <History className="w-10 h-10 opacity-30" />
              <p className="text-sm">Henüz kaydedilmiş içerik yok</p>
              <p className="text-xs text-center max-w-xs">Supabase yapılandırıldığında ve giriş yapıldığında içerikler otomatik kaydedilir</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
