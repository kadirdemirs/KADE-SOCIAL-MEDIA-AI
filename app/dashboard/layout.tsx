'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ModelProvider, useModel } from '@/lib/context/ModelContext'
import { SidebarProvider } from '@/lib/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'

function AutoModelApplier() {
  const pathname = usePathname()
  const { applyToolDefault } = useModel()
  useEffect(() => {
    const toolId = pathname.split('/dashboard/')[1]
    if (toolId) applyToolDefault(toolId)
  }, [pathname, applyToolDefault])
  return null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModelProvider>
      <SidebarProvider>
        <AutoModelApplier />
        <div className="flex h-screen bg-zinc-950">
          <Sidebar />
          <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden min-w-0">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ModelProvider>
  )
}
