import Link from 'next/link'
import { getJobs } from '../actions'
import { getOrganizations } from '@/app/admin/actions/organizations'
import { getUnits } from '@/app/admin/actions/units'
import { getPositions } from '@/app/admin/actions/positions'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
}

interface Position {
  id: string
  title: string
}

interface Job {
  id: string
  org_id: string
  unit_id: string
  position_id: string
  title: string
  status: string
  created_at: string
  positions_count?: number
  location?: string
  priority?: 'urgent' | 'high' | 'normal' | 'low'
}

export default async function JobsPage() {
  const [jobsResult, orgsResult, unitsResult, positionsResult] = await Promise.all([
    getJobs(),
    getOrganizations(),
    getUnits(),
    getPositions()
  ])
  
  const jobs: Job[] = jobsResult.success && jobsResult.data 
    ? (jobsResult.data as Job[]) 
    : []
  const organizations: Organization[] = orgsResult.success && orgsResult.data 
    ? (orgsResult.data as Organization[]) 
    : []
  const units: Unit[] = unitsResult.success && unitsResult.data 
    ? (unitsResult.data as Unit[]) 
    : []
  const positions: Position[] = positionsResult.success && positionsResult.data 
    ? (positionsResult.data as Position[]) 
    : []

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/recruitment" className="text-primary hover:text-primary/80 text-sm">
                ← Recrutamento
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Vagas</h1>
            </div>
            <Link
              href="/recruitment/jobs/new"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
            >
              + Nova Vaga
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex space-x-4">
          {['Todas', 'Abertas', 'Pausadas', 'Fechadas'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-input rounded-md hover:bg-muted"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vaga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {jobs.map((job) => {
                const org = organizations.find(o => o.id === job.org_id)
                const unit = units.find(u => u.id === job.unit_id)
                const position = positions.find(p => p.id === job.position_id)
                
                return (
                  <tr key={job.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">{job.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {position?.title || 'Cargo não definido'} • {org?.name}
                      </div>
                      {job.positions_count && job.positions_count > 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {job.positions_count} posições
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{unit?.name || 'Matriz'}</div>
                      {job.location && (
                        <div className="text-xs text-muted-foreground">{job.location}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'open' ? 'bg-green-500/10 text-green-600' :
                        job.status === 'paused' ? 'bg-yellow-500/10 text-yellow-600' :
                        job.status === 'draft' ? 'bg-muted text-muted-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {job.status === 'open' ? 'Aberta' :
                         job.status === 'paused' ? 'Pausada' :
                         job.status === 'draft' ? 'Rascunho' : 'Fechada'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                        job.priority === 'high' ? 'bg-orange-500/10 text-orange-600' :
                        job.priority === 'normal' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {job.priority === 'urgent' ? 'Urgente' :
                         job.priority === 'high' ? 'Alta' :
                         job.priority === 'normal' ? 'Normal' : 'Baixa'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/recruitment/jobs/${job.id}`}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {jobs.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              Nenhuma vaga cadastrada
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
