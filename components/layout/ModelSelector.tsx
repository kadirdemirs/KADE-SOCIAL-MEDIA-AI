'use client'

import { AIModel } from '@/types'
import { useModel } from '@/lib/context/ModelContext'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface ModelSelectorProps {
  value: AIModel
  onChange: (model: AIModel) => void
}

const models: { id: AIModel; label: string; activeClass: string; dotClass: string }[] = [
  {
    id: 'claude',
    label: 'Claude',
    activeClass: 'border-orange-500 bg-orange-500/10 text-orange-300',
    dotClass: 'bg-orange-400',
  },
  {
    id: 'gpt4o',
    label: 'GPT-4o',
    activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    activeClass: 'border-blue-500 bg-blue-500/10 text-blue-300',
    dotClass: 'bg-blue-400',
  },
]

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { isAutoSelected, autoReason } = useModel()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
              value === m.id
                ? m.activeClass
                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', value === m.id ? m.dotClass : 'bg-zinc-600')} />
            {m.label}
            {value === m.id && isAutoSelected && (
              <Sparkles className="w-3 h-3 opacity-70" />
            )}
          </button>
        ))}
      </div>
      {isAutoSelected && autoReason && (
        <p className="text-zinc-600 text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-500 flex-shrink-0" />
          {autoReason}
        </p>
      )}
    </div>
  )
}
