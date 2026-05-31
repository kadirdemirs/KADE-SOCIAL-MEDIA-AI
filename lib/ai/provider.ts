import { GenerateRequest, GenerateResult } from '@/types'

export async function generateContent(req: GenerateRequest): Promise<GenerateResult> {
  const { prompt, model, systemPrompt, maxTokens = 1500 } = req
  const sysText = systemPrompt || 'Sen uzman bir sosyal medya içerik stratejistisisin. Türkçe yanıt ver.'

  try {
    if (model === 'claude') {
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
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const geminiModel = geminiAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
      const fullPrompt = `${sysText}\n\n${prompt}`
      const result = await geminiModel.generateContent(fullPrompt)
      const content = result.response.text()
      return { content, model }
    }

    throw new Error(`Bilinmeyen model: ${model}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata'
    throw new Error(`${model} API hatası: ${message}`)
  }
}
