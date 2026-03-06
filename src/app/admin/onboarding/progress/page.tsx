import Link from 'next/link'
import { getOnboardingTemplates } from '@/app/admin/actions/onboarding'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ArrowLeft, User, CalendarDays, CheckCircle2, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function OnboardingProgressPage() {
    // 1. Instância do Banco
    const supabase = createServerSupabaseClient()

    // 2. Busca Usuários com Progressos Pendentes
    const { data: progressData, error } = await supabase
        .from('user_onboarding_progress')
        .select(`
            *,
            users:user_id(full_name, email, role:roles(name)),
            templates:template_id(name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erro ao buscar o progresso:', error)
    }

    // 3. Agrupar logicamente por UserId para mostrar o status resumido da pessoa
    const groupedUsers = (progressData || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.user_id]) {
            const roleObj = Array.isArray(curr.users?.role) ? curr.users.role[0] : curr.users?.role
            acc[curr.user_id] = {
                id: curr.user_id,
                name: curr.users?.full_name || 'Desconhecido',
                email: curr.users?.email || '',
                role: roleObj?.name || 'N/A',
                templateName: curr.templates?.name || 'Template Geral',
                totalItems: 0,
                completedItems: 0,
                lastUpdate: curr.updated_at
            }
        }

        acc[curr.user_id].totalItems += 1
        if (curr.status === 'completed') {
            acc[curr.user_id].completedItems += 1
        }
        // Atualiza last update pro mais recente
        if (new Date(curr.updated_at) > new Date(acc[curr.user_id].lastUpdate)) {
            acc[curr.user_id].lastUpdate = curr.updated_at
        }

        return acc
    }, {})

    const userList = Object.values(groupedUsers)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
                <div className="flex gap-4 items-center">
                    <Link href="/admin/onboarding" className="p-2 border border-slate-200 rounded-full hover:bg-slate-50 transition">
                        <ArrowLeft className="w-4 h-4 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <CalendarDays className="w-6 h-6 text-primary" />
                            Acompanhamento do Onboarding
                        </h1>
                        <p className="text-slate-500 mt-0.5 text-sm">Painel de progresso (D0-D60) dos novos talentos engajados.</p>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Cargo/Role</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Jornada Ativa</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Progresso</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Status / Atualização</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                    Nenhum usuário em ciclo de Onboarding no momento.
                                </td>
                            </tr>
                        ) : (
                            userList.map((usr: any) => {
                                const progressPct = usr.totalItems > 0 ? Math.round((usr.completedItems / usr.totalItems) * 100) : 0

                                return (
                                    <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center uppercase">
                                                    {usr.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{usr.name}</div>
                                                    <div className="text-xs text-slate-400">{usr.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 uppercase">
                                            <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{usr.role}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                            {usr.templateName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
                                                    <div
                                                        className={`h-2 rounded-full ${progressPct === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                        style={{ width: `${progressPct}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{progressPct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {progressPct === 100 ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Concluído
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Em Andamento
                                                </div>
                                            )}
                                            <div className="text-[10px] text-slate-400 mt-1 font-medium">
                                                U.A: {format(new Date(usr.lastUpdate), 'dd/MM/yy HH:mm')}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
