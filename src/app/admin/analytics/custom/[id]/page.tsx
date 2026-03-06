import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Widget } from '@/components/analytics/ReportBuilder'
import { ErrorState } from '@/components/ui/feedback'
import Link from 'next/link'
import { ArrowLeft, Edit2, TrendingUp, PieChart, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

async function getReport(id: string) {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('id', id)
        .single()

    return { data, error }
}

export default async function CustomReportViewPage({ params }: { params: { id: string } }) {
    const { data: report, error } = await getReport(params.id)

    if (error || !report) {
        if (error?.code === 'PGRST116') {
            redirect('/admin/analytics/custom') // Not found / Unauthorized due to RLS
        }
        return <ErrorState title="Erro ao carregar relatório" description={error?.message || 'Dashboard não encontrado'} />
    }

    const widgets: Widget[] = report.config?.widgets || []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/analytics/custom"
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {report.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Painel Customizado • Atualizado em {new Date(report.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/admin/analytics/custom/${report.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    Editar Layout
                </Link>
            </div>

            <div className="space-y-6 mt-8">
                {widgets.length === 0 ? (
                    <div className="p-8 text-center bg-card border border-border rounded-xl">
                        <p className="text-muted-foreground">Este painel não possui visualizações adicionadas.</p>
                    </div>
                ) : (
                    widgets.map((widget, idx) => (
                        <div key={`${widget.id}-${idx}`} className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[300px] flex flex-col">
                            <h3 className="font-semibold text-lg border-b border-border pb-4 mb-4 flex items-center gap-2">
                                {widget.type === 'turnover_chart' && <TrendingUp className="w-5 h-5 text-primary" />}
                                {widget.type === 'pipeline_funnel' && <PieChart className="w-5 h-5 text-primary" />}
                                {widget.type === 'employee_count' && <Users className="w-5 h-5 text-primary" />}
                                {widget.title}
                            </h3>

                            <div className="flex-1 flex items-center justify-center bg-muted/20 border border-dashed border-border rounded-lg">
                                {/* Placeholder das visualizações reais (Simulação) */}
                                <div className="text-center text-muted-foreground space-y-2">
                                    <p className="font-medium text-foreground">Visualização: {widget.title}</p>
                                    <p className="text-sm">Os dados reais de {widget.type.split('_').join(' ')} seriam plotados aqui.</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
