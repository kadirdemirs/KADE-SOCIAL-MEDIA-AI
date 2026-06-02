'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AIModel } from '@/types'
import { TOOL_MODEL_DEFAULTS } from '@/lib/ai/modelDefaults'

interface ModelContextType {
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  autoReason: string | null
  isAutoSelected: boolean
  applyToolDefault: (toolId: string) => void
}

const ModelContext = createContext<ModelContextType | undefined>(undefined)

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModelRaw] = useState<AIModel>('groq-llama-70b')
  const [autoReason, setAutoReason] = useState<string | null>(null)
  const [isAutoSelected, setIsAutoSelected] = useState(false)

  const setSelectedModel = useCallback((model: AIModel) => {
    setSelectedModelRaw(model)
    setIsAutoSelected(false)
    setAutoReason(null)
  }, [])

  const applyToolDefault = useCallback((toolId: string) => {
    const config = TOOL_MODEL_DEFAULTS[toolId]
    if (config) {
      setSelectedModelRaw(config.model)
      setAutoReason(config.reason)
      setIsAutoSelected(true)
    }
  }, [])

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel, autoReason, isAutoSelected, applyToolDefault }}>
      {children}
    </ModelContext.Provider>
  )
}

export function useModel(): ModelContextType {
  const ctx = useContext(ModelContext)
  if (!ctx) throw new Error('useModel must be used within ModelProvider')
  return ctx
}
