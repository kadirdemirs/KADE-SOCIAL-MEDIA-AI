'use client'

import { AIModel } from '@/types'
import { useModel } from '@/lib/context/ModelContext'
import { cn } from '@/lib/utils'
import { FREE_GROQ_MODELS, getModelConfig } from '@/lib/ai/models'
import { Sparkles } from 'lucide-react'

interface ModelSelectorProps {
  value: AIModel
  onChange: (model: AIModel) => void
}

const models = FREE_GROQ_MODELS.map(getModelConfig)

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { isAutoSelected, autoReason } = useModel()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-1 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 sm:grid-cols-2">
        {models.map((m) => {
          const isActive = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                'flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 border text-left',
                isActive
                  ? m.activeClass
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border-transparent'
              )}
            >
              <span className={cn(
                'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors mt-1.5',
                isActive ? m.dotClass : 'bg-zinc-400'
              )} />
              <span className="min-w-0">
                <span className="flex items-center gap-1">
                  {m.shortLabel}
                  {isActive && isAutoSelected && <Sparkles className="w-3 h-3 opacity-60" />}
                </span>
                <span className="block text-[10px] font-normal opacity-70 leading-snug">{m.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      {isAutoSelected && autoReason && (
        <p className="text-zinc-500 text-[10px] flex items-center gap-1 px-1">
          <Sparkles className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
          {autoReason}
        </p>
      )}
    </div>
  )
}
