import Link from 'next/link'
import { getLevels } from '../actions/levels'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

interface Level {
  id: string
  org_id: string
  name: string
  sequence: number
  min_time_months: number
  description?: string
}

export default async function LevelsPage() {
  const [levelsResult, orgsResult] = await Promise.all([
    getLevels(),
    getOrganizations()
  ])

  const levels: Level[] = levelsResult.success && levelsResult.data
    ? (levelsResult.data as Level[])
    : []
  const organizations: Organization[] = orgsResult.success && orgsResult.data
    ? (orgsResult.data as Organization[])
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin" className="text-primary hover:text-primary/80 text-sm font-medium">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Níveis de Carreira</h1>
            </div>
            <Button asChild>
              <Link href="/admin/levels/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Nível
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {levels.length === 0 ? (
          <EmptyState
            title="Nenhum nível encontrado"
            description="Estruture os degraus de evolução da carreira na sua organização."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/levels/new">Criar Primeiro Nível</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sequência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tempo Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Organização
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {levels.map((level) => {
                  const org = organizations.find(o => o.id === level.org_id)

                  return (
                    <tr key={level.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {level.sequence}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{level.name}</div>
                        {level.description && (
                          <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {level.min_time_months} {level.min_time_months === 1 ? 'mês' : 'meses'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{org?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/levels/${level.id}/edit`}
                          className="text-primary hover:text-primary/80"
                        >
                          Editar
                        </Link>
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
