import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // COOP/COEP headers sadece FFmpeg kullanan sayfalara — diğer route'larda Supabase auth'u kırar
  async headers() {
    return [
      {
        source: '/dashboard/clip-generator',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/dashboard/subtitle',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
}

export default nextConfig
