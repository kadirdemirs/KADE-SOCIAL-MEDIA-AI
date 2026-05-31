import Link from 'next/link'
import {
  Wand2, FileText, Zap, FileCode, Hash, TrendingUp,
  RefreshCw, Calendar, Mic2, Lightbulb, Image,
  FlaskConical, Settings, History,
} from 'lucide-react'

const tools = [
  { id: 'title',       label: 'Başlık Üretici',    description: 'SEO odaklı, tıklanabilir video başlıkları üret',          href: '/dashboard/title',       icon: Wand2,        color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20'  },
  { id: 'description', label: 'Video Açıklama',     description: 'Platform uyumlu, CTA içeren açıklamalar yaz',             href: '/dashboard/description', icon: FileText,     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
  { id: 'hook',        label: 'Hook Jeneratörü',    description: 'İlk 3 saniyede izleyiciyi tutan açılış cümleleri',         href: '/dashboard/hook',        icon: Zap,          color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
  { id: 'script',      label: 'Script Yazarı',      description: 'Hook → İçerik → CTA yapısında tam video scripti',          href: '/dashboard/script',      icon: FileCode,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'},
  { id: 'hashtag',     label: 'Hashtag AI',         description: "Platform ve niche'e özel hashtag stratejisi",              href: '/dashboard/hashtag',     icon: Hash,         color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20'      },
  { id: 'thumbnail',   label: 'Thumbnail Konsepti', description: 'Tıklanma oranını artıran thumbnail tasarım fikirleri',     href: '/dashboard/thumbnail',   icon: Image,        color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20'        },
  { id: 'viral-score', label: 'Viral Skor',         description: 'İçeriğinin viral potansiyelini 5 kriterde analiz et',      href: '/dashboard/viral-score', icon: TrendingUp,   color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20'  },
  { id: 'ab-test',     label: 'A/B Başlık Testi',   description: 'İki başlığı karşılaştır, hangisi daha viral?',             href: '/dashboard/ab-test',     icon: FlaskConical, color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20'  },
  { id: 'ideas',       label: 'İçerik Fikirleri',   description: 'Niche ve platforma göre 10-30 video fikri üret',           href: '/dashboard/ideas',       icon: Lightbulb,    color: 'text-lime-400',    bg: 'bg-lime-500/10 border-lime-500/20'      },
  { id: 'dubbing',     label: 'Dublaj & Çeviri',    description: 'Metin → ses ve çok dilli script dönüşümü',                 href: '/dashboard/dubbing',     icon: Mic2,         color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20'  },
  { id: 'repurpose',   label: 'İçerik Dönüştür',    description: 'Bir içeriği tüm platformlara tek tıkla uyarla',            href: '/dashboard/repurpose',   icon: RefreshCw,    color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'      },
  { id: 'calendar',    label: 'İçerik Takvimi',     description: 'Yayın planını oluştur ve organize et',                     href: '/dashboard/calendar',    icon: Calendar,     color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'      },
  { id: 'history',     label: 'Geçmiş',             description: 'Daha önce üretilen içerikleri görüntüle ve kopyala',       href: '/dashboard/history',     icon: History,      color: 'text-zinc-400',    bg: 'bg-zinc-500/10 border-zinc-500/20'      },
  { id: 'settings',    label: 'Ayarlar',            description: 'API anahtar durumu ve yapılandırma kılavuzu',               href: '/dashboard/settings',    icon: Settings,     color: 'text-zinc-400',    bg: 'bg-zinc-500/10 border-zinc-500/20'      },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl lg:text-2xl font-semibold text-zinc-100">Merhaba, bugün ne üretelim?</h1>
          <p className="text-zinc-400 mt-1 text-sm">Claude, GPT-4o ve Gemini ile içerik üretimini hızlandır.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group rounded-xl border bg-zinc-800/50 border-zinc-700/50 p-4 hover:bg-zinc-800 hover:border-zinc-600 transition-all flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${tool.bg}`}>
                  <Icon className={`w-4 h-4 ${tool.color}`} />
                </div>
                <div>
                  <h2 className="text-zinc-100 font-medium text-sm">{tool.label}</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{tool.description}</p>
                </div>
                <span className="text-zinc-600 text-xs group-hover:text-violet-400 transition-colors mt-auto">Başla →</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
