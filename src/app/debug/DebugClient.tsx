'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: string
}

export default function DebugClient({ 
  initialStatus, 
  initialError 
}: { 
  initialStatus: string
  initialError: { message: string; code: string; details?: string } | null
}) {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Variáveis de Ambiente', status: 'pending', message: 'Verificando...' },
    { name: 'Conexão REST', status: initialStatus === 'ok' ? 'success' : 'error', message: initialStatus === 'ok' ? 'Conectado' : 'Falhou' },
    { name: 'Autenticação', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Tabela users', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Tabela roles', status: 'pending', message: 'Aguardando teste...' },
    { name: 'Login Demo', status: 'pending', message: 'Aguardando teste...' },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkEnvironment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkEnvironment = () => {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    updateTest('Variáveis de Ambiente', 
      envUrl && envKey ? 'success' : 'error',
      envUrl && envKey ? 'Configuradas' : 'Faltando variáveis',
      `URL: ${envUrl ? 'OK' : 'FALTANDO'} | Key: ${envKey ? 'OK' : 'FALTANDO'}`
    )
  }

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, status, message, details } : t))
  }

  const runAllTests = async () => {
    setLoading(true)
    const supabase = createBrowserSupabaseClient()

    // Teste 1: Verificar se consegue acessar auth
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) {
        updateTest('Autenticação', 'error', 'Erro ao verificar sessão', authError.message)
      } else {
        updateTest('Autenticação', 'success', session ? 'Sessão ativa' : 'Sem sessão', 
          session ? `User: ${session.user.email}` : 'Nenhum usuário logado')
      }
    } catch (e) {
      updateTest('Autenticação', 'error', 'Exceção', e instanceof Error ? e.message : 'Erro desconhecido')
    }

    // Teste 2: Verificar tabela roles
    try {
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .limit(1)
      
      if (rolesError) {
        updateTest('Tabela roles', 'error', 'Erro na query', 
          `${rolesError.message} (code: ${rolesError.code})`)
      } else {
        updateTest('Tabela roles', 'success', 'Acessível', 
          `Encontradas ${roles?.length || 0} roles`)
      }
    } catch (e) {
      updateTest('Tabela roles', 'error', 'Exceção', e instanceof Error ? e.message : 'Erro desconhecido')
    }

    // Teste 3: Verificar tabela users
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .limit(1)
      
      if (usersError) {
        updateTest('Tabela users', 'error', 'Erro na query', 
          `${usersError.message} (code: ${usersError.code})`)
      } else {
        updateTest('Tabela users', 'success', 'Acessível', 
          `Encontrados ${users?.length || 0} usuários`)
      }
    } catch (e) {
      updateTest('Tabela users', 'error', 'Exceção', e instanceof Error ? e.message : 'Erro desconhecido')
    }

    // Teste 4: Tentar fazer login com credenciais de teste
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: 'teste@demo.com',
        password: 'demo123'
      })
      
      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          updateTest('Login Demo', 'error', 'Usuário não existe', 
            'O usuário teste@demo.com não foi encontrado. Você precisa criá-lo no Supabase Dashboard.')
        } else {
          updateTest('Login Demo', 'error', 'Erro no login', loginError.message)
        }
      } else {
        updateTest('Login Demo', 'success', 'Login funcionou!', 'Usuário teste@demo.com autenticado')
      }
    } catch (e) {
      updateTest('Login Demo', 'error', 'Exceção', e instanceof Error ? e.message : 'Erro desconhecido')
    }

    setLoading(false)
  }

  const createDemoUser = async () => {
    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    
    try {
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'teste@demo.com',
        password: 'demo123',
        options: {
          data: {
            full_name: 'Usuário Demo',
          }
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          updateTest('Login Demo', 'error', 'Usuário já existe', 
            'O usuário teste@demo.com já foi criado. Tente fazer login.')
        } else {
          updateTest('Login Demo', 'error', 'Erro ao criar', authError.message)
        }
      } else {
        updateTest('Login Demo', 'success', 'Usuário criado!', 
          `ID: ${authData.user?.id}. Verifique se o perfil foi criado na tabela users.`)
      }
    } catch (e) {
      updateTest('Login Demo', 'error', 'Exceção', e instanceof Error ? e.message : 'Erro desconhecido')
    }
    
    setLoading(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Diagnóstico do Sistema</h1>

        {initialStatus !== 'ok' && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <h2 className="font-semibold text-destructive mb-2">⚠️ Erro de Conexão Detectado</h2>
            <p className="text-sm text-muted-foreground">
              O servidor não conseguiu conectar ao Supabase. Verifique as variáveis de ambiente 
              e se o projeto Supabase está ativo.
            </p>
            {initialError && (
              <div className="mt-2 p-2 bg-black/50 rounded text-xs font-mono">
                <div>Code: {initialError.code}</div>
                <div>Message: {initialError.message}</div>
                {initialError.details && <div>Details: {initialError.details}</div>}
              </div>
            )}
          </div>
        )}

        <div className="mb-8 flex gap-4">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Testando...' : '🔄 Rodar Testes'}
          </button>
          
          <button
            onClick={createDemoUser}
            disabled={loading}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
          >
            {loading ? 'Criando...' : '👤 Criar Usuário Demo'}
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <div 
              key={test.name}
              className={`p-4 rounded-lg border ${
                test.status === 'success' ? 'bg-green-500/10 border-green-500/20' :
                test.status === 'error' ? 'bg-destructive/10 border-destructive/20' :
                'bg-muted border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(test.status)}</span>
                    <span className="font-semibold">{test.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                  {test.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{test.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 border border-border rounded-lg">
          <h2 className="font-semibold mb-4">🔗 Links Úteis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/login" 
              className="block p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Ir para Login</div>
              <div className="text-xs text-muted-foreground">Testar autenticação</div>
            </a>
            
            <a 
              href="/setup" 
              className="block p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Setup do Sistema</div>
              <div className="text-xs text-muted-foreground">Configurações e diagnóstico</div>
            </a>
            
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              <div className="font-medium">Supabase Dashboard →</div>
              <div className="text-xs text-muted-foreground">Gerenciar banco de dados</div>
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <h2 className="font-semibold mb-2">📋 Como Resolver o Erro 500</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Verifique se o projeto Supabase está ativo:</strong>
              <br />
              Acesse o <a href="https://supabase.com/dashboard" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Dashboard</a> e confirme que o projeto não está pausado.
            </li>
            <li>
              <strong className="text-foreground">Verifique as variáveis de ambiente:</strong>
              <br />
              Confirme que <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estão corretos no <code className="bg-muted px-1 rounded">.env.local</code>.
            </li>
            <li>
              <strong className="text-foreground">Execute as migrations:</strong>
              <br />
              No SQL Editor do Supabase, execute as migrations 001 a 017 na ordem.
            </li>
            <li>
              <strong className="text-foreground">Crie um usuário de teste:</strong>
              <br />
              Use o botão &quot;Criar Usuário Demo&quot; acima ou crie manualmente no Dashboard.
            </li>
            <li>
              <strong className="text-foreground">Verifique o RLS:</strong>
              <br />
              Certifique-se de que RLS está ativo e as policies estão corretas (migration 006).
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
