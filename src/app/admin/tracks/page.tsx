import Link from 'next/link'
import { getTracks, deleteTrack } from '../actions/tracks'
import { getOrganizations } from '../actions/organizations'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

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
            description="Desenhe os caminhos de aprendizado e desenvolvimento."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/tracks/new">Criar Primeira Trilha</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const org = organizations.find(o => o.id === track.org_id)
              const stages = track.stages || []

              return (
                <div key={track.id} className="bg-card rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{track.name}</h3>
                      <p className="text-sm text-muted-foreground">{org?.name || '-'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/tracks/${track.id}/edit`}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        Editar
                      </Link>
                      <form action={async () => {
                        'use server'
                        await deleteTrack(track.id)
                      }} className="inline"
                      >
                        <button
                          type="submit"
                          className="text-destructive hover:text-destructive/80 text-sm"
                          onClick={(e) => {
                            if (!confirm('Tem certeza que deseja excluir esta trilha?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>

                  {track.description && (
                    <p className="text-sm text-muted-foreground mb-4">{track.description}</p>
                  )}

                  {stages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Etapas ({stages.length})
                      </h4>
                      <div className="space-y-2">
                        {stages.slice(0, 5).map((stage: { letter?: string; name: string }, idx: number) => (
                          <div key={idx} className="flex items-center text-sm">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mr-2">
                              {stage.letter || idx + 1}
                            </span>
                            <span className="text-foreground truncate">{stage.name}</span>
                          </div>
                        ))}
                        {stages.length > 5 && (
                          <p className="text-xs text-muted-foreground mt-2">+{stages.length - 5} etapas...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
