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
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-white flex-shrink-0 lg:px-7 min-h-[58px] shadow-sm shadow-orange-50">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden text-zinc-500 hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-orange-50"
          aria-label="Menüyü aç"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-zinc-100 font-semibold text-sm leading-tight">{title}</h1>
          {description && (
            <p className="text-zinc-500 text-xs mt-0.5 hidden sm:block truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="ml-3 w-[190px] flex-shrink-0 sm:ml-4 sm:w-[300px] lg:w-[360px]">
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
      </div>
    </div>
  )
}
