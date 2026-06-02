import Link from 'next/link'
import {
  Wand2, FileText, Zap, FileCode, Hash, TrendingUp,
  RefreshCw, Calendar, Mic2, Lightbulb, Image,
  FlaskConical, Settings, History, ArrowRight,
  Sparkles, Cpu, Activity,
} from 'lucide-react'

const featured = [
  {
    id: 'title',
    label: 'Başlık Üretici',
    description: 'SEO odaklı, viral tıklanabilir başlıklar',
    href: '/dashboard/title',
    icon: Wand2,
    gradient: 'from-orange-400 to-orange-600',
    cardBg: 'bg-orange-50 hover:bg-orange-100/80',
    border: 'border-orange-200 hover:border-orange-300',
    tag: 'En çok kullanılan',
    tagColor: 'text-orange-600 bg-orange-100 border-orange-200',
  },
  {
    id: 'script',
    label: 'Script Yazarı',
    description: 'Hook → İçerik → CTA tam video scripti',
    href: '/dashboard/script',
    icon: FileCode,
    gradient: 'from-emerald-400 to-emerald-600',
    cardBg: 'bg-emerald-50 hover:bg-emerald-100/80',
    border: 'border-emerald-200 hover:border-emerald-300',
    tag: 'Popüler',
    tagColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
  },
  {
    id: 'hook',
    label: 'Hook Jeneratörü',
    description: 'İzleyiciyi ilk 3 saniyede tutan açılış',
    href: '/dashboard/hook',
    icon: Zap,
    gradient: 'from-amber-400 to-amber-600',
    cardBg: 'bg-amber-50 hover:bg-amber-100/80',
    border: 'border-amber-200 hover:border-amber-300',
    tag: 'Viral',
    tagColor: 'text-amber-700 bg-amber-100 border-amber-200',
  },
  {
    id: 'repurpose',
    label: 'İçerik Dönüştür',
    description: 'Tüm platformlara tek tıkla uyarla',
    href: '/dashboard/repurpose',
    icon: RefreshCw,
    gradient: 'from-sky-400 to-sky-600',
    cardBg: 'bg-sky-50 hover:bg-sky-100/80',
    border: 'border-sky-200 hover:border-sky-300',
    tag: 'Zaman kazandırır',
    tagColor: 'text-sky-700 bg-sky-100 border-sky-200',
  },
]

const tools = [
  { id: 'description', label: 'Video Açıklama',  description: 'CTA içeren açıklamalar',        href: '/dashboard/description', icon: FileText,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
  { id: 'hashtag',     label: 'Hashtag AI',       description: "Niche'e özel hashtag",          href: '/dashboard/hashtag',     icon: Hash,         iconBg: 'bg-pink-100',   iconColor: 'text-pink-600'   },
  { id: 'thumbnail',   label: 'Thumbnail',        description: 'Tıklanma oranını artır',        href: '/dashboard/thumbnail',   icon: Image,        iconBg: 'bg-sky-100',    iconColor: 'text-sky-600'    },
  { id: 'viral-score', label: 'Viral Skor',       description: 'Viral potansiyelini analiz et', href: '/dashboard/viral-score', icon: TrendingUp,   iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: 'ab-test',     label: 'A/B Testi',        description: 'Hangisi daha viral?',           href: '/dashboard/ab-test',     icon: FlaskConical, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 'ideas',       label: 'Fikir Üretici',    description: '10-30 video fikri',             href: '/dashboard/ideas',       icon: Lightbulb,    iconBg: 'bg-lime-100',   iconColor: 'text-lime-600'   },
  { id: 'dubbing',     label: 'Dublaj & Çeviri',  description: 'Çok dilli script',              href: '/dashboard/dubbing',     icon: Mic2,         iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 'calendar',    label: 'İçerik Takvimi',   description: 'Yayın planı oluştur',           href: '/dashboard/calendar',    icon: Calendar,     iconBg: 'bg-rose-100',   iconColor: 'text-rose-600'   },
  { id: 'history',     label: 'Geçmiş',           description: 'Önceki üretimler',              href: '/dashboard/history',     icon: History,      iconBg: 'bg-zinc-900/10', iconColor: 'text-zinc-400'  },
  { id: 'settings',    label: 'Ayarlar',          description: 'API anahtarları',               href: '/dashboard/settings',    icon: Settings,     iconBg: 'bg-zinc-900/10', iconColor: 'text-zinc-400'  },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950">
      <div className="px-6 py-8 lg:px-10 w-full max-w-7xl space-y-10">

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 px-8 py-10">
          <div className="absolute top-0 right-0 w-72 h-64 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-40 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 border border-orange-200">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-600 text-[11px] font-semibold">v3.0 · Aktif</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-3 tracking-tight leading-tight">
              Merhaba, bugün{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                ne üretelim?
              </span>
            </h1>
            <p className="text-zinc-400 text-base mb-8 max-w-lg leading-relaxed">
              Claude, GPT-4o ve Gemini ile sosyal medya içerik üretimini hızlandır.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { icon: Sparkles, label: '56 Araç' },
                { icon: Cpu,      label: '3 AI Model' },
                { icon: Activity, label: 'Güncel' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-orange-200 shadow-sm">
                  <Icon className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-zinc-300 text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-zinc-200 font-bold text-sm">Öne Çıkan Araçlar</span>
            <span className="flex-1 h-px bg-orange-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group relative rounded-2xl border ${tool.border} ${tool.cardBg} p-5 transition-all duration-200 hover:shadow-md flex flex-col gap-4`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tool.tagColor}`}>
                      {tool.tag}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-zinc-100 font-bold text-sm mb-1">{tool.label}</h2>
                    <p className="text-zinc-400 text-xs leading-relaxed">{tool.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">Başla</span>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick access */}
        <div className="pb-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-zinc-200 font-bold text-sm">Hızlı Erişim</span>
            <span className="flex-1 h-px bg-orange-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group rounded-xl border border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all duration-150 p-4 flex flex-col gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tool.iconBg}`}>
                    <Icon className={`w-4 h-4 ${tool.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-zinc-200 font-semibold text-xs leading-tight">{tool.label}</h2>
                    <p className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-orange-400 mt-auto transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
