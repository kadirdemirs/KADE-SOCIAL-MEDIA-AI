'use client'

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
  Copy, BookMarked, Cpu, Activity, Library,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/context/SidebarContext'

const navItems = [
  {
    category: 'ÜRETİM',
    items: [
      { id: 'title',          label: 'Başlık Üretici',    href: '/dashboard/title',          icon: Wand2      },
      { id: 'description',    label: 'Video Açıklama',     href: '/dashboard/description',    icon: FileText   },
      { id: 'hook',           label: 'Hook Jeneratörü',   href: '/dashboard/hook',           icon: Zap        },
      { id: 'script',         label: 'Script Yazarı',     href: '/dashboard/script',         icon: FileCode   },
      { id: 'hashtag',        label: 'Hashtag AI',        href: '/dashboard/hashtag',        icon: Hash       },
      { id: 'thread',         label: 'Thread Yazarı',     href: '/dashboard/thread',         icon: GitBranch  },
      { id: 'carousel',       label: 'Carousel İçeriği',  href: '/dashboard/carousel',       icon: LayoutGrid },
      { id: 'podcast',        label: 'Podcast Script',    href: '/dashboard/podcast',        icon: Headphones },
      { id: 'blog',           label: 'Blog Yazısı',       href: '/dashboard/blog',           icon: BookOpen   },
      { id: 'newsletter',     label: 'Newsletter',        href: '/dashboard/newsletter',     icon: Mail       },
      { id: 'sponsor-script', label: 'Sponsor Scripti',   href: '/dashboard/sponsor-script', icon: Radio      },
      { id: 'collab-mail',    label: 'Kolaborasyon Maili',href: '/dashboard/collab-mail',    icon: Mail       },
      { id: 'giveaway',       label: 'Çekiliş Metni',     href: '/dashboard/giveaway',       icon: Gift       },
      { id: 'bulk',           label: 'Toplu İçerik',      href: '/dashboard/bulk',           icon: Copy       },
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
      { id: 'viral-score',        label: 'Viral Skor',        href: '/dashboard/viral-score',        icon: TrendingUp    },
      { id: 'ab-test',            label: 'A/B Başlık Testi',  href: '/dashboard/ab-test',            icon: FlaskConical  },
      { id: 'clickbait-detector', label: 'Clickbait Dedektör',href: '/dashboard/clickbait-detector', icon: AlertCircle   },
      { id: 'youtube-seo',        label: 'YouTube SEO',       href: '/dashboard/youtube-seo',        icon: Search        },
      { id: 'trends',             label: 'Trend Bulucu',      href: '/dashboard/trends',             icon: BarChart2     },
      { id: 'competitor',         label: 'Rakip Analizi',     href: '/dashboard/competitor',         icon: Users         },
      { id: 'comment-analysis',   label: 'Yorum Analizi',     href: '/dashboard/comment-analysis',   icon: MessageSquare },
      { id: 'performance',        label: 'Performans Tahmini',href: '/dashboard/performance',        icon: Activity      },
      { id: 'analytics',          label: 'Analitik',          href: '/dashboard/analytics',          icon: BarChart      },
      { id: 'faq',                label: 'FAQ Üretici',       href: '/dashboard/faq',                icon: BookMarked    },
      { id: 'quote-extractor',    label: 'Alıntı Çıkarıcı',  href: '/dashboard/quote-extractor',    icon: BookOpen      },
    ],
  },
  {
    category: 'BÜYÜME',
    items: [
      { id: 'comment-reply',   label: 'Yorum Yanıtlayıcı', href: '/dashboard/comment-reply',   icon: MessageSquare },
      { id: 'community-post',  label: 'Topluluk Postu',    href: '/dashboard/community-post',  icon: Users         },
      { id: 'poll',            label: 'Anket & Soru',      href: '/dashboard/poll',            icon: Target        },
      { id: 'livestream',      label: 'Live Stream Script',href: '/dashboard/livestream',      icon: Radio         },
      { id: 'chapters',        label: 'YouTube Chapters',  href: '/dashboard/chapters',        icon: ChevronDown   },
      { id: 'auto-post',       label: 'Otomatik Paylaşım', href: '/dashboard/auto-post',       icon: Share2        },
      { id: 'repurpose',       label: 'İçerik Dönüştür',  href: '/dashboard/repurpose',       icon: RefreshCw     },
      { id: 'humanizer',       label: 'AI Humanizer',      href: '/dashboard/humanizer',       icon: Wand          },
    ],
  },
  {
    category: 'STRATEJİ',
    items: [
      { id: 'audience',          label: 'Hedef Kitle',      href: '/dashboard/audience',          icon: Target        },
      { id: 'brand-voice',       label: 'Marka Sesi',       href: '/dashboard/brand-voice',       icon: Volume2       },
      { id: 'brand-voice-train', label: 'Ses Eğitici',      href: '/dashboard/brand-voice-train', icon: Cpu           },
      { id: 'niche-finder',      label: 'Niche Bulucu',     href: '/dashboard/niche-finder',      icon: Compass       },
      { id: 'pillar-planner',    label: 'İçerik Sütunları', href: '/dashboard/pillar-planner',    icon: Layers        },
      { id: 'brand-deal',        label: 'Brand Deal Fiyatı',href: '/dashboard/brand-deal',        icon: Calculator    },
      { id: 'course',            label: 'Kurs Taslağı',     href: '/dashboard/course',            icon: GraduationCap },
    ],
  },
  {
    category: 'PLANLAMA',
    items: [
      { id: 'ideas',        label: 'İçerik Fikirleri', href: '/dashboard/ideas',        icon: Lightbulb    },
      { id: 'content-plan', label: '30 Günlük Plan',   href: '/dashboard/content-plan', icon: CalendarDays },
      { id: 'bio-link',     label: 'Bağlantı Bio',     href: '/dashboard/bio-link',     icon: Link2        },
      { id: 'calendar',     label: 'İçerik Takvimi',   href: '/dashboard/calendar',     icon: Calendar     },
      { id: 'templates',    label: 'Şablon Kütüphanesi',href: '/dashboard/templates',   icon: Library      },
      { id: 'history',      label: 'Geçmiş',           href: '/dashboard/history',      icon: History      },
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
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={close} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40 transition-transform duration-200',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-zinc-100 font-semibold text-lg tracking-tight">KadeAI</span>
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
          <p className="text-zinc-600 text-xs text-center">KadeAI Studio v3.0 · 56 Araç</p>
        </div>
      </aside>
    </>
  )
}
