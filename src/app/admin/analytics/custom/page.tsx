import { getCustomReports } from '@/app/admin/actions/custom_reports'
export const dynamic = 'force-dynamic'
import { Plus, BarChart3, Clock, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function CustomReportsPage() {
    const { data: reports, error } = await getCustomReports()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Relatórios Customizados
                    </h1>
                    <p className="text-muted-foreground mt-1">Crie e gerencie painéis com métricas e visualizações exclusivas.</p>
                </div>
                <Link
                    href="/admin/analytics/custom/builder"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Novo Painel
                </Link>
            </div>

            {error ? (
                <ErrorState title="Não foi possível carregar os relatórios" description={error} />
            ) : reports && reports.length === 0 ? (
                <EmptyState
                    icon={<BarChart3 className="w-12 h-12 text-muted-foreground/30" />}
                    title="Nenhum painel criado"
                    description="Você ainda não criou nenhum relatório customizado (Drag & Drop)."
                    action={
                        <Link
                            href="/admin/analytics/custom/builder"
                            className="text-primary underline hover:text-primary/80 font-medium"
                        >
                            Criar o primeiro
                        </Link>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports?.map((report) => (
                        <div key={report.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                                {report.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Atualizado em {format(new Date(report.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                                </div>
                            </div>
                            <Link href={`/admin/analytics/custom/${report.id}`} className="absolute inset-0">
                                <span className="sr-only">Visualizar {report.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
