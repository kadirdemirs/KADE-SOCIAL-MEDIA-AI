'use client'

import { useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import { cn, copyToClipboard } from '@/lib/utils'
import { Upload, Download, Loader2, Copy, Check } from 'lucide-react'

interface SubtitleResult { srt: string; transcript: string; wordCount: number }

// Web Audio API ile ses çıkarma (FFmpeg yok, indirme yok)
function encodeWAV(buffer: AudioBuffer): Blob {
  const ns = buffer.length; const sr = buffer.sampleRate
  const data = new Int16Array(ns)
  const ch = buffer.getChannelData(0)
  for (let i = 0; i < ns; i++) { const s = Math.max(-1, Math.min(1, ch[i])); data[i] = s < 0 ? s * 0x8000 : s * 0x7fff }
  const hdr = new ArrayBuffer(44); const v = new DataView(hdr)
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + data.byteLength, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, data.byteLength, true)
  const out = new Uint8Array(44 + data.byteLength); out.set(new Uint8Array(hdr)); out.set(new Uint8Array(data.buffer), 44)
  return new Blob([out], { type: 'audio/wav' })
}

async function extractAudio(file: File, onMsg: (m: string) => void): Promise<File> {
  // Ses dosyası ise direkt gönder (dönüştürme yok)
  if (file.type.startsWith('audio/') && (file.type.includes('mpeg') || file.type.includes('mp3') || file.type.includes('wav') || file.type.includes('ogg'))) {
    onMsg('Ses dosyası hazırlanıyor...')
    return file
  }
  onMsg('Ses kanalı ayrıştırılıyor...')
  const ab = await file.arrayBuffer()
  const tmpCtx = new AudioContext()
  let original: AudioBuffer
  try { original = await tmpCtx.decodeAudioData(ab) }
  catch { throw new Error('Dosya formatı desteklenmiyor. MP4, MOV, MP3 veya WAV kullan.') }
  finally { await tmpCtx.close() }
  onMsg('16 kHz\'e dönüştürülüyor...')
  const SR = 16000
  const offline = new OfflineAudioContext(1, Math.ceil(original.duration * SR), SR)
  const src = offline.createBufferSource(); src.buffer = original; src.connect(offline.destination); src.start(0)
  const resampled = await offline.startRendering()
  onMsg('WAV oluşturuluyor...')
  return new File([encodeWAV(resampled)], 'audio.wav', { type: 'audio/wav' })
}

export default function SubtitlePage() {
  const [file, setFile]         = useState<File | null>(null)
  const [language, setLanguage] = useState('auto')
  const [chunkSize, setChunkSize] = useState(5)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<SubtitleResult | null>(null)
  const [error, setError]       = useState('')
  const [step, setStep]         = useState('')
  const [srtCopied, setSrtCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true); setError(''); setResult(null)
    try {
      const audioFile = await extractAudio(file, setStep)
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
      setLoading(false); setStep('')
    }
  }

  const downloadSrt = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([result.srt], { type: 'text/plain' }))
    a.download = `${file?.name.replace(/\.[^.]+$/, '') || 'subtitle'}.srt`
    a.click()
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Altyazı Üretici" description="Video/ses dosyasından otomatik SRT altyazı — FFmpeg gerekmez" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-6 p-6 h-full">
          <div className="w-80 flex-shrink-0 space-y-4">
            <div onClick={() => document.getElementById('subtitle-input')?.click()}
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
                  <p className="text-zinc-600 text-xs mt-1">MP4 · MOV · MP3 · WAV — Boyut sınırı yok</p></>
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
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                Satır Başına Kelime: <span className="text-violet-400">{chunkSize}</span>
              </label>
              <input type="range" min={3} max={8} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))}
                className="w-full accent-violet-500" />
              <div className="flex justify-between text-zinc-600 text-xs mt-0.5"><span>3</span><span>8</span></div>
            </div>

            <button onClick={handleAnalyze} disabled={!file || loading}
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
