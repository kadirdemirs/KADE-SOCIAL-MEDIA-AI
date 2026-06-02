const ENV_KEYS = [
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

export async function GET() {
  const status = Object.fromEntries(
    ENV_KEYS.map((key) => [key, Boolean(process.env[key]?.trim())])
  )

  return Response.json(status)
}
