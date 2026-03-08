import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PDIPage() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 animate-bounce">
                <Construction size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Plano de Desenvolvimento Individual</h1>
            <p className="text-slate-500 text-lg mb-12 text-center max-w-md">
                Estamos construindo a melhor experiência de PDI para sua carreira. Em breve você poderá gerenciar suas metas e competências aqui.
            </p>
            <Button asChild variant="outline" className="rounded-2xl px-12 py-6 border-2 font-black uppercase tracking-widest">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Voltar para o Dashboard
                </Link>
            </Button>
        </div>
    )
}
