'use client'

import { useState } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import LoadingState from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Lesson {
  baslik: string
  sure: string
  tip: string
}

interface Module {
  baslik: string
  aciklama: string
  dersler: Lesson[]
}

interface CourseResult {
  kurs_adi: string
  alt_baslik: string
  moduller: Module[]
  fiyat_onerisi: string
  pazarlama_hooks: string[]
}

export default function CoursePage() {
  const { selectedModel, setSelectedModel } = useModel()
  const [topic, setTopic] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [level, setLevel] = useState('başlangıç')
  const [duration, setDuration] = useState('4 hafta')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CourseResult | null>(null)
  const [error, setError] = useState('')
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]))

  const toggleModule = (i: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, targetAudience, level, duration, model: selectedModel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setOpenModules(new Set([0]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Kurs Tasarımcısı" description="Çevrimiçi kurs müfredatı ve modülleri oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Kurs Konusu</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Kursun konusu..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Hedef Kitle</label>
                <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Kimler için bu kurs?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Seviye</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['başlangıç', 'orta', 'ileri'].map((l) => (
                    <button key={l} type="button" onClick={() => setLevel(l)}
                      className={cn('py-1.5 px-2 rounded-lg text-xs font-medium transition-colors capitalize',
                        level === l ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Süre</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                  <option value="1 hafta">1 hafta</option>
                  <option value="2 hafta">2 hafta</option>
                  <option value="4 hafta">4 hafta</option>
                  <option value="8 hafta">8 hafta</option>
                  <option value="12 hafta">12 hafta</option>
                </select>
              </div>
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <button type="submit" disabled={loading || !topic.trim()}
                className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Oluşturuluyor...' : 'Kurs Oluştur'}
              </button>
            </form>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {loading && <LoadingState model={selectedModel} />}
            {result && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                  <h2 className="text-zinc-100 text-lg font-bold">{result.kurs_adi}</h2>
                  <p className="text-zinc-400 text-sm mt-1">{result.alt_baslik}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-emerald-400 text-sm font-semibold">{result.fiyat_onerisi}</span>
                    <span className="text-zinc-600 text-xs">önerilen fiyat</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.moduller?.map((mod, i) => (
                    <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                      <button onClick={() => toggleModule(i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800 transition-colors">
                        <div>
                          <p className="text-zinc-100 text-sm font-semibold">Modül {i + 1}: {mod.baslik}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">{mod.aciklama}</p>
                        </div>
                        {openModules.has(i) ? <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          : <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
                      </button>
                      {openModules.has(i) && (
                        <div className="border-t border-zinc-700/50 p-4 space-y-2">
                          {mod.dersler?.map((lesson, j) => (
                            <div key={j} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-600 text-xs w-5">{j + 1}.</span>
                                <span className="text-zinc-300 text-sm">{lesson.baslik}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-600 text-xs">{lesson.sure}</span>
                                <span className="text-violet-400 text-[10px] bg-violet-500/10 px-1.5 py-0.5 rounded">{lesson.tip}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {result.pazarlama_hooks?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2">Pazarlama Hook'ları</p>
                    <ul className="space-y-1.5">
                      {result.pazarlama_hooks.map((hook, i) => (
                        <li key={i} className="text-zinc-300 text-xs leading-relaxed flex gap-2">
                          <span className="text-amber-500 flex-shrink-0">→</span>{hook}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Kurs konusunu gir ve müfredat oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
