'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle, Cpu, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type EnvStatus = Record<string, boolean>

const providers = [
  {
    id: 'CEREBRAS_API_KEY',
    label: 'Cerebras',
    status: 'Hızlı fikir, bulk üretim',
    models: 'GLM 4.7, GPT-OSS fallback',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    id: 'GROQ_API_KEY',
    label: 'Groq',
    status: 'Genel üretim, hızlı JSON',
    models: 'Llama 70B, Scout, Qwen, GPT-OSS',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 'GEMINI_API_KEY',
    label: 'Gemini',
    status: 'Uzun bağlam, script, plan',
    models: 'Flash, Flash-Lite, 3.5 Flash',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'MISTRAL_API_KEY',
    label: 'Mistral',
    status: 'Analiz, reasoning, kod',
    models: 'Magistral, Medium, Codestral',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: 'OPENROUTER_API_KEY',
    label: 'OpenRouter',
    status: 'Ücretsiz router, alternatifler',
    models: 'Free Router, GLM Air, Nemotron',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const roles = [
  ['Yaratıcı Türkçe', 'Groq Llama 70B'],
  ['Uzun script / plan', 'Gemini Flash'],
  ['Analiz / skor', 'Magistral'],
  ['Toplu fikir', 'Cerebras GLM 4.7'],
  ['Kod / teknik', 'Codestral'],
  ['Ücretsiz alternatif', 'OpenRouter Free'],
]

export default function AIHealthPanel() {
  const [status, setStatus] = useState<EnvStatus>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/env-status?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({}))
      .finally(() => setLoading(false))
  }, [])

  const readyCount = providers.filter((provider) => status[provider.id]).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">AI Sağlık Paneli</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {loading ? 'Provider durumları kontrol ediliyor' : `${readyCount}/${providers.length} AI provider hazır`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-300">
          <Activity className="h-3.5 w-3.5 text-orange-500" />
          Otomatik seçim aktif
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const ok = Boolean(status[provider.id])
          return (
            <div key={provider.id} className="rounded-lg border border-zinc-700 bg-white p-3">
              <div className="flex items-start gap-2">
                <span className={cn('grid h-8 w-8 place-items-center rounded-lg', provider.bg, provider.color)}>
                  <Cpu className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-semibold text-zinc-100">{provider.label}</p>
                    {ok ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{provider.status}</p>
                  <p className="mt-1 truncate text-[10px] font-medium text-zinc-400">{provider.models}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <p className="text-xs font-semibold text-zinc-100">Otomatik Model Mantığı</p>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {roles.map(([role, model]) => (
            <div key={role} className="flex items-center justify-between gap-2 text-[10px]">
              <span className="text-zinc-500">{role}</span>
              <span className="truncate font-semibold text-zinc-200">{model}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
