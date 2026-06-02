'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import TopBar from '@/components/layout/TopBar'
import { cn, copyToClipboard } from '@/lib/utils'
import { Upload, Download, Loader2, CheckCircle, Copy, Check } from 'lucide-react'

interface SubtitleResult {
  srt: string
  transcript: string
  wordCount: number
}

export default function SubtitlePage() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('auto')
  const [chunkSize, setChunkSize] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SubtitleResult | null>(null)
  const [error, setError] = useState('')
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const [ffmpegLoading, setFfmpegLoading] = useState(false)
  const [step, setStep] = useState('')
  const [srtCopied, setSrtCopied] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return
    setFfmpegLoading(true)
    try {
      const ffmpeg = new FFmpeg()
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

  const handleAnalyze = async () => {
    if (!file || !ffmpegRef.current) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const ffmpeg = ffmpegRef.current
      setStep('Ses çıkarılıyor...')
      const ext = file.name.split('.').pop() || 'mp4'
      await ffmpeg.writeFile(`input.${ext}`, await fetchFile(file))
      await ffmpeg.exec(['-i', `input.${ext}`, '-vn', '-ar', '16000', '-ac', '1', '-b:a', '64k', 'audio.mp3'])
      const audioRaw = await ffmpeg.readFile('audio.mp3') as Uint8Array
      const audioCopy = audioRaw.buffer.slice(audioRaw.byteOffset, audioRaw.byteOffset + audioRaw.byteLength) as ArrayBuffer
      const audioFile = new File([audioCopy], 'audio.mp3', { type: 'audio/mpeg' })
      setStep('Altyazı oluşturuluyor...')
      const fd = new FormData()
      fd.append('audio', audioFile)
      fd.append('language', language)
      fd.append('chunkSize', String(chunkSize))
      const res = await fetch('/api/generate/subtitle', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  const downloadSrt = () => {
    if (!result) return
    const blob = new Blob([result.srt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'subtitle'}.srt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Altyazı Üretici" description="Video/ses dosyasından otomatik SRT altyazı oluştur" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0 space-y-4">
            <div
              onClick={() => document.getElementById('subtitle-input')?.click()}
              className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                file ? 'border-violet-500/50 bg-violet-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30')}>
              <input id="subtitle-input" type="file" accept="video/*,audio/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setResult(null); setError('') } }} />
              <Upload className={cn('w-8 h-8 mx-auto mb-2', file ? 'text-violet-400' : 'text-zinc-600')} />
              {file ? (
                <><p className="text-zinc-200 text-sm font-medium truncate">{file.name}</p>
                  <p className="text-zinc-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p></>
              ) : (
                <><p className="text-zinc-400 text-sm">Video veya ses dosyası seç</p>
                  <p className="text-zinc-600 text-xs mt-1">MP4 · MP3 · WAV · MOV</p></>
              )}
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Dil</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500">
                <option value="auto">Otomatik Algıla</option>
                <option value="tr">Türkçe</option>
                <option value="en">İngilizce</option>
                <option value="de">Almanca</option>
                <option value="fr">Fransızca</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Satır Başına Kelime: <span className="text-violet-400">{chunkSize}</span></label>
              <input type="range" min={3} max={8} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full accent-violet-500" />
              <div className="flex justify-between text-zinc-600 text-xs mt-0.5"><span>3</span><span>8</span></div>
            </div>
            {ffmpegLoading && <div className="flex items-center gap-2 text-zinc-500 text-xs"><Loader2 className="w-3 h-3 animate-spin" />FFmpeg yükleniyor...</div>}
            {ffmpegReady && !ffmpegLoading && <div className="flex items-center gap-2 text-emerald-500 text-xs"><CheckCircle className="w-3 h-3" />FFmpeg hazır</div>}
            <button onClick={handleAnalyze} disabled={!file || !ffmpegReady || loading}
              className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{step || 'İşleniyor...'}</> : 'Altyazı Oluştur'}
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">{error}</div>}
            {result && !loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-sm font-semibold">{result.wordCount} kelime</span>
                    <span className="text-zinc-600 text-xs">altyazı oluşturuldu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => { await copyToClipboard(result.srt); setSrtCopied(true); setTimeout(() => setSrtCopied(false), 2000) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs hover:text-zinc-200 transition-colors border border-zinc-700">
                      {srtCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Kopyala
                    </button>
                    <button onClick={downloadSrt}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs hover:bg-violet-500/30 transition-colors border border-violet-500/30">
                      <Download className="w-3.5 h-3.5" />.srt İndir
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                  <p className="text-zinc-400 text-xs font-semibold mb-2">SRT İçeriği</p>
                  <textarea readOnly value={result.srt} rows={16}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono resize-none focus:outline-none" />
                </div>
                {result.transcript && (
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
                    <p className="text-zinc-400 text-xs font-semibold mb-2">Transkript</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{result.transcript}</p>
                  </div>
                )}
              </div>
            )}
            {!loading && !result && !error && (
              <div className="flex items-center justify-center h-64 text-zinc-600 text-sm">
                Dosya yükle ve altyazı oluştur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
