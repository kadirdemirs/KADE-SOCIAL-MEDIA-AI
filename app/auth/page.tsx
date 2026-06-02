'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, User, Lock, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup'

// Kullanıcı adını Supabase email formatına çevir
function toEmail(input: string): string {
  return input.includes('@') ? input : `${input.toLowerCase().replace(/\s+/g, '_')}@contentai.app`
}

export default function AuthPage() {
  const [mode, setMode]         = useState<Mode>('login')
  const [identifier, setIdentifier] = useState('') // username veya email
  const [nickname, setNickname] = useState('')      // sadece kayıtta
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabase = isConfigured ? createClient() : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    if (!supabase) {
      setError('Supabase bağlantısı yok. Vercel env var\'larını kontrol et.')
      setLoading(false)
      return
    }

    const email = toEmail(identifier)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/dashboard'
      } else {
        const displayName = nickname || identifier
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName, username: identifier.includes('@') ? identifier.split('@')[0] : identifier } },
        })
        if (error) throw error
        // Auto-login after signup
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (loginErr) {
          setSuccess('Kayıt başarılı! Giriş yapabilirsin.')
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Hata oluştu'
      setError(msg === 'Invalid login credentials' ? 'Kullanıcı adı veya şifre hatalı' : msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-zinc-100 font-bold text-xl">ContentAI Studio</span>
          </div>
          <p className="text-zinc-500 text-sm">AI destekli içerik üretim platformu</p>
        </div>

        <div className="rounded-xl border border-zinc-700/50 bg-zinc-900 p-6 space-y-5">
          <div className="flex rounded-lg bg-zinc-800 p-1">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={cn('flex-1 py-1.5 rounded-md text-sm font-medium transition-colors',
                  mode === m ? 'bg-violet-500 text-white' : 'text-zinc-400 hover:text-zinc-200')}>
                {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kayıtta görünen ad */}
            {mode === 'signup' && (
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Görünen Ad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)}
                    placeholder="Kade, Studio Kade..." autoComplete="name"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
                </div>
              </div>
            )}

            {/* Kullanıcı adı veya email */}
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                Kullanıcı Adı <span className="text-zinc-600">veya E-posta</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  required placeholder="kadir veya kadir@email.com" autoComplete="username"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
              {identifier && !identifier.includes('@') && (
                <p className="text-zinc-600 text-[10px] mt-1">→ {identifier}@contentai.app olarak kaydedilir</p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="En az 6 karakter" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500" />
              </div>
            </div>

            {error   && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 transition-colors">
              {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </button>
          </form>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-700" />
            <span className="text-zinc-600 text-xs">ya da</span>
            <div className="flex-1 h-px bg-zinc-700" />
          </div>

          <button onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </button>
        </div>
      </div>
    </div>
  )
}
