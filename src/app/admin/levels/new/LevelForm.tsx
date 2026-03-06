'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { levelSchema, type LevelInput } from '@/validations/schemas'
import { createLevel } from '../../actions/levels'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
}

interface LevelFormProps {
  organizations: Organization[]
}

export default function LevelForm({ organizations }: LevelFormProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState('')
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LevelInput>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      sequence: 0,
      min_time_months: 0,
    }
  })

  const onSubmit = async (data: LevelInput) => {
    if (!selectedOrg) {
      setError('Selecione uma organização')
      return
    }

    setLoading(true)
    setError('')
    
    const result = await createLevel({
      ...data,
      org_id: selectedOrg,
    })
    
    if (result.success) {
      router.push('/admin/levels')
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar nível')
      setLoading(false)
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/levels" className="text-primary hover:text-primary/80 text-sm">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">Novo Nível</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
            <p className="text-yellow-600 mb-4">
              Você precisa criar uma organização antes de criar níveis.
            </p>            
            <Link
              href="/admin/organizations/new"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Criar organização →
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/levels" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Novo Nível</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="org_id" className="block text-sm font-medium text-foreground">
                Organização *
              </label>
              <select
                id="org_id"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Selecione uma organização...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Nome do Nível *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Ex: Júnior, Pleno, Sênior"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sequence" className="block text-sm font-medium text-foreground">
                  Sequência *
                </label>
                <input
                  {...register('sequence', { valueAsNumber: true })}
                  type="number"
                  id="sequence"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Ordem do nível (0, 1, 2...)
                </p>
                {errors.sequence && (
                  <p className="mt-1 text-sm text-destructive">{errors.sequence.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="min_time_months" className="block text-sm font-medium text-foreground">
                  Tempo Mínimo (meses) *
                </label>
                <input
                  {...register('min_time_months', { valueAsNumber: true })}
                  type="number"
                  id="min_time_months"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Tempo mínimo neste nível
                </p>
                {errors.min_time_months && (
                  <p className="mt-1 text-sm text-destructive">{errors.min_time_months.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Descrição
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Descrição do nível e responsabilidades..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/levels"
                className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Nível'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
