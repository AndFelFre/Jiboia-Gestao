import Link from 'next/link'
import { getTracks, deleteTrack } from '../actions/tracks'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus, GitBranch, Building, Trash2, Edit } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

export default async function TracksPage() {
  const [tracksResult, orgsResult] = await Promise.all([
    getTracks(),
    getOrganizations()
  ])

  const tracks = tracksResult.success && tracksResult.data ? tracksResult.data : []
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
              <h1 className="text-2xl font-bold text-foreground mt-1">Trilhas</h1>
            </div>
            <Button asChild>
              <Link href="/admin/tracks/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Trilha
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tracks.length === 0 ? (
          <EmptyState
            title="Nenhuma trilha encontrada"
            description="Desenhe os caminhos de aprendizado e desenvolvimento para guiar seus talentos."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/tracks/new">Criar Primeira Trilha</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {tracks.map((track) => {
              const org = organizations.find(o => o.id === track.org_id)
              const stages = track.stages || []

              return (
                <div key={track.id} className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all p-8 flex flex-col items-stretch border-b-4 border-b-slate-100 hover:border-b-primary/40">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 shadow-sm border border-pink-100 group-hover:scale-110 transition-transform">
                        <GitBranch className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{track.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          <Building className="w-3 h-3" />
                          {org?.name || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary">
                        <Link href={`/admin/tracks/${track.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AdminDeleteButton
                        itemId={track.id}
                        itemName={track.name}
                        onDelete={deleteTrack}
                        className="h-9 w-9 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    {track.description && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">
                        {track.description}
                      </p>
                    )}

                    {stages.length > 0 && (
                      <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                          Timeline ({stages.length})
                        </h4>
                        <div className="space-y-3">
                          {stages.slice(0, 3).map((stage: { letter?: string; name: string }, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 group/item">
                              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-black group-hover/item:border-primary group-hover/item:text-primary transition-colors">
                                {stage.letter || idx + 1}
                              </div>
                              <span className="text-xs font-bold text-slate-600 truncate">{stage.name}</span>
                            </div>
                          ))}
                          {stages.length > 3 && (
                            <div className="pt-1 px-1">
                              <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                                + {stages.length - 3} etapas adicionais
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
