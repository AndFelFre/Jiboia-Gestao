import Link from 'next/link'
import { getPositions, deletePosition } from '../actions/positions'
import { getOrganizations } from '../actions/organizations'
import { getLevels } from '../actions/levels'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, Layers, Building, Award, Edit } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'

interface Organization {
  id: string
  name: string
}

export const dynamic = 'force-dynamic'

export default async function PositionsPage() {
  let positions: any[] = []
  let organizations: Organization[] = []
  let levels: any[] = []
  let error: string | null = null

  try {
    console.log('[PositionsPage] Iniciando busca de dados...')
    const [positionsResult, orgsResult, levelsResult] = await Promise.all([
      getPositions(),
      getOrganizations(),
      getLevels()
    ])

    console.log('[PositionsPage] Resultados:', {
      positions: positionsResult.success ? `${(positionsResult.data as any[])?.length || 0} encontrados` : `ERRO: ${positionsResult.error}`,
      orgs: orgsResult.success ? `${(orgsResult.data as any[])?.length || 0} encontrados` : `ERRO: ${orgsResult.error}`,
      levels: levelsResult.success ? `${(levelsResult.data as any[])?.length || 0} encontrados` : `ERRO: ${levelsResult.error}`
    })

    if (positionsResult.success) positions = positionsResult.data || []
    if (orgsResult.success) organizations = orgsResult.data as Organization[] || []
    if (levelsResult.success) levels = levelsResult.data || []

    // Só exibimos erro se a busca de posições falhar criticamente
    if (!positionsResult.success) {
      error = positionsResult.error || 'Erro ao carregar cargos'
    }
  } catch (e) {
    console.error('Erro crítico não tratado em PositionsPage:', e)
    error = 'Exceção de servidor detectada. Verifique os logs.'
  }

  if (error && positions.length === 0) {
    return (
      <div className="p-8 text-center bg-background min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-4">Erro na Aba de Cargos</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin">Voltar para Admin</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin" className="text-primary hover:text-primary/80 text-sm">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Cargos</h1>
            </div>
            <Button asChild>
              <Link href="/admin/positions/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cargo
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {positions.length === 0 ? (
          <EmptyState
            title="Nenhum cargo encontrado"
            description="Defina as funções, responsabilidades e competências necessárias para cada posição."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/positions/new">Criar Primeiro Cargo</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Nome do Cargo / Descrição
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Nível de Carreira
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Organização
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Gerenciamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {positions.map((position) => {
                  if (!position || !position.id) return null
                  const org = Array.isArray(organizations) ? organizations.find(o => o.id === position.org_id) : null
                  const level = Array.isArray(levels) ? levels.find(l => l.id === position.level_id) : null

                  return (
                    <tr key={position.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50 group-hover:scale-105 transition-transform">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{position.title}</div>
                            {position.description && (
                              <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate font-medium uppercase tracking-tighter">
                                {position.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {level ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full border border-purple-100">
                            <Award className="w-3.5 h-3.5" />
                            {level.name}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest px-3">S/ Nível</span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Building className="w-3.5 h-3.5 opacity-50" />
                          {org?.name || '-'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-2">
                          <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-primary hover:bg-primary/5">
                            <Link href={`/admin/performance/positions/${position.id}`}>
                              Skills
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400" title="Editar Cargo">
                            <Link href={`/admin/positions/${position.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AdminDeleteButton
                            itemId={position.id}
                            itemName={position.title}
                            onDelete={deletePosition}
                            className="h-9 w-9 rounded-xl"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
