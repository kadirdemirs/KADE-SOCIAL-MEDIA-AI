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
    <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-zinc-100 font-semibold text-base lg:text-lg">{title}</h1>
          {description && <p className="text-zinc-500 text-xs mt-0.5 hidden sm:block">{description}</p>}
        </div>
      </div>
      <ModelSelector value={selectedModel} onChange={setSelectedModel} />
    </div>
  )
}
