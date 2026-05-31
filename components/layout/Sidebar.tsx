'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wand2, FileText, Zap, FileCode, Hash, TrendingUp,
  RefreshCw, Calendar, Sparkles, Mic2, Lightbulb,
  Image, FlaskConical, Settings, History, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/context/SidebarContext'

const navItems = [
  {
    category: 'ÜRETİM',
    items: [
      { id: 'title',       label: 'Başlık Üretici',   href: '/dashboard/title',       icon: Wand2     },
      { id: 'description', label: 'Video Açıklama',    href: '/dashboard/description', icon: FileText  },
      { id: 'hook',        label: 'Hook Jeneratörü',   href: '/dashboard/hook',        icon: Zap       },
      { id: 'script',      label: 'Script Yazarı',     href: '/dashboard/script',      icon: FileCode  },
      { id: 'hashtag',     label: 'Hashtag AI',        href: '/dashboard/hashtag',     icon: Hash      },
    ],
  },
  {
    category: 'MEDYA',
    items: [
      { id: 'thumbnail', label: 'Thumbnail Konsepti', href: '/dashboard/thumbnail', icon: Image  },
      { id: 'dubbing',   label: 'Dublaj & Çeviri',    href: '/dashboard/dubbing',   icon: Mic2   },
    ],
  },
  {
    category: 'ANALİZ',
    items: [
      { id: 'viral-score', label: 'Viral Skor',       href: '/dashboard/viral-score', icon: TrendingUp   },
      { id: 'ab-test',     label: 'A/B Başlık Testi', href: '/dashboard/ab-test',     icon: FlaskConical },
      { id: 'repurpose',   label: 'İçerik Dönüştür',  href: '/dashboard/repurpose',   icon: RefreshCw    },
    ],
  },
  {
    category: 'PLANLAMA',
    items: [
      { id: 'ideas',    label: 'İçerik Fikirleri', href: '/dashboard/ideas',    icon: Lightbulb },
      { id: 'calendar', label: 'İçerik Takvimi',   href: '/dashboard/calendar', icon: Calendar  },
      { id: 'history',  label: 'Geçmiş',           href: '/dashboard/history',  icon: History   },
    ],
  },
  {
    category: 'AYARLAR',
    items: [
      { id: 'settings', label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40 transition-transform duration-200',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-zinc-100 font-semibold text-lg tracking-tight">ContentAI</span>
          </div>
          <button onClick={close} className="lg:hidden text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((group) => (
            <div key={group.category} className="mb-5">
              <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5">
                {group.category}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-violet-500/20 text-violet-300 font-medium'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs text-center">ContentAI Studio v1.0</p>
        </div>
      </aside>
    </>
  )
}
