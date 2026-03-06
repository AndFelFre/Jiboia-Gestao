'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/validations/schemas'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShieldCheck,
  BrainCircuit,
  BarChart3,
  Lock,
  Mail,
  Sparkles,
  ArrowRight
} from 'lucide-react'

function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

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

    try {
      const supabase = createBrowserSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError(`Credenciais inválidas ou erro de acesso.`)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError('Ocorreu um erro inesperado ao processar seu login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 overflow-hidden font-sans selection:bg-primary/30">

      {/* Coluna da Esquerda: Vitrine Futurista */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950">

        {/* Elementos Visuais de Fundo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        {/* Logo/Brand */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter leading-none">RG DIGITAL</span>
            <span className="text-primary text-[10px] font-black tracking-[0.3em] uppercase opacity-80">Enterprise 2.0</span>
          </div>
        </div>

        {/* Content Showcase */}
        <div className="relative z-10 space-y-16 py-10">
          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
              O Futuro do <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-emerald-400">People Intelligence</span> <br />
              está aqui.
            </h2>
            <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
              Mapeie talentos, antecipe sucessões e fortaleça sua governança com o poder da IA.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-md">
            <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all cursor-default translate-x-0 hover:translate-x-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">IA de Sucessão</h4>
                <p className="text-slate-500 text-xs mt-0.5">Mapeamento preditivo de talentos.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all cursor-default translate-x-0 hover:translate-x-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Analytics 360º</h4>
                <p className="text-slate-500 text-xs mt-0.5">Dados dinâmicos para decisões ágeis.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/10 transition-all cursor-default translate-x-0 hover:translate-x-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Governança Ética</h4>
                <p className="text-slate-500 text-xs mt-0.5">Segurança e auditoria de ponta.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-6">
          <span>Build 2024.03</span>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <span>© RG DIGITAL GLOBAL</span>
        </div>
      </div>

      {/* Coluna da Direita: Form de Login */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative bg-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] opacity-10" />

        <div className="w-full max-w-sm z-10 space-y-8">
          <div className="lg:hidden text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 mx-auto flex items-center justify-center shadow-2xl">
              <Sparkles className="text-white w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tighter">RG DIGITAL</h1>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary">Intelligence</p>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all duration-700 group-focus-within:bg-primary/20" />

            <div className="mb-8 relative z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Login</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">Protegido por Criptografia de Ponta</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Endereço de E-mail
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-12 pr-4 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                    placeholder="exemplo@corporativo.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-bold uppercase text-rose-500 ml-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Senha de Acesso
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className="block w-full pl-12 pr-4 py-4 bg-slate-950 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] font-bold uppercase text-rose-500 ml-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-rose-200">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? 'Validando Acesso...' : 'Autenticar'}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-xs font-medium">
              Problemas com seu acesso? <span className="text-primary hover:underline cursor-pointer">Contate o DHO</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black tracking-widest text-sm animate-pulse">
        SISTEMA INICIALIZANDO...
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

