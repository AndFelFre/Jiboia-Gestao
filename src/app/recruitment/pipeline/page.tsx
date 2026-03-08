import Link from 'next/link'
import { getJobs } from '@/services/recruitment/jobs'
import { getCandidates } from '@/services/recruitment/candidates'
import { KanbanBoard } from '@/components/recruitment/KanbanBoard'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PipelinePage({
    searchParams
}: {
    searchParams: { jobId?: string }
}) {
    // 1. Carrega os empregos abertos para montar o Dropdown 
    const jobsRes = await getJobs()
    const jobs = jobsRes.success && jobsRes.data ? jobsRes.data.filter(j => j.status === 'open') : []

    // 2. Decide qual jobId está ativo (se não houver na URL, pega o primeiro disponível)
    const activeJobId = searchParams.jobId || (jobs.length > 0 ? jobs[0].id : undefined)
    const activeJob = jobs.find(j => j.id === activeJobId)

    // 3. Busca candidatos SOMENTE para a vaga selecionada
    const candidatesRes = activeJobId ? await getCandidates(activeJobId) : { success: true, data: [] }
    const candidates = candidatesRes.success && candidatesRes.data ? candidatesRes.data : []

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <header className="bg-card shadow-sm border-b border-border z-10">
                <div className="max-w-[1600px] mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Link href="/recruitment" className="text-primary hover:underline text-sm font-medium mb-1 inline-block">
                            &larr; Voltar para Recrutamento
                        </Link>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Pipeline de Candidatos
                        </h1>
                    </div>

                    {jobs.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2">Vaga Ativa:</span>
                            <form className="relative">
                                {/* Componente nativo de form com server action de refresh ao mudar seria legal, mas um select via browser + get no search params funciona direto */}
                                <select
                                    defaultValue={activeJobId}
                                    onChange={(e) => {
                                        window.location.href = `/recruitment/pipeline?jobId=${e.target.value}`
                                    }}
                                    className="bg-card border border-input text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-64 p-2.5 shadow-sm font-medium"
                                >
                                    <option value="" disabled>Selecione uma vaga...</option>
                                    {jobs.map(job => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}  {job.location ? ` - ${job.location}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col items-stretch h-full">
                {jobs.length === 0 ? (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-start gap-3 mt-4">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                            <h3 className="font-semibold">Nenhuma vaga ativa</h3>
                            <p className="text-sm">Você precisa criar ao menos uma vaga antes de acessar o pipeline de candidatos.</p>
                            <Link href="/recruitment/jobs/new" className="text-sm font-semibold hover:underline mt-2 inline-block">
                                Criar Vaga
                            </Link>
                        </div>
                    </div>
                ) : !activeJob ? (
                    <div className="text-center text-muted-foreground p-10 bg-card rounded-xl border border-border mt-4">
                        Selecione uma vaga no menu superior para visualizar o pipeline de candidatos associado a ela.
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full bg-card/50 overflow-hidden border border-border shadow-inner rounded-xl">
                        {/* Seção Estatística Rápida */}
                        <div className="flex bg-muted/40 p-4 border-b border-border justify-between items-center shrinkage-0 gap-6 overflow-x-auto text-sm">
                            <div className="font-medium text-foreground whitespace-nowrap">
                                Estatísticas da Vaga:
                            </div>
                            <div className="flex gap-6 whitespace-nowrap">
                                <span className="text-muted-foreground">Total: <b className="text-foreground">{candidates.length}</b></span>
                                <span className="text-muted-foreground">Novos: <b className="text-yellow-600 dark:text-yellow-500">{candidates.filter(c => c.stage === 'new').length}</b></span>
                                <span className="text-muted-foreground">Em processo: <b className="text-primary">{candidates.filter(c => c.stage !== 'hired' && c.stage !== 'rejected' && c.stage !== 'new').length}</b></span>
                                <span className="text-muted-foreground">Contratados: <b className="text-green-600 dark:text-green-500">{candidates.filter(c => c.stage === 'hired').length}</b></span>
                            </div>
                        </div>

                        {/* Conteiner Wrapper do Kanban (scroll horizontal ativo) */}
                        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 relative kanban-scroll-area h-[calc(100vh-270px)] custom-scrollbar">
                            <KanbanBoard initialCandidates={candidates} />
                        </div>
                    </div>
                )}
            </main>
            {/* O estilo CSS abaixo garante rolagem fina nos boards */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--border);
                    border-radius: 20px;
                }
            `}} />
        </div>
    )
}
