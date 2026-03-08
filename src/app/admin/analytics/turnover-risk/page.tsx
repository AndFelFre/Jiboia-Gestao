import { BrainCircuit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TurnoverRiskPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 animate-pulse">
                <BrainCircuit size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">IA Alertas (Risco de Turnover)</h1>
            <p className="text-slate-500 text-lg mb-12 text-center max-w-md font-medium">
                Nossa inteligência preditiva está sendo calibrada com base nos históricos de engajamento da organização.
            </p>
            <Button asChild variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl px-12 py-6 font-black uppercase tracking-widest transition-all">
                <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Voltar para Admin
                </Link>
            </Button>
        </div>
    )
}
