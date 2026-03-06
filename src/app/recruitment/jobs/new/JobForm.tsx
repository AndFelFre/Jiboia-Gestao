'use client'

import { useState } from 'react'
import { createJob } from '../../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  org_id: string
}

interface Position {
  id: string
  title: string
  org_id: string
}

interface JobFormProps {
  organizations: Organization[]
  units: Unit[]
  positions: Position[]
}

export default function JobForm({ organizations, units, positions }: JobFormProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState('')
  const router = useRouter()
  
  const filteredUnits = selectedOrg 
    ? units.filter(u => u.org_id === selectedOrg)
    : []
  
  const filteredPositions = selectedOrg 
    ? positions.filter(p => p.org_id === selectedOrg)
    : []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedOrg) {
      setError('Selecione uma organização')
      return
    }

    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    const result = await createJob({
      org_id: selectedOrg,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      unit_id: formData.get('unit_id') as string || null,
      position_id: formData.get('position_id') as string || null,
      location: formData.get('location') as string,
      employment_type: formData.get('employment_type') as string,
      salary_min: formData.get('salary_min') ? parseFloat(formData.get('salary_min') as string) : null,
      salary_max: formData.get('salary_max') ? parseFloat(formData.get('salary_max') as string) : null,
      positions_count: parseInt(formData.get('positions_count') as string) || 1,
      priority: (formData.get('priority') as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
      sla_days: parseInt(formData.get('sla_days') as string) || 30,
      status: 'open',
    })
    
    if (result.success) {
      router.push('/recruitment/jobs')
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar vaga')
      setLoading(false)
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/recruitment/jobs" className="text-primary hover:text-primary/80 text-sm">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">Nova Vaga</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
            <p className="text-yellow-600 mb-4">Você precisa criar uma organização primeiro.</p>
            <Link href="/admin/organizations/new" className="text-primary hover:text-primary/80 font-medium">
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
          <Link href="/recruitment/jobs" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Nova Vaga</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="org_id" className="block text-sm font-medium text-foreground">Organização *</label>
              <select
                id="org_id"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecione...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground">Título da Vaga *</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Ex: Analista de Vendas Sênior"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="position_id" className="block text-sm font-medium text-foreground">Cargo</label>
                <select
                  name="position_id"
                  id="position_id"
                  disabled={!selectedOrg}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                >
                  <option value="">Selecione...</option>
                  {filteredPositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit_id" className="block text-sm font-medium text-foreground">Unidade</label>
                <select
                  name="unit_id"
                  id="unit_id"
                  disabled={!selectedOrg}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-muted"
                >
                  <option value="">Matriz</option>
                  {filteredUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">Descrição</label>
              <textarea
                name="description"
                id="description"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Descreva a vaga, responsabilidades e requisitos..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground">Local</label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              <div>
                <label htmlFor="employment_type" className="block text-sm font-medium text-foreground">Tipo</label>
                <select
                  name="employment_type"
                  id="employment_type"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="clt">CLT</option>
                  <option value="pj">PJ</option>
                  <option value="intern">Estágio</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div>
                <label htmlFor="positions_count" className="block text-sm font-medium text-foreground">Vagas</label>
                <input
                  type="number"
                  name="positions_count"
                  id="positions_count"
                  min="1"
                  defaultValue="1"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-foreground">Prioridade</label>
                <select
                  name="priority"
                  id="priority"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="low">Baixa</option>
                  <option value="normal" selected>Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label htmlFor="sla_days" className="block text-sm font-medium text-foreground">SLA (dias)</label>
                <input
                  type="number"
                  name="sla_days"
                  id="sla_days"
                  min="1"
                  defaultValue="30"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-foreground">Salário Mínimo</label>
                <input
                  type="number"
                  name="salary_min"
                  id="salary_min"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-foreground">Salário Máximo</label>
                <input
                  type="number"
                  name="salary_max"
                  id="salary_max"
                  step="0.01"
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/recruitment/jobs"
                className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Vaga'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
