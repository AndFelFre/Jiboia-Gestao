'use client'

import { SkillHeatmapData } from '@/app/admin/actions/analytics'
import { Button } from '@/components/ui/button'
import { FileText, Table as TableIcon } from 'lucide-react'
import { exportToPDF, exportToXLSX } from '@/lib/utils/export'

interface HeatmapActionsProps {
    data: SkillHeatmapData
}

export function HeatmapActions({ data }: HeatmapActionsProps) {
    const { skills, users, matrix } = data

    const handleExportPDF = () => {
        const columns = [
            { header: 'Colaborador', dataKey: 'userName' },
            { header: 'Cargo', dataKey: 'position' },
            ...skills.map(s => ({ header: s.name, dataKey: s.id }))
        ]

        const exportData = users.map(user => {
            const row: any = {
                userName: user.name,
                position: user.position
            }
            skills.forEach(skill => {
                const cell = matrix.find(m => m.userId === user.id && m.skillId === skill.id)
                row[skill.id] = cell?.score || 0
            })
            return row
        })

        exportToPDF('heatmap-competencias', 'Matriz de Competências e Gaps', columns, exportData)
    }

    const handleExportExcel = () => {
        const exportData = users.map(user => {
            const row: any = {
                'Colaborador': user.name,
                'Cargo': user.position
            }
            skills.forEach(skill => {
                const cell = matrix.find(m => m.userId === user.id && m.skillId === skill.id)
                row[skill.name] = cell?.score || 0
            })
            return row
        })

        exportToXLSX('heatmap-competencias', exportData)
    }

    return (
        <div className="flex gap-3">
            <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2 h-10 px-4"
                onClick={handleExportPDF}
            >
                <FileText className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-xs uppercase tracking-tight">Exportar PDF</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2 h-10 px-4"
                onClick={handleExportExcel}
            >
                <TableIcon className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-xs uppercase tracking-tight">Exportar Excel</span>
            </Button>
        </div>
    )
}
