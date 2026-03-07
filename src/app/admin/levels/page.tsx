import Link from 'next/link'
import { getLevels } from '../actions/levels'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Hash, Calendar, Layers, Building } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'
import { deleteLevel } from '../actions/levels'

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
            description="Estruture os degraus de evolução da carreira na sua organização para gerar clareza no crescimento."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/levels/new">Criar Primeiro Nível</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Ordem / Nome
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Maturidade (Tempo)
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
                {levels.map((level) => {
                  const org = organizations.find(o => o.id === level.org_id)

                  return (
                    <tr key={level.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black shadow-sm border border-orange-100/50 group-hover:scale-105 transition-transform text-xs">
                            {level.sequence}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{level.name}</div>
                            {level.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate font-medium uppercase tracking-tighter">
                                {level.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          {level.min_time_months} {level.min_time_months === 1 ? 'mês' : 'meses'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Building className="w-3.5 h-3.5 opacity-50" />
                          {org?.name || '-'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-2">
                          <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-600" title="Editar Nível">
                            <Link href={`/admin/levels/${level.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AdminDeleteButton
                            itemId={level.id}
                            itemName={level.name}
                            onDelete={deleteLevel}
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
