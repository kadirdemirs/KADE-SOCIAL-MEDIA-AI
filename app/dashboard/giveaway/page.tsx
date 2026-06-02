'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn, copyToClipboard } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

type Platform = 'instagram' | 'youtube' | 'tiktok' | 'twitter'

interface GiveawayCalendar {
  duyuru: string
  hatirlat: string
  kazanan: string
}

interface GiveawayResult {
  duyuru_postu: string
  hikaye_metni: string
  katilim_kosullari: string[]
  dm_sablonu: string
  takvim: GiveawayCalendar
}

const platformLabels: Record<Platform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'Twitter/X',
}

export default function GiveawayPage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [prize, setPrize] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [requirements, setRequirements] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GiveawayResult | null>(null)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prize.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prize, platform, requirements, endDate, model: selectedModel }),
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
      <TopBar title="Çekiliş Planlayıcı" description="Çekiliş duyurusu ve katılım metinleri oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Ödül</label>
                <input value={prize} onChange={(e) => setPrize(e.target.value)}
                  placeholder="Çekiliş ödülü..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(platformLabels) as Platform[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors',
                        platform === p ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {platformLabels[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Katılım Koşulları <span className="text-zinc-600">(opsiyonel)</span></label>
                <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Özel katılım şartları..." rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Bitiş Tarihi <span className="text-zinc-600">(opsiyonel)</span></label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500" />
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !prize.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Çekiliş İçeriği Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Duyuru Postu</p>
                    <button onClick={() => handleCopy(result.duyuru_postu, 'duyuru')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                      {copiedField === 'duyuru' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{result.duyuru_postu}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-zinc-400 text-xs font-semibold">Hikaye Metni</p>
                      <button onClick={() => handleCopy(result.hikaye_metni, 'hikaye')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                        {copiedField === 'hikaye' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">{result.hikaye_metni}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-zinc-400 text-xs font-semibold">DM Şablonu</p>
                      <button onClick={() => handleCopy(result.dm_sablonu, 'dm')} className="text-zinc-500 hover:text-violet-400 transition-colors">
                        {copiedField === 'dm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">{result.dm_sablonu}</p>
                  </div>
                </div>
                {result.katilim_kosullari?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-emerald-400 text-xs font-semibold mb-2">Katılım Koşulları</p>
                    <ol className="space-y-1">
                      {result.katilim_kosullari.map((k, i) => (
                        <li key={i} className="text-zinc-300 text-xs flex gap-2">
                          <span className="text-emerald-400 font-bold">{i + 1}.</span>{k}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {result.takvim && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Yayın Takvimi</p>
                    <div className="space-y-1.5">
                      <div className="flex gap-2 text-xs"><span className="text-zinc-500 w-20">Duyuru:</span><span className="text-zinc-300">{result.takvim.duyuru}</span></div>
                      <div className="flex gap-2 text-xs"><span className="text-zinc-500 w-20">Hatırlatma:</span><span className="text-zinc-300">{result.takvim.hatirlat}</span></div>
                      <div className="flex gap-2 text-xs"><span className="text-zinc-500 w-20">Kazanan:</span><span className="text-zinc-300">{result.takvim.kazanan}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Ödülü gir ve çekiliş içeriği oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
