import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrganizationById } from '../../actions/organizations'
import { getUsers } from '../../actions/users'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import {
    Building2,
    Users,
    Settings,
    Plus,
    Mail,
    Shield,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface Organization {
    id: string
    name: string
    slug: string
    custom_domain?: string | null
    mfa_enforced?: boolean
    created_at: string
    updated_at: string
}

interface User {
    id: string
    full_name: string
    email: string
    roles?: { name: string }
}

interface PageProps {
    params: { id: string }
    searchParams: { tab?: string }
}

export default async function OrganizationDetailPage({ params, searchParams }: PageProps) {
    const activeTab = searchParams.tab || 'overview'

    // Fetch paralelo para performance
    const [orgResult, usersResult] = await Promise.all([
        getOrganizationById(params.id),
        getUsers(params.id)
    ])

    if (!orgResult.success || !orgResult.data) {
        notFound()
    }

    const org = orgResult.data as Organization
    const users = (usersResult.success ? (usersResult.data || []) : []) as User[]

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Hero Section */}
            <header className="bg-card border-b shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-foreground tracking-tight">{org.name}</h1>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-lg py-0.5">
                                        Ativa
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded border">ID: {org.id.split('-')[0]}...</span>
                                    •
                                    <span>Identificador: {org.slug}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" className="rounded-xl font-bold">
                                <Link href="/admin/organizations">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Voltar
                                </Link>
                            </Button>
                            <Button asChild color="primary" className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Link href={`/admin/organizations/${org.id}/edit`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configurações
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex gap-8 mt-10">
                        <Link
                            href={`?tab=overview`}
                            className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Visão Geral
                        </Link>
                        <Link
                            href={`?tab=team`}
                            className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${activeTab === 'team'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Equipe ({users.length})
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Stats Cards */}
                        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 border-blue-200/50 rounded-lg">
                                        Colaboradores
                                    </Badge>
                                </div>
                                <div className="text-3xl font-black text-slate-900">{users.length}</div>
                                <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">Total de membros ativos</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100/50">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-purple-100/50 text-purple-700 border-purple-200/50 rounded-lg">
                                        Comunicação
                                    </Badge>
                                </div>
                                <div className="text-lg font-bold text-slate-900 truncate">{org.custom_domain || 'Padrão Jiboia'}</div>
                                <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">Domínio de Acesso</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 rounded-lg">
                                        Segurança
                                    </Badge>
                                </div>
                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    {org.mfa_enforced ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            MFA Obrigatório
                                        </>
                                    ) : (
                                        'MFA Opcional'
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">Login e Autenticação</p>
                            </CardContent>
                        </Card>

                        {/* Recent Activity or Config Summary */}
                        <div className="md:col-span-3">
                            <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                                    <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Informações de Cadastro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Histórico</h4>
                                            <div className="space-y-4 font-bold text-sm text-slate-700">
                                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="text-slate-500">Registrada em:</span>
                                                    <span>{new Date(org.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="text-slate-500">Última alteração:</span>
                                                    <span>{new Date(org.updated_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Links Corporativos</h4>
                                            <div className="space-y-3">
                                                <Button asChild variant="outline" className="w-full justify-start rounded-xl font-bold border-dashed h-12">
                                                    <Link href={`/careers/${org.slug}`} target="_blank">
                                                        <Briefcase className="mr-3 w-4 h-4 text-primary" />
                                                        Portal de Carreiras Público
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Membros da Equipe</h2>
                                <p className="text-sm text-muted-foreground font-medium">Gerencie o acesso dos funcionários desta organização.</p>
                            </div>
                            <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Link href={`/admin/users/new?orgId=${org.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Colaborador
                                </Link>
                            </Button>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Nome</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">E-mail</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Papel</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-muted-foreground italic font-medium">Nenhum membro encontrado nesta equipe.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500 font-medium">{user.email}</div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 rounded-lg">
                                                        {(user as any).roles?.name || 'User'}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                                                    <Button asChild variant="ghost" size="sm" className="rounded-lg font-bold text-primary hover:bg-primary/5">
                                                        <Link href={`/admin/users/${user.id}`}>Gerenciar</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
