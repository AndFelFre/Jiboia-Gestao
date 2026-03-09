import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrganizationById } from '../../actions/organizations'
import { getUsers } from '../../actions/users'
import { getUnits } from '../../actions/units'
import { getPositions } from '../../actions/positions'
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
    Briefcase,
    MapPin,
    GitCommit,
    Award,
    Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminDeleteButton } from '@/components/admin/AdminDeleteButton'
import { deleteUnit } from '../../actions/units'
import { deletePosition } from '../../actions/positions'

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

interface Unit {
    id: string
    name: string
    parent_id?: string
}

interface Position {
    id: string
    title: string
    level_id?: string
    levels?: { name: string }
}

interface PageProps {
    params: { id: string }
    searchParams: { tab?: string }
}

export default async function OrganizationDetailPage({ params, searchParams }: PageProps) {
    const activeTab = searchParams.tab || 'overview'

    // Fetch paralelo para performance
    const [orgResult, usersResult, unitsResult, positionsResult] = await Promise.all([
        getOrganizationById(params.id),
        getUsers(params.id),
        getUnits(params.id),
        getPositions(params.id)
    ])

    if (!orgResult.success || !orgResult.data) {
        notFound()
    }

    const org = orgResult.data as Organization
    const users = (usersResult.success ? (usersResult.data || []) : []) as User[]
    const units = (unitsResult.success ? (unitsResult.data || []) : []) as Unit[]
    const positions = (positionsResult.success ? (positionsResult.data || []) : []) as Position[]

    return (
        <div className="min-h-screen bg-background text-slate-900">
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
                                    <h1 className="text-3xl font-black tracking-tight">{org.name}</h1>
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
                        {[
                            { id: 'overview', label: 'Visão Geral' },
                            { id: 'team', label: `Equipe (${users.length})` },
                            { id: 'units', label: `Unidades (${units.length})` },
                            { id: 'positions', label: `Cargos (${positions.length})` },
                        ].map((tab) => (
                            <Link
                                key={tab.id}
                                href={`?tab=${tab.id}`}
                                className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'overview' && (
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

                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                                    <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Informações de Cadastro
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
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
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                                    <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-900">
                                        <Briefcase className="w-5 h-5 text-primary" />
                                        Links e Portais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <Button asChild variant="outline" className="w-full justify-start rounded-xl font-bold border-dashed h-12">
                                        <Link href={`/careers/${org.slug}`} target="_blank">
                                            <Briefcase className="mr-3 w-4 h-4 text-primary" />
                                            Portal de Carreiras Público
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div>
                                <h2 className="text-2xl font-black">Membros da Equipe</h2>
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
                                            <td colSpan={4} className="px-8 py-10 text-center text-muted-foreground italic font-medium">Nenhum membro encontrado.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-sm text-slate-500 font-medium">{user.email}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 rounded-lg">
                                                        {user.roles?.name || 'User'}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5 text-right">
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

                {activeTab === 'units' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div>
                                <h2 className="text-2xl font-black">Unidades Operacionais</h2>
                                <p className="text-sm text-muted-foreground font-medium">Departamentos, filiais e centros de custo.</p>
                            </div>
                            <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Link href={`/admin/units/new?orgId=${org.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Unidade
                                </Link>
                            </Button>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Unidade</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Hierarquia</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {units.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-10 text-center text-muted-foreground italic font-medium">Crie unidades para organizar sua equipe.</td>
                                        </tr>
                                    ) : (
                                        units.map((unit) => {
                                            const parent = units.find(u => u.id === unit.parent_id);
                                            return (
                                                <tr key={unit.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                                            <div className="text-sm font-bold text-slate-900">{unit.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-50 border border-slate-100 w-fit">
                                                            <GitCommit className="w-3 h-3 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                                {parent?.name || 'Raiz'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400" title="Editar">
                                                                <Link href={`/admin/units/${unit.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <AdminDeleteButton
                                                                itemId={unit.id}
                                                                itemName={unit.name}
                                                                onDelete={deleteUnit}
                                                                className="h-9 w-9 rounded-xl"
                                                            />
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
                )}

                {activeTab === 'positions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div>
                                <h2 className="text-2xl font-black">Cargos e Funções</h2>
                                <p className="text-sm text-muted-foreground font-medium">Defina os papéis existentes nesta organização.</p>
                            </div>
                            <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Link href={`/admin/positions/new?orgId=${org.id}`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Cargo
                                </Link>
                            </Button>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Título</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Nível</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {positions.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-10 text-center text-muted-foreground italic font-medium">Nenhum cargo cadastrado.</td>
                                        </tr>
                                    ) : (
                                        positions.map((pos) => (
                                            <tr key={pos.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                                        <div className="text-sm font-bold text-slate-900">{pos.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {pos.levels ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 bg-purple-50/50 w-fit px-3 py-1 rounded-full border border-purple-100/50 uppercase tracking-widest">
                                                            <Award className="w-3 h-3" />
                                                            {pos.levels.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest px-3">S/ Nível</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-400" title="Editar">
                                                            <Link href={`/admin/positions/${pos.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <AdminDeleteButton
                                                            itemId={pos.id}
                                                            itemName={pos.title}
                                                            onDelete={deletePosition}
                                                            className="h-9 w-9 rounded-xl"
                                                        />
                                                    </div>
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

