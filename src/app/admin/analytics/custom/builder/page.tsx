'use client'

import { ReportBuilder } from '@/components/analytics/ReportBuilder'
import { createCustomReport } from '@/app/admin/actions/custom_reports'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CustomReportBuilderPage() {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleSave = async (payload: { name: string, config: any }) => {
        setIsSaving(true)
        setErrorMsg('')

        const result = await createCustomReport(payload)

        if (result.success) {
            router.push('/admin/analytics/custom')
        } else {
            setErrorMsg(result.error || 'Erro desconhecido ao salvar o relatório.')
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card shadow-sm border-b border-border">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/analytics/custom"
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-muted"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground leading-none">Novo Relatório Customizado</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Construtor de Blocos (Drag & Drop)
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {errorMsg && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-medium flex items-center gap-2">
                        <span>⚠</span> {errorMsg}
                    </div>
                )}
                <ReportBuilder onSave={handleSave} isSaving={isSaving} />
            </main>
        </div>
    )
}
