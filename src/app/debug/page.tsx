import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DebugClient from './DebugClient'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  // DEV ONLY: não deixa isso existir em produção
  if (process.env.NODE_ENV !== 'development') {
    redirect('/')
  }

  const supabase = createServerSupabaseClientReadOnly()
  
  // Testa a conexão com o Supabase
  let connectionStatus = 'unknown'
  let error = null
  
  try {
    // Teste 1: Verificar se consegue fazer uma query simples
    const { error: queryError } = await supabase
      .from('roles')
      .select('count')
      .limit(1)
    
    if (queryError) {
      connectionStatus = 'error'
      error = {
        message: queryError.message,
        code: queryError.code,
        details: queryError.details,
      }
    } else {
      connectionStatus = 'ok'
    }
  } catch (e) {
    connectionStatus = 'exception'
    error = {
      message: e instanceof Error ? e.message : 'Erro desconhecido',
      code: 'EXCEPTION',
    }
  }

  return <DebugClient initialStatus={connectionStatus} initialError={error} />
}
