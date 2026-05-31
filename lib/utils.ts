import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Platform, AIModel } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    x: 'X / Twitter',
    linkedin: 'LinkedIn',
    pinterest: 'Pinterest',
  }
  return labels[platform]
}

export function getModelLabel(model: AIModel): string {
  const labels: Record<AIModel, string> = {
    claude: 'Claude Sonnet',
    gpt4o: 'GPT-4o',
    gemini: 'Gemini Pro',
  }
  return labels[model]
}

export function getModelColor(model: AIModel): string {
  const colors: Record<AIModel, string> = {
    claude: 'text-orange-400',
    gpt4o: 'text-emerald-400',
    gemini: 'text-blue-400',
  }
  return colors[model]
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function checkEnvVars(): void {
  const required = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
  ]
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.warn(`[ContentAI] Eksik API anahtarları: ${missing.join(', ')}. Lütfen .env.local dosyasını kontrol et.`)
  }
}
