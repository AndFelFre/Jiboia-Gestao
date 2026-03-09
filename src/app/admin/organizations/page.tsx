import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus, Building2, Calendar, Link as LinkIcon } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'
import { deleteOrganization } from '../actions/organizations'

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
            description="Comece criando a sua primeira organização parceira para gerir."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/organizations/new">Criar Primeira Organização</Link>
              </Button>
            }
          />
        ) : result.success && (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Nome da Organização
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Identificador (Slug)
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Data de Registro
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Gerenciamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-100/50 group-hover:scale-105 transition-transform">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-slate-900">{org.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <LinkIcon className="w-3 h-3 opacity-50" />
                        {org.slug}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        {new Date(org.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center gap-2">
                        <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
                          <Link href={`/admin/organizations/${org.id}`}>
                            Gerenciar
                          </Link>
                        </Button>

                        <AdminDeleteButton
                          itemId={org.id}
                          itemName={org.name}
                          onDelete={deleteOrganization}
                          className="h-9 w-9 rounded-xl"
                        />
                      </div>
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
