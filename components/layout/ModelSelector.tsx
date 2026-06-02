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
    activeClass: 'border-orange-300 bg-orange-50 text-orange-700 shadow-sm',
    dotClass: 'bg-orange-400',
  },
  {
    id: 'gpt4o',
    label: 'GPT-4o',
    activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm',
    dotClass: 'bg-emerald-400',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    activeClass: 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm',
    dotClass: 'bg-blue-400',
  },
]

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { isAutoSelected, autoReason } = useModel()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
        {models.map((m) => {
          const isActive = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border',
                isActive
                  ? m.activeClass
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border-transparent'
              )}
            >
              <span className={cn(
                'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors',
                isActive ? m.dotClass : 'bg-zinc-400'
              )} />
              {m.label}
              {isActive && isAutoSelected && <Sparkles className="w-3 h-3 opacity-60" />}
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
