import Link from 'next/link'
import { getJobs, getCandidates } from './actions'

export const dynamic = 'force-dynamic'

export default async function RecruitmentDashboard() {
  const [jobsResult, candidatesResult] = await Promise.all([
    getJobs(),
    getCandidates()
  ])
  
  const jobs = jobsResult.success && jobsResult.data ? jobsResult.data : []
  const candidates = candidatesResult.success && candidatesResult.data ? candidatesResult.data : []
  
  const openJobs = jobs.filter(j => j.status === 'open')
  const totalCandidates = candidates.length
  const newCandidates = candidates.filter(c => c.stage === 'new').length
  const inProcessCandidates = candidates.filter(c => 
    ['screening', 'interview_1', 'interview_2', 'technical', 'cultural'].includes(c.stage)
  ).length
  
  const stageLabels: Record<string, string> = {
    new: 'Novo',
    screening: 'Triagem',
    interview_1: 'Entrevista 1',
    interview_2: 'Entrevista 2',
    technical: 'Técnica',
    cultural: 'Cultural',
    offer: 'Proposta',
    hired: 'Contratado',
    rejected: 'Reprovado'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-primary hover:text-primary/80 text-sm">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Recrutamento</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/recruitment/jobs/new"
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
              >
                + Nova Vaga
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-muted-foreground">Vagas Abertas</p>
            <p className="text-3xl font-bold text-primary mt-2">{openJobs.length}</p>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Candidatos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalCandidates}</p>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-muted-foreground">Novos</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{newCandidates}</p>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <p className="text-sm font-medium text-muted-foreground">Em Processo</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{inProcessCandidates}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Vagas Recentes</h2>
              <Link href="/recruitment/jobs" className="text-primary hover:text-primary/80 text-sm">
                Ver todas →
              </Link>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.positions?.title || 'Cargo não definido'} • {job.units?.name || 'Matriz'}
                      </p>
                    </div>
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
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <span className="mr-4">{candidates.filter(c => c.job_id === job.id).length} candidatos</span>
                    <span>SLA: {job.sla_days} dias</span>
                  </div>
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma vaga cadastrada
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Candidatos Recentes</h2>
              <Link href="/recruitment/candidates" className="text-primary hover:text-primary/80 text-sm">
                Ver todos →
              </Link>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              {candidates.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="p-4 border-b last:border-b-0 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">{candidate.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      candidate.stage === 'new' ? 'bg-muted text-muted-foreground' :
                      candidate.stage === 'hired' ? 'bg-green-500/10 text-green-600' :
                      candidate.stage === 'rejected' ? 'bg-destructive/10 text-destructive' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {stageLabels[candidate.stage] || candidate.stage}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vaga: {candidate.jobs?.title || 'N/A'}
                  </p>
                  
                  {candidate.fit_score && (
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">Fit Score:</span>
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${candidate.fit_score * 25}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-medium">{candidate.fit_score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {candidates.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum candidato cadastrado
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
