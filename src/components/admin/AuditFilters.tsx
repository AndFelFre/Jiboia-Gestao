'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Search,
    Filter,
    X,
    RefreshCw,
    Database,
    Fingerprint,
    MousePointer2
} from 'lucide-react'

export function AuditFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [filters, setFilters] = useState({
        table: searchParams.get('table') || '',
        action: searchParams.get('action') || '',
        changedBy: searchParams.get('changedBy') || ''
    })

    const handleApply = () => {
        const params = new URLSearchParams()
        if (filters.table) params.set('table', filters.table)
        if (filters.action) params.set('action', filters.action)
        if (filters.changedBy) params.set('changedBy', filters.changedBy)

        startTransition(() => {
            router.push(`/admin/audit?${params.toString()}`)
        })
    }

    const handleClear = () => {
        setFilters({ table: '', action: '', changedBy: '' })
        startTransition(() => {
            router.push('/admin/audit')
        })
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Filtros de Compliance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                        <Database className="w-3 h-3 text-primary" /> Tabela do Sistema
                    </label>
                    <select
                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                        value={filters.table}
                        onChange={(e) => setFilters({ ...filters, table: e.target.value })}
                    >
                        <option value="">Todas as Tabelas</option>
                        <option value="users">Usuários</option>
                        <option value="positions">Cargos</option>
                        <option value="evaluations">Avaliações</option>
                        <option value="pdi_plans">Planos PDI</option>
                        <option value="kudos">Kudos</option>
                        <option value="organizations">Organização</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                        <MousePointer2 className="w-3 h-3 text-primary" /> Ação Realizada
                    </label>
                    <select
                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    >
                        <option value="">Todas as Ações</option>
                        <option value="INSERT">Inserção (Novo)</option>
                        <option value="UPDATE">Alteração (Edição)</option>
                        <option value="DELETE">Exclusão (Remoção)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3 text-primary" /> ID do Responsável
                    </label>
                    <div className="relative">
                        <Input
                            placeholder="Buscar por UUID..."
                            className="h-12 bg-slate-50 border-none rounded-xl pl-10 text-sm font-medium"
                            value={filters.changedBy}
                            onChange={(e) => setFilters({ ...filters, changedBy: e.target.value })}
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    variant="ghost"
                    className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase"
                    onClick={handleClear}
                >
                    <X className="w-4 h-4 mr-2" /> Limpar
                </Button>
                <Button
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-8"
                    onClick={handleApply}
                    disabled={isPending}
                >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Aplicar Inteligência
                </Button>
            </div>
        </div>
    )
}
