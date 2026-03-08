'use client'

import { ArrowRight, CornerDownRight, Archive, RotateCcw } from 'lucide-react'

interface AuditDiffViewerProps {
    oldValues: any
    newValues: any
}

export function AuditDiffViewer({ oldValues, newValues }: AuditDiffViewerProps) {
    // Identifica quais campos mudaram
    const getChanges = () => {
        const changes: { field: string; oldVal: any; newVal: any; type?: 'archive' | 'restore' }[] = []

        const allKeys = new Set([
            ...Object.keys(oldValues || {}),
            ...Object.keys(newValues || {})
        ])

        // Ignorar campos de timestamp comuns que poluem o log
        const ignoreFields = ['updated_at', 'created_at', 'id', 'org_id']

        allKeys.forEach(key => {
            if (ignoreFields.includes(key)) return

            const oldVal = oldValues?.[key]
            const newVal = newValues?.[key]

            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                let type: 'archive' | 'restore' | undefined

                if (key === 'deleted_at') {
                    if (!oldVal && newVal) type = 'archive'
                    if (oldVal && !newVal) type = 'restore'
                }

                changes.push({ field: key, oldVal, newVal, type })
            }
        })

        return changes
    }

    const changes = getChanges()

    if (changes.length === 0) {
        return (
            <div className="py-2 px-4 bg-slate-50 rounded-xl text-[10px] text-slate-400 font-bold uppercase italic">
                Nenhuma alteração nos campos monitorados.
            </div>
        )
    }

    return (
        <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-4 py-2 font-black text-slate-400 uppercase text-[9px] tracking-widest border-b border-slate-100">Campo</th>
                        <th className="px-4 py-2 font-black text-slate-400 uppercase text-[9px] tracking-widest border-b border-slate-100">Antes</th>
                        <th className="px-4 py-2 font-black text-slate-400 uppercase text-[9px] tracking-widest border-b border-slate-100">Depois</th>
                    </tr>
                </thead>
                <tbody>
                    {changes.map((change, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-700 border-b border-slate-50 flex items-center gap-2">
                                <CornerDownRight className="w-3 h-3 text-slate-300" />
                                {change.field}
                            </td>
                            <td className="px-4 py-3 text-slate-400 line-through decoration-red-200/50 border-b border-slate-50 max-w-[150px] truncate">
                                {formatValue(change.oldVal)}
                            </td>
                            <td className={`px-4 py-3 font-bold border-b border-slate-50 max-w-[150px] truncate drop-shadow-sm ${change.type === 'archive' ? 'text-red-500' :
                                    change.type === 'restore' ? 'text-blue-500' :
                                        'text-emerald-600'
                                }`}>
                                {change.type === 'archive' && (
                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter mr-2">
                                        <Archive className="w-2.5 h-2.5" /> ARQUIVADO
                                    </span>
                                )}
                                {change.type === 'restore' && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter mr-2">
                                        <RotateCcw className="w-2.5 h-2.5" /> RESTAURADO
                                    </span>
                                )}
                                {formatValue(change.newVal)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function formatValue(val: any) {
    if (val === null || val === undefined) return <span className="text-[10px] italic opacity-50">vazio</span>
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não'
    if (typeof val === 'object') return 'JSON'
    // Se parecer uma data e for o campo deleted_at, formatamos apenas indicando presença
    if (typeof val === 'string' && val.includes('T') && val.includes('Z')) return 'Timestamp'
    return String(val)
}
