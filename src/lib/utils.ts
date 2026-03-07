import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return String(error)
}

export function sanitizeError(error: unknown): string {
  const message = getErrorMessage(error)
  if (message === 'UNAUTHORIZED' || message === 'NEXT_REDIRECT') return message
  if (message === 'FORBIDDEN') return 'Você não tem permissão para realizar esta ação.'

  console.error('[Action Error]:', error)

  return 'Erro ao processar solicitação. Tente novamente mais tarde.'
}
