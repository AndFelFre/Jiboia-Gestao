import { getCandidates, getInterviews } from '@/app/recruitment/actions'
import { StarEvaluationForm } from '@/components/recruitment/StarEvaluationForm'
import { PIPELINE_STAGES } from '@/components/recruitment/constants'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, User, FileText, Briefcase, Calendar, Star, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
    // Busca candidato (hack pegando todos e filtrando no server p/ aproveitar as actions base)
    // Num cenario ideal existiria getCandidateById
    const { data: candidates } = await getCandidates()
    const candidate = candidates?.find(c => c.id === params.id)

    // Busca as entrevistas cadastradas para este candaditato
    const { data: interviews } = await getInterviews(params.id)

    if (!candidate) {
        return <div className="p-8 text-center text-destructive">Candidato não encontrado.</div>
    }

    const stageLabel = PIPELINE_STAGES.find(s => s.id === candidate.stage)?.title || candidate.stage

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card shadow-sm border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/recruitment/pipeline?jobId=${candidate.job_id}`}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-muted"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-none">{candidate.full_name}</h1>
                            <p className="text-sm text-primary font-medium mt-1">
                                {candidate.jobs?.title || 'Vaga não especificada'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
                            Etapa Atual: <b className="text-foreground">{stageLabel}</b>
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda: Dados do Candidato */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-muted-foreground" />
                            Perfil do Candidato
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">E-mail</span>
                                <span className="text-sm font-medium">{candidate.email}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Telefone</span>
                                <span className="text-sm font-medium">{candidate.phone || 'N/D'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Origem (Source)</span>
                                <span className="text-sm font-medium capitalize">{candidate.source || 'Orgânico'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Cadastrado em</span>
                                <span className="text-sm font-medium flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {format(new Date(candidate.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                            {candidate.resume_url && (
                                <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                                    <FileText className="w-4 h-4" /> Currículo
                                </a>
                            )}
                            {candidate.linkedin_url && (
                                <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-2 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-lg text-sm font-medium transition-colors">
                                    <Briefcase className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Exibindo o Fit Score Final se existir */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
                        <h3 className="font-semibold text-sm text-muted-foreground mb-4">Fit Score Geral</h3>
                        <div className="text-5xl font-black bg-gradient-to-tr from-primary to-primary/50 bg-clip-text text-transparent">
                            {candidate.fit_score ? candidate.fit_score.toFixed(1) : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Média das notas de comportamento ({interviews?.length || 0} avaliações)</p>
                    </div>
                </div>

                {/* Coluna Direita: Entrevistas (Histórico) e Nova Avaliação */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Histórico de Entrevistas
                    </h2>

                    {interviews && interviews.length > 0 ? (
                        interviews.map((interview) => (
                            <div key={interview.id} className="bg-card border border-border rounded-xl p-6 shadow-sm group">
                                <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                                                {interview.type}
                                            </span>
                                            {interview.recommendation === 'Avançar' && <span className="flex items-center text-xs text-green-600 font-medium"><CheckCircle2 className="w-3 h-3 mr-1" /> Recomenda</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Avaliador: <b className="text-foreground">{interview.users?.full_name || 'Desconhecido'}</b> em {format(new Date(interview.conducted_at), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{interview.final_score ? interview.final_score.toFixed(1) : '-'}</div>
                                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Nota Fit</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Anotações S.T.A.R</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                        <div className="bg-muted/50 p-3 rounded-lg"><span className="font-semibold text-xs text-indigo-500 block">S (Situation)</span>{interview.star_situation}</div>
                                        <div className="bg-muted/50 p-3 rounded-lg"><span className="font-semibold text-xs text-indigo-500 block">T (Task)</span>{interview.star_task}</div>
                                        <div className="bg-muted/50 p-3 rounded-lg"><span className="font-semibold text-xs text-indigo-500 block">A (Action)</span>{interview.star_action}</div>
                                        <div className="bg-muted/50 p-3 rounded-lg"><span className="font-semibold text-xs text-indigo-500 block">R (Result)</span>{interview.star_result}</div>
                                    </div>
                                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border-l-2 border-primary">
                                        <span className="font-semibold text-xs block text-muted-foreground mb-1">Parecer</span>
                                        <p className="text-sm">{interview.justification}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-card border border-dashed border-border p-8 rounded-xl text-center shadow-sm">
                            <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Nenhuma avaliação/entrevista registrada.</p>
                        </div>
                    )}

                    <StarEvaluationForm candidateId={candidate.id} />
                </div>
            </main>
        </div>
    )
}
