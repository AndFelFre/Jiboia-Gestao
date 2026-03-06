import Link from 'next/link'
import { getPositions, deletePosition } from '../actions/positions'
import { getOrganizations } from '../actions/organizations'
import { getLevels } from '../actions/levels'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function PositionsPage() {
  const [positionsResult, orgsResult, levelsResult] = await Promise.all([
    getPositions(),
    getOrganizations(),
    getLevels()
  ])

  const positions = positionsResult.success && positionsResult.data ? positionsResult.data : []
  const organizations: Organization[] = orgsResult.success && orgsResult.data
    ? (orgsResult.data as Organization[])
    : []
  const levels = levelsResult.success && levelsResult.data ? levelsResult.data : []

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
            description="Defina as funções e responsabilidades da sua organização."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/positions/new">Criar Primeiro Cargo</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Organização
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {positions.map((position) => {
                  const org = organizations.find(o => o.id === position.org_id)
                  const level = levels.find(l => l.id === position.level_id)

                  return (
                    <tr key={position.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{position.title}</div>
                        {position.description && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">{position.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {level ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600">
                            {level.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{org?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/performance/positions/${position.id}`}
                          className="text-primary hover:text-primary/80 mr-4 font-bold text-xs uppercase"
                        >
                          Competências
                        </Link>
                        <Link
                          href={`/admin/positions/${position.id}/edit`}
                          className="text-muted-foreground hover:text-foreground mr-4 text-xs"
                        >
                          Editar
                        </Link>
                        <form action={async () => {
                          'use server'
                          await deletePosition(position.id)
                        }} className="inline">
                          <button
                            type="submit"
                            className="text-destructive hover:text-destructive/80"
                            onClick={(e) => {
                              if (!confirm('Tem certeza que deseja excluir este cargo?')) {
                                e.preventDefault()
                              }
                            }}
                          >
                            Excluir
                          </button>
                        </form>
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
