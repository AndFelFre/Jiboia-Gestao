import Link from 'next/link'
import { getActiveSessions } from '../actions/sessions'
import { Card, CardContent } from '@/components/ui/card'
import {
    ShieldAlert,
    Monitor,
    Smartphone,
    Globe,
    ArrowLeft,
    Calendar,
    User,
    Activity
} from 'lucide-react'
import { ErrorState, EmptyState } from '@/components/ui/feedback'
import { RevokeSessionButton } from '@/components/admin/RevokeSessionButton'

export const dynamic = 'force-dynamic'

export default async function SessionsPage() {
    const result = await getActiveSessions()
    const sessions = result.success ? result.data : []

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center shadow-lg shadow-rose-200">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                                <ArrowLeft className="w-3 h-3" /> Painel Admin
                            </Link>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                            Gestão de Acessos
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Controle e encerramento de sessões ativas na organização.</p>
                    </div>
                </div>

                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 gap-4 px-6 items-center">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessões Ativas</p>
                        <p className="text-xl font-black text-slate-900 leading-tight">{sessions?.length || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <Activity className="w-6 h-6 text-slate-300" />
                </div>
            </header>

            {!result.success && (
                <ErrorState title="Falha ao Carregar Sessões" description={result.error} />
            )}

            {result.success && sessions?.length === 0 ? (
                <EmptyState
                    title="Nenhuma sessão detectada"
                    description="As sessões ativas dos colaboradores aparecerão aqui para monitoramento e gestão."
                />
            ) : result.success && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions?.map((session: any) => (
                        <Card key={session.session_id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-all group border border-slate-100">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${session.device_type === 'Mobile' ? 'bg-indigo-50 text-indigo-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {session.device_type === 'Mobile' ? <Smartphone className="w-7 h-7" /> : <Monitor className="w-7 h-7" />}
                                    </div>
                                    <BadgeStatus createdAt={session.created_at} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-900 text-base leading-tight truncate">{session.full_name}</h3>
                                            <p className="text-slate-400 text-xs font-medium truncate">{session.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 py-4 border-y border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Globe className="w-4 h-4 text-slate-300" />
                                            <span className="text-[11px] font-bold">IP: {session.ip_address || 'Endereço Oculto'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            <span className="text-[11px] font-medium">
                                                Atividade: {new Date(session.last_active_at).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <RevokeSessionButton sessionId={session.session_id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

function BadgeStatus({ createdAt }: { createdAt: string }) {
    const isNew = new Date().getTime() - new Date(createdAt).getTime() < 3600000 // 1 h
    return (
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isNew ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
            {isNew ? 'Recente' : 'Ativa'}
        </div>
    )
}
