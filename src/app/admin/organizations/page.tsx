import Link from 'next/link'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/ui/feedback'

interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export default async function OrganizationsPage() {
  const result = await getOrganizations()
  const organizations: Organization[] = result.success && result.data
    ? (result.data as Organization[])
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
              <h1 className="text-2xl font-bold text-foreground mt-1">Organizações</h1>
            </div>
            <Button asChild>
              <Link href="/admin/organizations/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Organização
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result.success && (
          <ErrorState
            title="Erro ao carregar organizações"
            description={result.error}
            className="mb-8"
          />
        )}

        {result.success && organizations.length === 0 ? (
          <EmptyState
            title="Nenhuma organização encontrada"
            description="Comece criando a sua primeira organização parceira."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/organizations/new">Criar Primeira Organização</Link>
              </Button>
            }
          />
        ) : result.success && (
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Criada em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{org.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{org.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {new Date(org.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/organizations/${org.id}/edit`}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Editar
                      </Link>
                      <form action="" className="inline">
                        <button
                          type="submit"
                          className="text-destructive hover:text-destructive/80"
                        >
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
