'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wand2, FileText, Zap, FileCode, Hash, TrendingUp,
  RefreshCw, Calendar, Sparkles, Mic2, Lightbulb,
  Image, FlaskConical, Settings, History, X, Scissors,
  GitBranch, LayoutGrid, BookOpen, Headphones, Link2,
  CalendarDays, ImagePlus, BarChart2, Search, Users,
  MessageSquare, Share2, BarChart, Mail, ChevronDown,
  Radio, GraduationCap, Gift, Target, Volume2, Compass,
  Layers, AlertCircle, Captions, Film, Wand, Calculator,
  Copy, BookMarked, Cpu, Activity, Library, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/context/SidebarContext'

const navItems = [
  {
    category: 'ÜRETİM',
    items: [
      { id: 'title',          label: 'Başlık Üretici',     href: '/dashboard/title',          icon: Wand2      },
      { id: 'description',    label: 'Video Açıklama',      href: '/dashboard/description',    icon: FileText   },
      { id: 'hook',           label: 'Hook Jeneratörü',    href: '/dashboard/hook',           icon: Zap        },
      { id: 'script',         label: 'Script Yazarı',      href: '/dashboard/script',         icon: FileCode   },
      { id: 'hashtag',        label: 'Hashtag AI',         href: '/dashboard/hashtag',        icon: Hash       },
      { id: 'thread',         label: 'Thread Yazarı',      href: '/dashboard/thread',         icon: GitBranch  },
      { id: 'carousel',       label: 'Carousel İçeriği',   href: '/dashboard/carousel',       icon: LayoutGrid },
      { id: 'podcast',        label: 'Podcast Script',     href: '/dashboard/podcast',        icon: Headphones },
      { id: 'blog',           label: 'Blog Yazısı',        href: '/dashboard/blog',           icon: BookOpen   },
      { id: 'newsletter',     label: 'Newsletter',         href: '/dashboard/newsletter',     icon: Mail       },
      { id: 'sponsor-script', label: 'Sponsor Scripti',    href: '/dashboard/sponsor-script', icon: Radio      },
      { id: 'collab-mail',    label: 'Kolaborasyon Maili', href: '/dashboard/collab-mail',    icon: Mail       },
      { id: 'giveaway',       label: 'Çekiliş Metni',      href: '/dashboard/giveaway',       icon: Gift       },
      { id: 'bulk',           label: 'Toplu İçerik',       href: '/dashboard/bulk',           icon: Copy       },
    ],
  },
  {
    category: 'MEDYA',
    items: [
      { id: 'thumbnail',      label: 'Thumbnail Konsepti', href: '/dashboard/thumbnail',      icon: Image      },
      { id: 'ai-thumbnail',   label: 'AI Thumbnail',       href: '/dashboard/ai-thumbnail',   icon: ImagePlus  },
      { id: 'clip-generator', label: 'Klip Üretici',       href: '/dashboard/clip-generator', icon: Scissors   },
      { id: 'subtitle',       label: 'Altyazı Üretici',    href: '/dashboard/subtitle',       icon: Captions   },
      { id: 'storyboard',     label: 'Storyboard',         href: '/dashboard/storyboard',     icon: Film       },
      { id: 'broll',          label: 'B-Roll Shot List',   href: '/dashboard/broll',          icon: Film       },
      { id: 'story-series',   label: 'Story Dizisi',       href: '/dashboard/story-series',   icon: Layers     },
      { id: 'dubbing',        label: 'Dublaj & Çeviri',    href: '/dashboard/dubbing',        icon: Mic2       },
    ],
  },
  {
    category: 'ANALİZ',
    items: [
      { id: 'viral-score',        label: 'Viral Skor',         href: '/dashboard/viral-score',        icon: TrendingUp    },
      { id: 'ab-test',            label: 'A/B Başlık Testi',   href: '/dashboard/ab-test',            icon: FlaskConical  },
      { id: 'clickbait-detector', label: 'Clickbait Dedektör', href: '/dashboard/clickbait-detector', icon: AlertCircle   },
      { id: 'youtube-seo',        label: 'YouTube SEO',        href: '/dashboard/youtube-seo',        icon: Search        },
      { id: 'trends',             label: 'Trend Bulucu',       href: '/dashboard/trends',             icon: BarChart2     },
      { id: 'competitor',         label: 'Rakip Analizi',      href: '/dashboard/competitor',         icon: Users         },
      { id: 'comment-analysis',   label: 'Yorum Analizi',      href: '/dashboard/comment-analysis',   icon: MessageSquare },
      { id: 'performance',        label: 'Performans Tahmini', href: '/dashboard/performance',        icon: Activity      },
      { id: 'analytics',          label: 'Analitik',           href: '/dashboard/analytics',          icon: BarChart      },
      { id: 'faq',                label: 'FAQ Üretici',        href: '/dashboard/faq',                icon: BookMarked    },
      { id: 'quote-extractor',    label: 'Alıntı Çıkarıcı',   href: '/dashboard/quote-extractor',    icon: BookOpen      },
    ],
  },
  {
    category: 'BÜYÜME',
    items: [
      { id: 'comment-reply',   label: 'Yorum Yanıtlayıcı',  href: '/dashboard/comment-reply',   icon: MessageSquare },
      { id: 'community-post',  label: 'Topluluk Postu',     href: '/dashboard/community-post',  icon: Users         },
      { id: 'poll',            label: 'Anket & Soru',       href: '/dashboard/poll',            icon: Target        },
      { id: 'livestream',      label: 'Live Stream Script', href: '/dashboard/livestream',      icon: Radio         },
      { id: 'chapters',        label: 'YouTube Chapters',   href: '/dashboard/chapters',        icon: ChevronDown   },
      { id: 'auto-post',       label: 'Otomatik Paylaşım',  href: '/dashboard/auto-post',       icon: Share2        },
      { id: 'repurpose',       label: 'İçerik Dönüştür',   href: '/dashboard/repurpose',       icon: RefreshCw     },
      { id: 'humanizer',       label: 'AI Humanizer',       href: '/dashboard/humanizer',       icon: Wand          },
    ],
  },
  {
    category: 'STRATEJİ',
    items: [
      { id: 'audience',          label: 'Hedef Kitle',       href: '/dashboard/audience',          icon: Target        },
      { id: 'brand-voice',       label: 'Marka Sesi',        href: '/dashboard/brand-voice',       icon: Volume2       },
      { id: 'brand-voice-train', label: 'Ses Eğitici',       href: '/dashboard/brand-voice-train', icon: Cpu           },
      { id: 'niche-finder',      label: 'Niche Bulucu',      href: '/dashboard/niche-finder',      icon: Compass       },
      { id: 'pillar-planner',    label: 'İçerik Sütunları',  href: '/dashboard/pillar-planner',    icon: Layers        },
      { id: 'brand-deal',        label: 'Brand Deal Fiyatı', href: '/dashboard/brand-deal',        icon: Calculator    },
      { id: 'course',            label: 'Kurs Taslağı',      href: '/dashboard/course',            icon: GraduationCap },
    ],
  },
  {
    category: 'PLANLAMA',
    items: [
      { id: 'ideas',        label: 'İçerik Fikirleri',   href: '/dashboard/ideas',        icon: Lightbulb    },
      { id: 'content-plan', label: '30 Günlük Plan',     href: '/dashboard/content-plan', icon: CalendarDays },
      { id: 'bio-link',     label: 'Bağlantı Bio',       href: '/dashboard/bio-link',     icon: Link2        },
      { id: 'calendar',     label: 'İçerik Takvimi',     href: '/dashboard/calendar',     icon: Calendar     },
      { id: 'templates',    label: 'Şablon Kütüphanesi', href: '/dashboard/templates',    icon: Library      },
      { id: 'history',      label: 'Geçmiş',             href: '/dashboard/history',      icon: History      },
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
  const [search, setSearch] = useState('')
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['ÜRETİM', 'AYARLAR']))

  const toggleCat = (cat: string) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const isSearching = search.trim().length > 0
  const q = search.toLowerCase()

  const filtered = useMemo(() => {
    if (!isSearching) return navItems
    return navItems
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0)
  }, [isSearching, q])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-amber-950/20 backdrop-blur-sm z-30 lg:hidden" onClick={close} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 flex flex-col z-40 transition-transform duration-300',
        'bg-white border-r border-orange-100',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="relative flex items-center justify-between px-4 py-4 border-b border-orange-100 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-zinc-100 font-bold text-sm tracking-tight">KadeAI</span>
              <span className="block text-zinc-500 text-[10px] mt-0.5 font-medium">Content Studio</span>
            </div>
          </div>
          <button onClick={close} className="lg:hidden text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-orange-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Araç ara..."
              className="w-full bg-orange-50/70 border border-orange-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-orange-300 focus:bg-orange-50 transition-colors"
            />
            {isSearching && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-0.5">
          {filtered.map((group) => {
            const catOpen = isSearching || openCats.has(group.category)
            const activeInGroup = group.items.some(i => i.href === pathname)

            return (
              <div key={group.category}>
                <button
                  onClick={() => !isSearching && toggleCat(group.category)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2 rounded-lg transition-colors group',
                    isSearching ? 'cursor-default' : 'hover:bg-orange-50 cursor-pointer'
                  )}
                >
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.15em]',
                    activeInGroup ? 'text-orange-600' : 'text-zinc-500 group-hover:text-orange-500'
                  )}>
                    {group.category}
                    <span className="ml-1.5 text-zinc-400 font-normal normal-case tracking-normal text-[9px]">
                      {group.items.length}
                    </span>
                  </span>
                  {!isSearching && (
                    <ChevronRight className={cn(
                      'w-3 h-3 text-zinc-400 transition-transform duration-200',
                      catOpen && 'rotate-90'
                    )} />
                  )}
                </button>

                {catOpen && (
                  <ul className="space-y-px pb-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className={cn(
                              'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-100 border',
                              isActive
                                ? 'bg-orange-50 text-orange-700 font-semibold border-orange-200'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-orange-50/60 border-transparent'
                            )}
                          >
                            <Icon className={cn(
                              'w-3.5 h-3.5 flex-shrink-0 transition-colors',
                              isActive ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-400'
                            )} />
                            <span className="truncate">{item.label}</span>
                            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-orange-100 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-orange-50 border border-orange-100">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
            <p className="text-zinc-500 text-[10px]">v3.0 · 56 araç aktif</p>
          </div>
        </div>
      </aside>
    </>
  )
}
