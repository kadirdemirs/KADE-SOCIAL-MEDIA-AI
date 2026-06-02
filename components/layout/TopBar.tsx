'use client'

import { Menu } from 'lucide-react'
import { useModel } from '@/lib/context/ModelContext'
import { useSidebar } from '@/lib/context/SidebarContext'
import ModelSelector from './ModelSelector'

interface TopBarProps {
  title: string
  description?: string
}

export default function TopBar({ title, description }: TopBarProps) {
  const { selectedModel, setSelectedModel } = useModel()
  const { toggle } = useSidebar()

  return (
    <div className="flex flex-col gap-3 px-4 py-4 border-b border-zinc-800 bg-zinc-950 flex-shrink-0 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-zinc-100 font-semibold text-base lg:text-lg">{title}</h1>
          {description && <p className="text-zinc-500 text-xs mt-0.5 hidden sm:block">{description}</p>}
        </div>
      </div>
      <div className="w-full overflow-x-auto sm:w-auto">
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
      </div>
    </div>
  )
}
