import Link from 'next/link'
import { getUnits } from '../actions/units'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Building, GitCommit } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'
import { deleteUnit } from '../actions/units'

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
            description="Organize a estrutura da sua empresa criando filiais, departamentos ou centros de custo."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/units/new">Criar Primeira Unidade</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Estrutura / Unidade
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Organização
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Hierarquia
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Gerenciamento
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {units.map((unit) => {
                  const parentUnit = units.find(u => u.id === unit.parent_id)
                  const org = organizations.find(o => o.id === unit.org_id)

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 group-hover:scale-105 transition-transform">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="text-sm font-bold text-slate-900">{unit.name}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Building className="w-3.5 h-3.5 opacity-50" />
                          {org?.name || '-'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-50 border border-slate-100 w-fit">
                          <GitCommit className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                            {parentUnit?.name || 'Unidade Matriz'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-2">
                          <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
                            <Link href={`/admin/units/${unit.id}/edit`}>
                              Editar
                            </Link>
                          </Button>
                          <AdminDeleteButton
                            itemId={unit.id}
                            itemName={unit.name}
                            onDelete={deleteUnit}
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
