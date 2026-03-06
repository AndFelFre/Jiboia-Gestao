import Link from 'next/link'
import { getUnits } from '../actions/units'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function UnitsPage() {
  const [unitsResult, orgsResult] = await Promise.all([
    getUnits(),
    getOrganizations()
  ])

  interface Unit {
    id: string
    name: string
    org_id: string
    parent_id?: string
    organizations?: { name: string }
  }
  const units: Unit[] = unitsResult.success && unitsResult.data ? (unitsResult.data as Unit[]) : []
  const organizations: Organization[] = orgsResult.success && orgsResult.data
    ? (orgsResult.data as Organization[])
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin" className="text-primary hover:text-primary/80 text-sm">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Unidades</h1>
            </div>
            <Button asChild>
              <Link href="/admin/units/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Unidade
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {units.length === 0 ? (
          <EmptyState
            title="Nenhuma unidade encontrada"
            description="Organize a sua estrutura criando filiais ou departamentos."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/units/new">Criar Primeira Unidade</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Organização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Unidade Pai
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {units.map((unit) => {
                  const parentUnit = units.find(u => u.id === unit.parent_id)
                  const org = organizations.find(o => o.id === unit.org_id)

                  return (
                    <tr key={unit.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{unit.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{org?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {parentUnit?.name || 'Nenhuma (Matriz)'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/units/${unit.id}/edit`}
                          className="text-primary hover:text-primary/80 mr-4"
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
