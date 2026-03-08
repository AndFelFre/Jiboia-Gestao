import { getExecutiveSummaryReport } from '@/app/admin/actions/reports'
import { ExecutiveReportTemplate } from '@/components/admin/reports/ExecutiveReportTemplate'
import { PrintButton } from '@/components/admin/reports/PrintButton'
import { FileText, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ExecutiveReportPage() {
    const res = await getExecutiveSummaryReport()

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold m-8">
                Erro ao carregar relatório: {res.error}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-7xl mx-auto space-y-8 print:space-y-0">
                {/* Header de Visualização (Oculto na Impressão) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                    <div className="space-y-2">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Painel Admin
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-lg">
                                <FileText className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatório Trimestral</h1>
                                <p className="text-slate-500 font-medium">Prévia do documento de calibração executiva</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <PrintButton />
                    </div>
                </div>

                {/* Área do Documento */}
                <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none transition-all">
                    <ExecutiveReportTemplate data={res.data} />
                </div>
            </div>
        </div>
    )
}
