'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import TopBar from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import {
  Upload, Scissors, Download, Zap, CheckCircle,
  Loader2, AlertCircle, Film, TrendingUp, Sparkles,
} from 'lucide-react'
import type { ClipSuggestion } from '@/app/api/generate/clips/route'

// ─── Drawtext caption builder ─────────────────────────────────────────────────
// Groups words into ~5-word chunks, generates FFmpeg drawtext filter per chunk
function buildDrawtextFilter(words: ClipSuggestion['words'], clipStart: number): string {
  if (!words.length) return ''

  const escape = (t: string) =>
    t.replace(/\\/g, '\\\\').replace(/'/g, "’").replace(/:/g, '\\:').replace(/,/g, '\\,').replace(/%/g, '\\%')

  const chunks: Array<{ text: string; start: number; end: number }> = []
  const size = 5
  for (let i = 0; i < words.length; i += size) {
    const group = words.slice(i, i + size)
    chunks.push({
      text: group.map((w) => w.word).join(' '),
      start: Math.max(0, group[0].start - clipStart),
      end: group[group.length - 1].end - clipStart + 0.1,
    })
  }

  return chunks
    .map((c) => {
      const t = escape(c.text)
      return (
        `drawtext=text='${t}':fontsize=52:fontcolor=white:` +
        `x=(w-text_w)/2:y=h-220:` +
        `box=1:boxcolor=black@0.55:boxborderw=14:` +
        `enable='between(t,${c.start.toFixed(2)},${c.end.toFixed(2)})'`
      )
    })
    .join(',')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  return 'text-red-400'
}

type Step = 'idle' | 'audio' | 'transcribe' | 'analyze' | 'cut' | 'done' | 'error'
const stepOrder: Step[] = ['audio', 'transcribe', 'analyze', 'cut', 'done']
const STEPS: Array<{ key: Step; label: string; detail: string }> = [
  { key: 'audio',      label: 'Ses çıkarılıyor',   detail: 'FFmpeg · MP3 16kHz mono' },
  { key: 'transcribe', label: 'Transkripsiyon',     detail: 'Groq Whisper · Ücretsiz' },
  { key: 'analyze',    label: 'Viral analiz',       detail: 'Groq LLaMA 3.3 70B · Ücretsiz' },
  { key: 'cut',        label: 'Klip kesiliyor',     detail: 'FFmpeg WASM · Tarayıcıda' },
]

const catColors: Record<string, string> = {
  knowledge:     'bg-blue-500/20 text-blue-300',
  emotional:     'bg-pink-500/20 text-pink-300',
  shocking:      'bg-red-500/20 text-red-300',
  inspirational: 'bg-violet-500/20 text-violet-300',
  entertainment: 'bg-amber-500/20 text-amber-300',
  bilgi:         'bg-blue-500/20 text-blue-300',
  duygusal:      'bg-pink-500/20 text-pink-300',
  şok:           'bg-red-500/20 text-red-300',
  ilham:         'bg-violet-500/20 text-violet-300',
  eğlence:       'bg-amber-500/20 text-amber-300',
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClipGeneratorPage() {
  const [videoFile, setVideoFile]       = useState<File | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [step, setStep]                 = useState<Step>('idle')
  const [stepMsg, setStepMsg]           = useState('')
  const [clips, setClips]               = useState<ClipSuggestion[]>([])
  const [outputClips, setOutputClips]   = useState<Record<number, string>>({})
  const [cuttingId, setCuttingId]       = useState<number | null>(null)
  const [error, setError]               = useState('')
  const [ffmpegReady, setFfmpegReady]   = useState(false)
  const [ffmpegLoading, setFfmpegLoading] = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [detectedLang, setDetectedLang] = useState('')
  const [ffmpegLog, setFfmpegLog]       = useState('')

  const ffmpegRef = useRef<FFmpeg | null>(null)

  // ── FFmpeg WASM yükle (CDN, tek seferlik ~30MB) ───────────────────────────
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return
    setFfmpegLoading(true)
    try {
      const ffmpeg = new FFmpeg()
      ffmpeg.on('log', ({ message }) => setFfmpegLog(message))
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      ffmpegRef.current = ffmpeg
      setFfmpegReady(true)
    } catch {
      setError('FFmpeg yüklenemedi. İnternet bağlantısını kontrol et.')
    } finally {
      setFfmpegLoading(false)
    }
  }, [])

  useEffect(() => { loadFFmpeg() }, [loadFFmpeg])

  // ── Video seç ─────────────────────────────────────────────────────────────
  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Sadece video dosyası yükleyebilirsin.')
      return
    }
    setVideoFile(file)
    setClips([])
    setOutputClips({})
    setTranscript('')
    setDetectedLang('')
    setError('')
    setStep('idle')
    setFfmpegLog('')

    const url = URL.createObjectURL(file)
    const vid = document.createElement('video')
    vid.src = url
    vid.onloadedmetadata = () => { setVideoDuration(vid.duration); URL.revokeObjectURL(url) }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleVideoSelect(file)
  }

  // ── Ana analiz akışı ──────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setError('')
    setClips([])
    setOutputClips({})
    setFfmpegLog('')

    try {
      const ffmpeg = ffmpegRef.current

      // 1. Ses çıkar — 16kHz mono MP3 → küçük dosya (Groq limit: 25MB)
      setStep('audio')
      setStepMsg('Video\'dan ses çıkarılıyor...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '16000', '-ac', '1', '-b:a', '64k', 'audio.mp3'])

      const audioRaw  = await ffmpeg.readFile('audio.mp3') as Uint8Array
      const audioCopy = audioRaw.buffer.slice(audioRaw.byteOffset, audioRaw.byteOffset + audioRaw.byteLength) as ArrayBuffer
      const audioFile = new File([audioCopy], 'audio.mp3', { type: 'audio/mpeg' })

      // Groq 25MB limit kontrolü
      if (audioFile.size > 24 * 1024 * 1024) {
        throw new Error(`Ses dosyası çok büyük (${(audioFile.size / 1024 / 1024).toFixed(1)} MB). Video 60 dakikadan kısa olmalı.`)
      }

      // 2. Groq Whisper transkripsiyon
      setStep('transcribe')
      setStepMsg('Ses metne çevriliyor...')
      const fd = new FormData()
      fd.append('audio', audioFile)
      fd.append('videoDuration', String(videoDuration))

      const res  = await fetch('/api/generate/clips', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API hatası')

      // 3. Analiz tamamlandı
      setStep('analyze')
      setStepMsg('Viral kısımlar analiz ediliyor...')
      await new Promise((r) => setTimeout(r, 300))

      setClips(data.clips)
      setTranscript(data.fullTranscript)
      setDetectedLang(data.detectedLanguage || '')
      setStep('done')
      setStepMsg('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setStep('error')
    }
  }

  // ── Klip kes: 9:16 crop + drawtext captions + MP4 ────────────────────────
  const cutClip = async (clip: ClipSuggestion) => {
    if (!ffmpegRef.current || !videoFile) return
    setCuttingId(clip.id)
    setStep('cut')
    setStepMsg(`Klip #${clip.id} kesiliyor...`)
    setFfmpegLog('')

    try {
      const ffmpeg   = ffmpegRef.current
      const duration = clip.end - clip.start
      const outName  = `clip_${clip.id}.mp4`

      // 9:16 crop + scale + drawtext captions (libass gerekmez)
      const dtFilter   = buildDrawtextFilter(clip.words, clip.start)
      const cropScale  = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920'
      const vf         = dtFilter ? `${cropScale},${dtFilter}` : cropScale

      await ffmpeg.exec([
        '-ss', String(clip.start),
        '-i',  'input.mp4',
        '-t',  String(duration),
        '-vf', vf,
        '-c:v', 'libx264', '-crf', '22', '-preset', 'ultrafast',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        outName,
      ])

      const raw  = await ffmpeg.readFile(outName) as Uint8Array
      const copy = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer
      const blob = new Blob([copy], { type: 'video/mp4' })
      setOutputClips((prev) => ({ ...prev, [clip.id]: URL.createObjectURL(blob) }))
    } catch (err) {
      setError(`Klip #${clip.id} kesilirken hata: ${err instanceof Error ? err.message : 'bilinmeyen'}`)
    } finally {
      setCuttingId(null)
      setStep('done')
      setStepMsg('')
    }
  }

  const stepIdx  = stepOrder.indexOf(step)
  const isActive = step !== 'idle' && step !== 'done' && step !== 'error'

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Klip Üretici"
        description="Videodan viral 9:16 klipler — Reels · Shorts · TikTok"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 min-h-full">

          {/* ── Sol panel ───────────────────────────────────────────────── */}
          <div className="w-80 flex-shrink-0 space-y-4">

            {/* Free badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-400 text-xs font-medium">
                100% Ücretsiz — Groq Whisper + LLaMA 3.3 + FFmpeg
              </p>
            </div>

            {/* Upload */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('video-input')?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                videoFile ? 'border-violet-500/50 bg-violet-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30'
              )}
            >
              <input id="video-input" type="file" accept="video/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])} />
              <Film className={cn('w-8 h-8 mx-auto mb-2', videoFile ? 'text-violet-400' : 'text-zinc-600')} />
              {videoFile ? (
                <>
                  <p className="text-zinc-200 text-sm font-medium truncate">{videoFile.name}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {videoDuration > 0 ? `${Math.floor(videoDuration / 60)}:${String(Math.round(videoDuration % 60)).padStart(2, '0')}` : '—'}
                    {' · '}{(videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-zinc-400 text-sm">Video sürükle veya tıkla</p>
                  <p className="text-zinc-600 text-xs mt-1">MP4 · MOV · AVI · MKV</p>
                </>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!videoFile || !ffmpegReady || isActive}
              className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isActive
                ? <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</>
                : <><Zap className="w-4 h-4" /> Viral Kısımları Bul</>
              }
            </button>

            {/* FFmpeg status */}
            {ffmpegLoading && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                FFmpeg yükleniyor (~30 MB, bir kere)...
              </div>
            )}
            {ffmpegReady && !ffmpegLoading && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs">
                <CheckCircle className="w-3 h-3" /> FFmpeg WASM hazır
              </div>
            )}
            {stepMsg && (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-400 text-xs">
                {stepMsg}
              </div>
            )}

            {/* Progress steps */}
            {step !== 'idle' && (
              <div className="space-y-2.5 pt-1">
                {STEPS.map((s, i) => {
                  const sIdx     = stepOrder.indexOf(s.key)
                  const isDone   = stepIdx > sIdx
                  const isCurrent = stepOrder[stepIdx] === s.key
                  return (
                    <div key={s.key} className="flex items-start gap-2.5">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 transition-colors',
                        isDone    ? 'bg-emerald-500 text-white' :
                        isCurrent ? 'bg-violet-500 text-white'  : 'bg-zinc-800 text-zinc-600'
                      )}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('text-xs font-medium',
                            isDone    ? 'text-emerald-400' :
                            isCurrent ? 'text-violet-300'  : 'text-zinc-600'
                          )}>{s.label}</span>
                          {isCurrent && <Loader2 className="w-3 h-3 animate-spin text-violet-400 flex-shrink-0" />}
                        </div>
                        <p className="text-zinc-600 text-[10px]">{s.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* FFmpeg live log */}
            {ffmpegLog && (step === 'audio' || step === 'cut') && (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2">
                <p className="text-zinc-600 text-[10px] font-mono truncate">{ffmpegLog}</p>
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Transkript</p>
                  {detectedLang && (
                    <span className="text-zinc-600 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{detectedLang}</span>
                  )}
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-5">{transcript}</p>
              </div>
            )}
          </div>

          {/* ── Sağ panel: klip kartları ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm flex gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {clips.length > 0 && (
              <div className="space-y-4">
                <p className="text-zinc-400 text-sm">
                  <span className="text-violet-400 font-semibold">{clips.length}</span> viral klip bulundu
                  <span className="text-zinc-600"> — "Kes & İndir" ile 9:16 MP4 al, burned-in caption dahil</span>
                </p>

                {clips.map((clip) => {
                  const isProcessing = cuttingId === clip.id
                  const isReady      = !!outputClips[clip.id]
                  const dur          = Math.round(clip.end - clip.start)

                  return (
                    <div key={clip.id} className={cn(
                      'rounded-xl border p-4 transition-colors',
                      isReady ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-700/50 bg-zinc-800/50'
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Meta row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-zinc-600 text-xs font-mono">#{clip.id}</span>
                            {clip.category && (
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium',
                                catColors[clip.category] ?? 'bg-zinc-700 text-zinc-300')}>
                                {clip.category}
                              </span>
                            )}
                            <span className="text-zinc-600 text-xs ml-auto">
                              {clip.start.toFixed(1)}s–{clip.end.toFixed(1)}s · {dur}s
                            </span>
                          </div>

                          <h3 className="text-zinc-100 font-semibold text-sm mb-1">{clip.title}</h3>
                          <p className="text-zinc-500 text-xs mb-1.5 italic line-clamp-1">"{clip.hook}"</p>
                          <p className="text-zinc-500 text-xs leading-relaxed">{clip.reason}</p>
                        </div>

                        {/* Viral score */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={cn('text-lg font-bold', scoreColor(clip.viralScore))}>
                            {clip.viralScore}
                          </div>
                          <TrendingUp className={cn('w-3.5 h-3.5', scoreColor(clip.viralScore))} />
                          <div className="h-12 w-2 rounded-full bg-zinc-800 overflow-hidden flex flex-col-reverse">
                            <div
                              className={cn('w-full rounded-full transition-all',
                                clip.viralScore >= 80 ? 'bg-emerald-500' :
                                clip.viralScore >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                              style={{ height: `${clip.viralScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="mt-3 pt-3 border-t border-zinc-700/50">
                        {!isReady ? (
                          <button
                            onClick={() => cutClip(clip)}
                            disabled={isProcessing || cuttingId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessing
                              ? <><Loader2 className="w-3 h-3 animate-spin" /> Kesiliyor...</>
                              : <><Scissors className="w-3 h-3" /> Kes &amp; İndir</>}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <a
                              href={outputClips[clip.id]}
                              download={`viral_clip_${clip.id}_${clip.title.replace(/\s+/g, '_').slice(0, 30)}.mp4`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                            >
                              <Download className="w-3 h-3" /> İndir MP4 (9:16)
                            </a>
                            <video
                              src={outputClips[clip.id]}
                              controls
                              className="rounded-lg bg-black mx-auto block"
                              style={{ height: '18rem', width: 'auto', aspectRatio: '9/16' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!clips.length && step !== 'error' && (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <Upload className="w-10 h-10 text-zinc-800" />
                <p className="text-zinc-600 text-sm">Video yükle, viral kısımları bul</p>
                <div className="flex items-center gap-3 text-zinc-700 text-xs">
                  <span>Groq Whisper</span>
                  <span>→</span>
                  <span>LLaMA 3.3 70B</span>
                  <span>→</span>
                  <span>FFmpeg 9:16</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
