'use client'

import { useState, useRef } from 'react'
import { useModel } from '@/lib/context/ModelContext'
import TopBar from '@/components/layout/TopBar'
import ModelSelector from '@/components/layout/ModelSelector'
import CopyButton from '@/components/ui/CopyButton'
import LoadingState from '@/components/ui/LoadingState'
import { TTSVoice, TTSModel, DubbingLanguage } from '@/types'
import { cn } from '@/lib/utils'
import { Play, Pause, Download, Volume2, Languages } from 'lucide-react'

// ─── TTS ────────────────────────────────────────────────────────────────────

const VOICES: { id: TTSVoice; label: string; desc: string; gender: string }[] = [
  { id: 'nova',    label: 'Nova',    desc: 'Yumuşak, sıcak',   gender: 'Kadın'  },
  { id: 'shimmer', label: 'Shimmer', desc: 'Zarif, nüanslı',   gender: 'Kadın'  },
  { id: 'alloy',   label: 'Alloy',   desc: 'Nötr, dengeli',    gender: 'Nötr'   },
  { id: 'fable',   label: 'Fable',   desc: 'Anlatıcı tarzı',   gender: 'Nötr'   },
  { id: 'echo',    label: 'Echo',    desc: 'Net, profesyonel',  gender: 'Erkek'  },
  { id: 'onyx',    label: 'Onyx',    desc: 'Derin, otoriter',  gender: 'Erkek'  },
]

const TTS_MODELS: { id: TTSModel; label: string; desc: string }[] = [
  { id: 'tts-1',    label: 'Standart', desc: 'Hızlı, düşük gecikme' },
  { id: 'tts-1-hd', label: 'HD',       desc: 'Yüksek kalite'        },
]

function TTSTab() {
  const [text, setText]           = useState('')
  const [voice, setVoice]         = useState<TTSVoice>('nova')
  const [ttsModel, setTtsModel]   = useState<TTSModel>('tts-1-hd')
  const [loading, setLoading]     = useState(false)
  const [audioUrl, setAudioUrl]   = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError]         = useState('')
  const [fallbackNotice, setFallbackNotice] = useState('')
  const [usedBrowserSpeech, setUsedBrowserSpeech] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speakWithBrowser = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'tr-TR'
    utterance.rate = 1
    utterance.pitch = voice === 'onyx' || voice === 'echo' ? 0.85 : 1.05
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => {
      setIsPlaying(false)
      setError('Tarayici seslendirme hatasi. Cihazin Speech API destegini kontrol et.')
    }
    window.speechSynthesis.speak(utterance)
    setUsedBrowserSpeech(true)
    setIsPlaying(true)
    return true
  }

  const handleGenerate = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setFallbackNotice('')
    setUsedBrowserSpeech(false)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/generate/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, model: ttsModel }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (err) {
      if (speakWithBrowser()) {
        setFallbackNotice('OpenAI TTS kullanilamadi; ucretsiz tarayici Speech API ile seslendiriliyor. Bu modda MP3 indirme yok.')
      } else {
        setError(err instanceof Error ? err.message : 'Ses uretim hatasi')
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePlay = () => {
    if (usedBrowserSpeech) {
      if (isPlaying) {
        window.speechSynthesis.pause()
      } else {
        window.speechSynthesis.resume()
      }
      setIsPlaying(!isPlaying)
      return
    }
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `dubbing-${voice}.mp3`
    a.click()
  }

  const charCount = text.length
  const CHUNK_SIZE = 4000

  return (
    <div className="flex gap-6 p-6">
      {/* Form */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-zinc-400 text-xs font-medium">Metin</label>
            <span className="text-zinc-600 text-xs">
              {charCount} karakter
              {charCount > CHUNK_SIZE && <span className="text-amber-400 ml-1">· {Math.ceil(charCount / CHUNK_SIZE)} parça</span>}
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Seslendirilecek metni buraya yaz veya script'ten yapıştır... (sınır yok)"
            rows={8}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-medium mb-2">Ses / Karakter</label>
          <div className="grid grid-cols-2 gap-1.5">
            {VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVoice(v.id)}
                className={cn(
                  'flex flex-col items-start px-3 py-2 rounded-lg border transition-all text-left',
                  voice === v.id
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                )}
              >
                <span className="text-xs font-semibold">{v.label}</span>
                <span className="text-[10px] opacity-60">{v.gender} · {v.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 text-xs font-medium mb-2">Kalite</label>
          <div className="grid grid-cols-2 gap-1.5">
            {TTS_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTtsModel(m.id)}
                className={cn(
                  'flex flex-col items-start px-3 py-2 rounded-lg border transition-all text-left',
                  ttsModel === m.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                )}
              >
                <span className="text-xs font-semibold">{m.label}</span>
                <span className="text-[10px] opacity-60">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Volume2 className="w-4 h-4" />
          {loading ? 'Ses üretiliyor...' : 'Ses Üret'}
        </button>
      </div>

      {/* Player */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
        {fallbackNotice && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-amber-500 text-sm">
            {fallbackNotice}
          </div>
        )}
        {loading && (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6">
            <LoadingState />
            <p className="text-zinc-500 text-xs mt-2 px-4">OpenAI TTS ile ses sentezleniyor...</p>
          </div>
        )}

        {audioUrl && !loading && (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-zinc-200 font-medium text-sm">Ses Hazır</h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Ses: <span className="text-violet-400">{VOICES.find((v) => v.id === voice)?.label}</span>
                  {' · '}
                  Kalite: <span className="text-emerald-400">{TTS_MODELS.find((m) => m.id === ttsModel)?.label}</span>
                </p>
              </div>
            </div>

            {/* Waveform placeholder + controls */}
            <div className="bg-zinc-900 rounded-lg p-4 flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-violet-500 hover:bg-violet-600 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </button>
              <div className="flex-1 h-8 flex items-center gap-0.5">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-violet-500/40 rounded-full"
                    style={{ height: `${20 + Math.sin(i * 0.7) * 15 + Math.random() * 10}px` }}
                  />
                ))}
              </div>
            </div>

            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-medium hover:bg-zinc-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                MP3 İndir
              </button>
            </div>
          </div>
        )}

        {usedBrowserSpeech && !loading && !audioUrl && !error && (
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 space-y-5">
            <div>
              <h3 className="text-zinc-200 font-medium text-sm">Tarayici Sesi Calisiyor</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Ucretsiz Speech API ile anlik oynatma. MP3 indirme icin OpenAI TTS gerekir.</p>
            </div>
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Duraklat' : 'Devam Et'}
            </button>
          </div>
        )}

        {!loading && !audioUrl && !error && !usedBrowserSpeech && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
            <Volume2 className="w-10 h-10 opacity-30" />
            <p className="text-sm">Metni gir, ses karakterini seç ve üret butonuna tıkla</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TRANSLATE ───────────────────────────────────────────────────────────────

const LANGUAGES: { id: DubbingLanguage; label: string; flag: string }[] = [
  { id: 'english',    label: 'İngilizce',  flag: '🇬🇧' },
  { id: 'german',     label: 'Almanca',    flag: '🇩🇪' },
  { id: 'french',     label: 'Fransızca',  flag: '🇫🇷' },
  { id: 'spanish',    label: 'İspanyolca', flag: '🇪🇸' },
  { id: 'arabic',     label: 'Arapça',     flag: '🇸🇦' },
  { id: 'japanese',   label: 'Japonca',    flag: '🇯🇵' },
  { id: 'korean',     label: 'Korece',     flag: '🇰🇷' },
  { id: 'russian',    label: 'Rusça',      flag: '🇷🇺' },
  { id: 'portuguese', label: 'Portekizce', flag: '🇵🇹' },
  { id: 'italian',    label: 'İtalyanca',  flag: '🇮🇹' },
]

interface TranslationResult {
  ceviri: string
  bolumler: Array<{
    orijinal: string
    ceviri: string
    telaffuz?: string
    zamanlama?: string
    not?: string
  }>
  kulturel_notlar: string[]
  genel_yonerge: string
}

function TranslateTab() {
  const { selectedModel, setSelectedModel } = useModel()
  const [content, setContent]                       = useState('')
  const [targetLang, setTargetLang]                 = useState<DubbingLanguage>('english')
  const [includePronunciation, setIncludePronunciation] = useState(true)
  const [includeTimingNotes, setIncludeTimingNotes]     = useState(true)
  const [includeCulturalNotes, setIncludeCulturalNotes] = useState(true)
  const [loading, setLoading]                       = useState(false)
  const [result, setResult]                         = useState<TranslationResult | null>(null)
  const [error, setError]                           = useState('')
  const [expandedIdx, setExpandedIdx]               = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          sourceLang: 'Türkçe',
          targetLang,
          model: selectedModel,
          includePronunciation,
          includeTimingNotes,
          includeCulturalNotes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.translation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Çeviri hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-6 p-6">
      {/* Form */}
      <div className="w-80 flex-shrink-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-1.5">Script / İçerik (Türkçe)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Çevrilecek script veya içeriği buraya yapıştır..."
              rows={8}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-medium mb-2">Hedef Dil</label>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTargetLang(lang.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all',
                    targetLang === lang.id
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-zinc-400 text-xs font-medium">Ekstra Notlar</label>
            {[
              { key: 'pronunciation', label: 'Telaffuz Rehberi', state: includePronunciation, set: setIncludePronunciation },
              { key: 'timing',        label: 'Zamanlama Notları', state: includeTimingNotes,   set: setIncludeTimingNotes   },
              { key: 'cultural',      label: 'Kültürel Uyarlama', state: includeCulturalNotes, set: setIncludeCulturalNotes },
            ].map(({ key, label, state, set }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500" />
                <span className="text-zinc-400 text-sm">{label}</span>
              </label>
            ))}
          </div>

          <ModelSelector value={selectedModel} onChange={setSelectedModel} />

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Languages className="w-4 h-4" />
            {loading ? 'Çevriliyor...' : 'Çevir & Dublaj Notu Üret'}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>
        )}
        {loading && <LoadingState model={selectedModel} />}

        {result && !loading && (
          <>
            {/* Full translation */}
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-zinc-200 font-medium text-sm">
                  Çeviri — {LANGUAGES.find((l) => l.id === targetLang)?.flag}{' '}
                  {LANGUAGES.find((l) => l.id === targetLang)?.label}
                </h3>
                <CopyButton text={result.ceviri} />
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{result.ceviri}</p>
            </div>

            {/* General voiceover guidance */}
            {result.genel_yonerge && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-violet-400 text-xs font-semibold mb-1">Seslendirme Yönergesi</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{result.genel_yonerge}</p>
              </div>
            )}

            {/* Cultural notes */}
            {result.kulturel_notlar?.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-amber-400 text-xs font-semibold mb-2">Kültürel Uyarlama Notları</p>
                <ul className="space-y-1">
                  {result.kulturel_notlar.map((note, i) => (
                    <li key={i} className="text-zinc-300 text-xs flex gap-2">
                      <span className="text-amber-500 flex-shrink-0">•</span>{note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Segments */}
            {result.bolumler?.length > 0 && (
              <div className="space-y-2">
                <p className="text-zinc-400 text-xs font-medium">Bölüm Bazında Dublaj Notları</p>
                {result.bolumler.map((b, i) => (
                  <div key={i} className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-zinc-700/30 transition-colors"
                    >
                      <span className="text-zinc-600 text-xs mt-0.5 w-5 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-400 text-xs truncate">{b.orijinal}</p>
                        <p className="text-zinc-200 text-sm mt-0.5 truncate">{b.ceviri}</p>
                      </div>
                      <span className="text-zinc-600 text-xs flex-shrink-0">{expandedIdx === i ? '▲' : '▼'}</span>
                    </button>
                    {expandedIdx === i && (
                      <div className="border-t border-zinc-700/50 px-4 pb-4 pt-3 space-y-2">
                        {b.telaffuz && (
                          <p className="text-xs"><span className="text-blue-400 font-medium">Telaffuz: </span><span className="text-zinc-300">{b.telaffuz}</span></p>
                        )}
                        {b.zamanlama && (
                          <p className="text-xs"><span className="text-emerald-400 font-medium">Zamanlama: </span><span className="text-zinc-300">{b.zamanlama}</span></p>
                        )}
                        {b.not && (
                          <p className="text-xs"><span className="text-amber-400 font-medium">Not: </span><span className="text-zinc-300">{b.not}</span></p>
                        )}
                        <CopyButton text={b.ceviri} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-600">
            <Languages className="w-10 h-10 opacity-30" />
            <p className="text-sm">Script'i yapıştır, dili seç ve çevir</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

type Tab = 'tts' | 'translate'

export default function DubbingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tts')

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dublaj & Çeviri" description="Ses üretimi ve çok dilli script dönüşümü" />

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-zinc-800">
        {([
          { id: 'tts',       label: '🎙️ Metin → Ses (TTS)'        },
          { id: 'translate', label: '🌍 Dil Dönüşümü & Dublaj Notu' },
        ] as { id: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-violet-300 border-violet-500 bg-violet-500/5'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tts'       && <TTSTab />}
        {activeTab === 'translate' && <TranslateTab />}
      </div>
    </div>
  )
}
