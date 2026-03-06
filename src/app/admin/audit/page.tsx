import Link from 'next/link'
import { getAuditLogs } from '../actions/audit'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/ui/feedback'
import { Card, CardContent } from '@/components/ui/card'
import {
    ShieldCheck,
    ArrowLeft,
    History,
    User,
    Calendar,
    Table as TableIcon,
    ChevronRight,
    SearchX
} from 'lucide-react'
import { AuditFilters } from '@/components/admin/AuditFilters'
import { AuditDiffViewer } from '@/components/admin/AuditDiffViewer'

interface AuditPageProps {
    searchParams: {
        table?: string
        action?: string
        changedBy?: string
        page?: string
    }
}

export const dynamic = 'force-dynamic'

export default async function AuditPage({ searchParams }: AuditPageProps) {
    const filters = {
        table: searchParams.table,
        action: searchParams.action,
        changedBy: searchParams.changedBy,
        page: searchParams.page ? parseInt(searchParams.page) : 1
    }

    const result = await getAuditLogs(filters)
    const logs = result.success ? result.data : []
    const pagination = result.success ? (result as any).pagination : null

    const getActionStyles = (action: string) => {
        switch (action) {
            case 'INSERT': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
            case 'UPDATE': return 'text-blue-600 bg-blue-50 border-blue-100'
            case 'DELETE': return 'text-rose-600 bg-rose-50 border-rose-100'
            default: return 'text-slate-600 bg-slate-50 border-slate-100'
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                <ArrowLeft className="w-3 h-3" /> Painel Admin
                            </Link>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                            Central de Auditoria
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Monitoramento de conformidade e integridade de dados.</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 gap-4 px-6 items-center">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Logs</p>
                        <p className="text-xl font-black text-slate-900 leading-tight">{pagination?.total || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <History className="w-6 h-6 text-slate-300" />
                </div>
            </header>

            {/* Global Filters */}
            <AuditFilters />

            {/* Logs Timeline */}
            <div className="space-y-6">
                {!result.success && (
                    <ErrorState title="Falha na Inteligência de Auditoria" description={result.error} />
                )}

                {result.success && logs?.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <SearchX className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Sem evidências encontradas</h3>
                        <p className="text-slate-500 max-w-sm">Ajuste seus filtros para localizar registros específicos na linha do tempo.</p>
                    </div>
                ) : result.success && (
                    <div className="grid grid-cols-1 gap-6">
                        {logs?.map((log: any) => (
                            <Card key={log.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-all group border border-slate-100">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row lg:items-center p-6 gap-6">
                                        {/* Action Badge */}
                                        <div className={`w-28 h-28 shrink-0 rounded-3xl border flex flex-col items-center justify-center font-black transition-transform group-hover:scale-105 ${getActionStyles(log.action)}`}>
                                            <span className="text-[10px] uppercase tracking-widest mb-1 opacity-60">Evento</span>
                                            <span className="text-sm">{log.action === 'INSERT' ? 'NOVO' : log.action === 'UPDATE' ? 'EDIT' : 'DEL'}</span>
                                        </div>

                                        {/* Core Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                                                    <TableIcon className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-tight">{log.table_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <ChevronRight className="w-4 h-4" />
                                                    <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">ID: {log.record_id}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <User className="w-5 h-5 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsável</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate">
                                                            {log.changed_by_user?.full_name || log.changed_by_user?.email || 'Sistema Automático'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data & Hora</p>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {new Date(log.created_at).toLocaleString('pt-BR', {
                                                                day: '2-digit', month: 'long', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diff Viewer Area */}
                                    {(log.old_values || log.new_values) && (
                                        <div className="bg-[#FAFBFD] p-6 border-t border-slate-100">
                                            <AuditDiffViewer oldValues={log.old_values} newValues={log.new_values} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Simple Pagination Placeholder */}
                {pagination?.totalPages > 1 && (
                    <div className="flex justify-center pt-8">
                        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 text-xs font-bold text-slate-500">
                            Página {pagination.page} de {pagination.totalPages}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-lg h-8 px-3" disabled={pagination.page <= 1}>Anterior</Button>
                                <Button variant="outline" size="sm" className="rounded-lg h-8 px-3" disabled={pagination.page >= pagination.totalPages}>Próxima</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
