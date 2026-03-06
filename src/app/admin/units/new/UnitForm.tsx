'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unitSchema, type UnitInput } from '@/validations/schemas'
import { createUnit } from '../../actions/units'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
}

interface NewUnitPageProps {
  organizations: Organization[]
  units: { id: string; name: string; org_id: string }[]
}

export default function NewUnitPage({ organizations, units }: NewUnitPageProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState('')
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
  })

  const filteredUnits = selectedOrg 
    ? units.filter(u => u.org_id === selectedOrg)
    : []

  const onSubmit = async (data: UnitInput) => {
    if (!selectedOrg) {
      setError('Selecione uma organização')
      return
    }

    setLoading(true)
    setError('')
    
    const result = await createUnit({
      ...data,
      org_id: selectedOrg,
    })
    
    if (result.success) {
      router.push('/admin/units')
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar unidade')
      setLoading(false)
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/units" className="text-primary hover:text-primary/80 text-sm">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">Nova Unidade</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
            <p className="text-yellow-600 mb-4">
              Você precisa criar uma organização antes de criar unidades.
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
          <Link href="/admin/units" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Nova Unidade</h1>
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
                Nome da Unidade *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Ex: Filial São Paulo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-foreground">
                Unidade Pai (opcional)
              </label>
              <select
                {...register('parent_id')}
                id="parent_id"
                disabled={!selectedOrg}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
              >
                <option value="">Nenhuma (Unidade Matriz)</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {!selectedOrg && 'Selecione uma organização primeiro'}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/admin/units"
                className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Unidade'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
