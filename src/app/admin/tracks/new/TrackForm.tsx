'use client'

import { useState } from 'react'
import { createTrack } from '../../actions/tracks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TrackStage } from '@/types'

interface Organization {
  id: string
  name: string
}

interface TrackFormProps {
  organizations: Organization[]
}

export default function TrackForm({ organizations }: TrackFormProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stages, setStages] = useState<TrackStage[]>([])
  const router = useRouter()

  const addStage = () => {
    const keys = ['T', 'H', 'R', 'E', 'A', 'S', 'O', 'N']
    const nextKey = keys[stages.length] || String.fromCharCode(65 + stages.length)
    
    setStages([...stages, {
      key: nextKey,
      sequence: stages.length,
      name: '',
      description: '',
      requirements: []
    }])
  }

  const updateStage = (index: number, field: keyof TrackStage, value: string | string[]) => {
    const updated = [...stages]
    updated[index] = { ...updated[index], [field]: value }
    setStages(updated)
  }

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrg) {
      setError('Selecione uma organização')
      return
    }
    
    if (!name.trim()) {
      setError('Digite o nome da trilha')
      return
    }

    setLoading(true)
    setError('')
    
    const result = await createTrack({
      name,
      description,
      stages,
      org_id: selectedOrg,
    })
    
    if (result.success) {
      router.push('/admin/tracks')
      router.refresh()
    } else {
      setError(result.error || 'Erro ao criar trilha')
      setLoading(false)
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/tracks" className="text-primary hover:text-primary/80 text-sm">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">Nova Trilha</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-600 mb-2">⚠️ Atenção</h2>
            <p className="text-yellow-600 mb-4">Você precisa criar uma organização antes de criar trilhas.</p>            
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
          <Link href="/admin/tracks" className="text-primary hover:text-primary/80 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Nova Trilha</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="org_id" className="block text-sm font-medium text-foreground">Organização *</label>
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
              <label htmlFor="name" className="block text-sm font-medium text-foreground">Nome da Trilha *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Ex: Trilha de Liderança"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">Descrição</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Descreva o objetivo desta trilha..."
              />
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-foreground">Etapas da Trilha</h3>
                <button
                  type="button"
                  onClick={addStage}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  + Adicionar Etapa
                </button>
              </div>

              {stages.length === 0 && (
                <p className="text-muted-foreground text-sm">Nenhuma etapa adicionada. Clique em &quot;Adicionar Etapa&quot; para começar.</p>
              )}

              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={index} className="bg-muted/50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-3">
                          {stage.key}
                        </span>
                        <span className="text-sm font-medium text-foreground">Etapa {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Key/Identificador</label>
                        <input
                          type="text"
                          value={stage.key}
                          onChange={(e) => updateStage(index, 'key', e.target.value)}
                          className="block w-full px-3 py-2 border border-input rounded text-sm"
                          placeholder="Ex: T"
                          maxLength={10}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-foreground mb-1">Nome da Etapa</label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(index, 'name', e.target.value)}
                          className="block w-full px-3 py-2 border border-input rounded text-sm"
                          placeholder="Ex: Trainee"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-foreground mb-1">Descrição</label>
                        <textarea
                          value={stage.description}
                          onChange={(e) => updateStage(index, 'description', e.target.value)}
                          rows={2}
                          className="block w-full px-3 py-2 border border-input rounded text-sm"
                          placeholder="Descreva esta etapa..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/tracks"
                className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Trilha'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
