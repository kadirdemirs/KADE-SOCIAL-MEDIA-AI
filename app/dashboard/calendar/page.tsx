'use client'

import { useState } from 'react'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import { Platform } from '@/types'
import { getPlatformLabel, cn } from '@/lib/utils'
import TopBar from '@/components/layout/TopBar'

interface CalendarEntry {
  id: string
  date: string
  title: string
  platform: Platform
  status: 'taslak' | 'hazır' | 'yayında'
}

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'x', 'linkedin']

const statusColors = {
  taslak: 'bg-zinc-700 text-zinc-300',
  hazır: 'bg-amber-500/20 text-amber-300',
  yayında: 'bg-emerald-500/20 text-emerald-300',
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([
    { id: '1', date: new Date().toISOString().split('T')[0], title: 'Örnek Video Başlığı', platform: 'youtube', status: 'taslak' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newEntry, setNewEntry] = useState({ date: '', title: '', platform: 'youtube' as Platform })

  const addEntry = () => {
    if (!newEntry.date || !newEntry.title) return
    setEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newEntry, status: 'taslak' },
    ])
    setNewEntry({ date: '', title: '', platform: 'youtube' })
    setShowForm(false)
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const cycleStatus = (id: string) => {
    const statuses: CalendarEntry['status'][] = ['taslak', 'hazır', 'yayında']
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const nextIdx = (statuses.indexOf(e.status) + 1) % statuses.length
        return { ...e, status: statuses[nextIdx] }
      })
    )
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="flex flex-col h-full">
      <TopBar title="İçerik Takvimi" description="Yayın planını oluştur ve organize et" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-zinc-300 text-sm font-medium">{entries.length} içerik planlandı</h2>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors">
              <Plus className="w-4 h-4" />
              İçerik Ekle
            </button>
          </div>

          {showForm && (
            <div className="rounded-xl border border-violet-500/30 bg-zinc-800/50 p-5 space-y-4">
              <h3 className="text-zinc-200 font-medium text-sm">Yeni İçerik</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Yayın Tarihi</label>
                  <input type="date" value={newEntry.date} onChange={(e) => setNewEntry((p) => ({ ...p, date: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Platform</label>
                  <select value={newEntry.platform} onChange={(e) => setNewEntry((p) => ({ ...p, platform: e.target.value as Platform }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                    {platforms.map((p) => <option key={p} value={p}>{getPlatformLabel(p)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs mb-1">İçerik Başlığı</label>
                <input value={newEntry.title} onChange={(e) => setNewEntry((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Video veya post başlığı"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={addEntry} className="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors">Ekle</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-600 transition-colors">İptal</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {sorted.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                <div className="flex items-center gap-2 w-28 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-zinc-400 text-xs">{entry.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm truncate">{entry.title}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{getPlatformLabel(entry.platform)}</p>
                </div>
                <button onClick={() => cycleStatus(entry.id)}
                  className={cn('text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors', statusColors[entry.status])}>
                  {entry.status}
                </button>
                <button onClick={() => deleteEntry(entry.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
                Henüz içerik planlanmadı. "İçerik Ekle" butonuna tıkla.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
