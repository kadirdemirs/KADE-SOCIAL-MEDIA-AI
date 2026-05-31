import { AIModel } from '@/types'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  model?: AIModel
  className?: string
}

const modelMessages: Record<AIModel, string> = {
  claude: 'Claude düşünüyor...',
  gpt4o: 'GPT-4o yazıyor...',
  gemini: 'Gemini üretiyor...',
}

const modelColors: Record<AIModel, string> = {
  claude: 'text-orange-400',
  gpt4o: 'text-emerald-400',
  gemini: 'text-blue-400',
}

export default function LoadingState({ model, className }: LoadingStateProps) {
  const message = model ? modelMessages[model] : 'Üretiliyor...'
  const colorClass = model ? modelColors[model] : 'text-violet-400'

  return (
    <div className={cn('flex items-center gap-3 p-4', className)}>
      <div className={cn('flex gap-1', colorClass)}>
        <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
      </div>
      <span className={cn('text-sm font-medium', colorClass)}>{message}</span>
    </div>
  )
}
