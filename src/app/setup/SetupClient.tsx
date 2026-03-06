'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export default function SetupClient() {
  const [testResult, setTestResult] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const config = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

    const urlValid = /^https?:\/\/.+/i.test(url)
    const keyValid = key.length > 20

    const maskedKey = keyValid ? `${key.slice(0, 10)}…${key.slice(-6)}` : ''

    return { url, key, maskedKey, urlValid, keyValid }
  }, [])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setLoading(true)
    setTestResult('')
    setLogs([])
    
    try {
      addLog('🔍 Verificando variáveis de ambiente...')
      
      if (!config.urlValid || !config.keyValid) {
        addLog('❌ ERRO: URL ou chave inválida!')
        setTestResult('❌ URL ou chave inválida.')
        setLoading(false)
        return
      }
      
      addLog(`✓ URL configurada: ${config.url.substring(0, 30)}...`)
      addLog(`✓ KEY configurada: ${config.maskedKey}`)
      
      // Testar endpoint REST
      addLog('')
      addLog('🌐 Testando conexão REST...')
      
      const response = await fetch(`${config.url}/rest/v1/roles?select=*`, {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✓ Conexão REST OK!`)
        addLog(`  Encontradas ${data.length} roles`)
        setTestResult('✅ Conexão OK! O Supabase respondeu.')
      } else {
        const errorText = await response.text()
        addLog(`❌ Erro REST ${response.status}:`)
        addLog(`  ${errorText.substring(0, 200)}`)
        setTestResult(`❌ Erro ${response.status}: ${errorText.substring(0, 100)}`)
      }
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      addLog(`❌ Erro inesperado: ${message}`)
      setTestResult(`❌ Erro de conexão: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseQuery = async () => {
    setLoading(true)
    setTestResult('')
    setLogs([])
    
    try {
      addLog('🔍 Testando queries no banco...')
      
      if (!config.urlValid || !config.keyValid) {
        addLog('❌ Variáveis de ambiente não configuradas')
        setTestResult('❌ URL ou chave inválida.')
        setLoading(false)
        return
      }
      
      // Testar tabelas específicas
      const tables = ['roles', 'organizations', 'users', 'units']
      let successCount = 0
      
      for (const table of tables) {
        addLog(`  Testando tabela: ${table}...`)
        
        const response = await fetch(`${config.url}/rest/v1/${table}?select=count`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`,
          },
        })
        
        if (response.ok) {
          addLog(`    ✓ ${table} acessível`)
          successCount++
        } else {
          const error = await response.text()
          addLog(`    ❌ ${table} erro ${response.status}: ${error.substring(0, 100)}`)
        }
      }
      
      if (successCount === tables.length) {
        setTestResult(`✅ Todas as ${tables.length} tabelas estão acessíveis!`)
      } else {
        setTestResult(`⚠️ ${successCount}/${tables.length} tabelas acessíveis`)
      }
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      addLog(`❌ Erro: ${message}`)
      setTestResult(`❌ Erro: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-primary hover:underline"
          >
            ← Voltar para Home
          </Link>
          <h1 className="text-3xl font-bold mt-4">🐛 Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Ferramenta de diagnóstico para identificar problemas de conexão
          </p>
          <div className="mt-2 inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            ⚠️ Ambiente de desenvolvimento apenas
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <section className="border-b border-border pb-6">
            <h2 className="mb-4 text-lg font-medium">Configuração do Supabase</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <div 
                  className={`rounded border p-3 ${config.urlValid ? 'border-border bg-background' : 'border-destructive bg-destructive/5'}`}
                >
                  <code className="break-all text-sm">
                    {config.url || '❌ Não definida'}
                  </code>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <div 
                  className={`rounded border p-3 ${config.keyValid ? 'border-border bg-background' : 'border-destructive bg-destructive/5'}`}
                >
                  <code className="break-all text-sm">
                    {config.keyValid ? config.maskedKey : '❌ Não definida'}
                  </code>
                </div>
              </div>

              {config.urlValid && config.keyValid && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={testConnection}
                    disabled={loading}
                    className="w-full rounded bg-primary px-4 py-3 text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Testando...' : '🧪 Testar Conexão'}
                  </button>
                  
                  <button
                    onClick={testDatabaseQuery}
                    disabled={loading}
                    className="w-full rounded bg-secondary px-4 py-3 text-secondary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Testando...' : '🔍 Testar Tabelas'}
                  </button>
                </div>
              )}

              {testResult && (
                <div className="rounded border border-border bg-background p-4">
                  <p className="text-sm font-medium">{testResult}</p>
                </div>
              )}
            </div>
          </section>

          {logs.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-4 text-lg font-medium">Logs</h2>
              <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto border border-border">
                <pre className="whitespace-pre-wrap">
                  {logs.join('\n')}
                </pre>
              </div>
            </section>
          )}

          <section className="mt-6">
            <h2 className="mb-4 text-lg font-medium">Links úteis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="/login" 
                className="block rounded border border-border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="font-medium">Ir para Login</div>
                <div className="text-sm text-muted-foreground">Testar autenticação</div>
              </a>

              <a
                href="/dashboard"
                className="block rounded border border-border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="font-medium">Dashboard</div>
                <div className="text-sm text-muted-foreground">Verificar sessão</div>
              </a>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded border border-border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="font-medium">Supabase Dashboard →</div>
                <div className="text-sm text-muted-foreground">Gerenciar projeto</div>
              </a>

              <a
                href="/admin"
                className="block rounded border border-border bg-background p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="font-medium">Painel Admin</div>
                <div className="text-sm text-muted-foreground">Configurar dados</div>
              </a>
            </div>
          </section>

          <section className="mt-6 p-6 bg-muted/50 border border-border rounded-lg">
            <h2 className="font-semibold mb-4">📋 Instruções de Correção</h2>
            
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <strong>Se der erro 500 no teste:</strong>
                <p className="mt-1 ml-6 text-sm">
                  Execute a migration 005 no Supabase SQL Editor para corrigir o banco.
                </p>
              </li>
              <li>
                <strong>Se variáveis de ambiente não aparecerem:</strong>
                <p className="mt-1 ml-6 text-sm">
                  Reinicie o servidor Next.js (Ctrl+C e npm run dev)
                </p>
              </li>
              <li>
                <strong>Se auth falhar:</strong>
                <p className="mt-1 ml-6 text-sm">
                  Verifique se o usuário foi criado no Supabase Auth
                </p>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}
