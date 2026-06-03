import { GenerateRequest, GenerateResult } from '@/types'
import { getModelConfig } from '@/lib/ai/models'

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim())
}

async function generateWithGroq(
  prompt: string,
  systemPrompt: string,
  maxTokens: number,
  requestedModel: GenerateRequest['model'],
  groqModel?: string
): Promise<GenerateResult> {
  if (!hasEnv('GROQ_API_KEY')) {
    throw new Error(
      'AI API anahtari bulunamadi. Vercel env icine GROQ_API_KEY veya secilen modelin API anahtarini ekle.'
    )
  }

  const Groq = (await import('groq-sdk')).default
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const fallbackModel = 'llama-3.3-70b-versatile'
  const targetModel = groqModel || process.env.GROQ_MODEL || fallbackModel

  const createCompletion = (modelName: string) => groq.chat.completions.create({
    model: modelName,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  })

  let response: Awaited<ReturnType<typeof createCompletion>>
  let actualModel = requestedModel
  try {
    response = await createCompletion(targetModel)
  } catch (error) {
    if (targetModel === fallbackModel) throw error
    response = await createCompletion(fallbackModel)
    actualModel = 'groq-llama-70b'
  }

  return {
    content: response.choices[0]?.message?.content || '',
    model: actualModel,
    tokensUsed: response.usage?.total_tokens,
  }
}

async function generateWithOpenRouter(
  prompt: string,
  systemPrompt: string,
  maxTokens: number,
  requestedModel: GenerateRequest['model'],
  openRouterModel = 'openrouter/free'
): Promise<GenerateResult> {
  if (!hasEnv('OPENROUTER_API_KEY')) {
    return generateWithGroq(prompt, systemPrompt, maxTokens, 'groq-llama-70b', 'llama-3.3-70b-versatile')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://kadeai.vercel.app',
      'X-Title': 'KadeAI Studio',
    },
    body: JSON.stringify({
      model: openRouterModel,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    return generateWithGroq(prompt, systemPrompt, maxTokens, 'groq-llama-70b', 'llama-3.3-70b-versatile')
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { total_tokens?: number }
  }

  return {
    content: data.choices?.[0]?.message?.content || '',
    model: requestedModel,
    tokensUsed: data.usage?.total_tokens,
  }
}

export async function generateContent(req: GenerateRequest): Promise<GenerateResult> {
  const { prompt, model, systemPrompt, maxTokens = 1500 } = req
  const sysText = systemPrompt || 'Sen uzman bir sosyal medya icerik stratejistisisin. Turkce yanit ver.'
  const modelConfig = getModelConfig(model)

  try {
    if (modelConfig.provider === 'groq') {
      return generateWithGroq(prompt, sysText, maxTokens, model, modelConfig.groqModel)
    }

    if (modelConfig.provider === 'openrouter') {
      return generateWithOpenRouter(prompt, sysText, maxTokens, model, modelConfig.openRouterModel)
    }

    if (model === 'gemini-flash') {
      if (!hasEnv('GEMINI_API_KEY')) {
        return generateWithGroq(prompt, sysText, maxTokens, 'groq-llama-70b', 'llama-3.3-70b-versatile')
      }

      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const geminiModel = geminiAI.getGenerativeModel({ model: modelConfig.geminiModel || 'gemini-2.5-flash' })
      const fullPrompt = `${sysText}\n\n${prompt}`
      const result = await geminiModel.generateContent(fullPrompt)
      const content = result.response.text()
      return { content, model }
    }

    if (model === 'claude') {
      if (!hasEnv('ANTHROPIC_API_KEY')) {
        return generateWithGroq(prompt, sysText, maxTokens, 'groq-llama-70b', 'llama-3.3-70b-versatile')
      }

      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: maxTokens,
        system: [
          {
            type: 'text',
            text: sysText,
            // cache_control caches the system prompt across requests with the same content
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: prompt }],
      })
      const content = response.content[0].type === 'text' ? response.content[0].text : ''
      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens
      return { content, model, tokensUsed }
    }

    if (model === 'gpt4o') {
      if (!hasEnv('OPENAI_API_KEY')) {
        return generateWithGroq(prompt, sysText, maxTokens, 'groq-gpt-oss-120b', 'openai/gpt-oss-120b')
      }

      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: sysText },
          { role: 'user', content: prompt },
        ],
      })
      const content = response.choices[0].message.content || ''
      return { content, model, tokensUsed: response.usage?.total_tokens }
    }

    if (model === 'gemini') {
      if (!hasEnv('GEMINI_API_KEY')) {
        return generateWithGroq(prompt, sysText, maxTokens, 'groq-qwen-32b', 'qwen/qwen3-32b')
      }

      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const geminiModel = geminiAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const fullPrompt = `${sysText}\n\n${prompt}`
      const result = await geminiModel.generateContent(fullPrompt)
      const content = result.response.text()
      return { content, model }
    }

    throw new Error(`Bilinmeyen model: ${model}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata'
    throw new Error(`${model} API hatasi: ${message}`)
  }
}
