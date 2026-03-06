'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validations/schemas'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

// Componente que usa useSearchParams precisa de Suspense boundary
function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verifica se veio erro por query param (ex: account_inactive)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'account_inactive') {
      setError('Sua conta está inativa. Entre em contato com o administrador.')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log('🔍 Debug Login:')
      console.log('URL configurada:', envUrl ? '✅' : '❌')
      console.log('Key configurada:', envKey ? '✅ (primeiros 20 chars: ' + envKey.substring(0, 20) + '...)' : '❌')

      setDebugInfo(`URL: ${envUrl ? 'OK' : 'FALTANDO'} | Key: ${envKey ? 'OK' : 'FALTANDO'}`)

      const supabase = createBrowserSupabaseClient()

      console.log('📤 Enviando login para:', data.email)

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        console.error('❌ Erro Supabase:', authError)
        setError(`Erro: ${authError.message} (código: ${authError.status})`)
        return
      }

      console.log('✅ Login bem-sucedido:', authData.user?.email)
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      console.error('❌ Erro inesperado:', err)
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Erro técnico: ${message}`)
      setDebugInfo(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">RG Digital</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão de Colaboradores</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Senha
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              placeholder="******"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {debugInfo && (
            <div className="p-2 bg-muted border border-border rounded text-xs font-mono break-all">
              <p className="text-muted-foreground">{debugInfo}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 border border-border rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Debug:</strong> Abra o console do navegador (F12) para ver logs detalhados
          </p>
        </div>
      </div>
    </div>
  )
}

// Wrapper com Suspense boundary para useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
