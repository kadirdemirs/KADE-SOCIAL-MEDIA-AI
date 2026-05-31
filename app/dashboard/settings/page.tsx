import TopBar from '@/components/layout/TopBar'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

const apiKeys = [
  {
    id: 'ANTHROPIC_API_KEY',
    label: 'Anthropic (Claude)',
    description: 'Claude Sonnet modeli için gerekli. Başlık, hook, script, açıklama araçlarında kullanılır.',
    url: 'https://console.anthropic.com/settings/keys',
    urlLabel: 'console.anthropic.com',
    models: ['Claude Sonnet 4.5'],
    color: 'text-orange-400',
    dotColor: 'bg-orange-400',
  },
  {
    id: 'OPENAI_API_KEY',
    label: 'OpenAI (GPT-4o + TTS)',
    description: 'GPT-4o ve Text-to-Speech için gerekli. Hashtag, viral skor ve ses üretiminde kullanılır.',
    url: 'https://platform.openai.com/api-keys',
    urlLabel: 'platform.openai.com',
    models: ['GPT-4o', 'TTS-1-HD'],
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  {
    id: 'GEMINI_API_KEY',
    label: 'Google (Gemini)',
    description: 'Gemini 1.5 Pro için gerekli. Tüm araçlarda alternatif model olarak kullanılabilir.',
    url: 'https://aistudio.google.com/apikey',
    urlLabel: 'aistudio.google.com',
    models: ['Gemini 1.5 Pro'],
    color: 'text-blue-400',
    dotColor: 'bg-blue-400',
  },
  {
    id: 'NEXT_PUBLIC_SUPABASE_URL',
    label: 'Supabase URL',
    description: 'Auth ve içerik geçmişi için gerekli. Kayıt/giriş ve geçmiş sayfası bu olmadan çalışmaz.',
    url: 'https://supabase.com/dashboard',
    urlLabel: 'supabase.com',
    models: ['Auth', 'Database'],
    color: 'text-teal-400',
    dotColor: 'bg-teal-400',
  },
  {
    id: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    label: 'Supabase Anon Key',
    description: 'Supabase public erişim anahtarı. URL ile birlikte gerekli.',
    url: 'https://supabase.com/dashboard',
    urlLabel: 'supabase.com',
    models: ['Auth', 'Database'],
    color: 'text-teal-400',
    dotColor: 'bg-teal-400',
  },
]

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
      <CheckCircle className="w-3.5 h-3.5" /> Yapılandırıldı
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
      <XCircle className="w-3.5 h-3.5" /> Eksik
    </span>
  )
}

export default function SettingsPage() {
  const envStatus = {
    ANTHROPIC_API_KEY:           !!process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY:              !!process.env.OPENAI_API_KEY,
    GEMINI_API_KEY:              !!process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL:    !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const configured = Object.values(envStatus).filter(Boolean).length
  const total = Object.values(envStatus).length

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Ayarlar" description="API anahtarları ve yapılandırma" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Status overview */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-zinc-200 font-medium">Sistem Durumu</h2>
                <p className="text-zinc-500 text-sm mt-0.5">{configured}/{total} API anahtarı yapılandırıldı</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 36 36" className="rotate-[-90deg]">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="3" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="3"
                    strokeDasharray={`${(configured / total) * 88} 88`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-zinc-200 text-sm font-semibold">
                  {Math.round((configured / total) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* How to configure */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-2">
            <h3 className="text-violet-300 font-medium text-sm">Nasıl Yapılandırılır?</h3>
            <ol className="space-y-1.5 text-zinc-400 text-sm">
              <li className="flex gap-2"><span className="text-violet-400 font-mono text-xs mt-0.5">1.</span>Proje kökündeki <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-violet-300">.env.local</code> dosyasını aç</li>
              <li className="flex gap-2"><span className="text-violet-400 font-mono text-xs mt-0.5">2.</span>Aşağıdaki tablodaki linklere git, API anahtarı oluştur</li>
              <li className="flex gap-2"><span className="text-violet-400 font-mono text-xs mt-0.5">3.</span>Anahtarı <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-violet-300">KEY=değer</code> formatında dosyaya ekle</li>
              <li className="flex gap-2"><span className="text-violet-400 font-mono text-xs mt-0.5">4.</span>Dev sunucusunu yeniden başlat: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-violet-300">npm run dev</code></li>
            </ol>
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            {apiKeys.map((key) => {
              const isConfigured = envStatus[key.id as keyof typeof envStatus] ?? false
              return (
                <div key={key.id}
                  className={`rounded-xl border p-5 space-y-3 ${isConfigured ? 'border-zinc-700/50 bg-zinc-800/30' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${key.dotColor}`} />
                      <div>
                        <h3 className={`font-medium text-sm ${key.color}`}>{key.label}</h3>
                        <code className="text-zinc-600 text-xs">{key.id}</code>
                      </div>
                    </div>
                    <StatusBadge configured={isConfigured} />
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">{key.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {key.models.map((m) => (
                        <span key={m} className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                    <a href={key.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                      {key.urlLabel}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Supabase schema note */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-5 space-y-2">
            <h3 className="text-zinc-300 font-medium text-sm">Supabase Kurulumu</h3>
            <p className="text-zinc-500 text-sm">Auth ve geçmiş için Supabase projesinde şu SQL'i çalıştır:</p>
            <pre className="bg-zinc-900 rounded-lg p-3 text-xs text-zinc-400 overflow-x-auto">{`CREATE TABLE content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  model TEXT NOT NULL,
  input_data JSONB,
  output TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their history"
  ON content_history FOR ALL
  USING (auth.uid() = user_id);`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
