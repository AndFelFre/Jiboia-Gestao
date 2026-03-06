import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: log em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Client Config:')
  console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')
  console.log('ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Variáveis de ambiente do Supabase não configuradas!\n\n' +
    'Verifique se o arquivo .env.local existe na raiz do projeto e contém:\n\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key\n\n' +
    'Dica: Reinicie o servidor após criar/editar o .env.local (Ctrl+C + npm run dev)'
  )
}

export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
