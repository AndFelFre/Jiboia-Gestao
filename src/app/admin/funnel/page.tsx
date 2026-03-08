import { ListTodo, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FunnelPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-600 mb-8">
                <ListTodo size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight text-center">Funil Diário de Produtividade</h1>
            <p className="text-slate-500 text-lg mb-12 text-center max-w-lg">
                O módulo de gestão de produtividade operacional está em fase final de homologação.
            </p>
            <Button asChild variant="default" className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-12 py-6 font-black uppercase tracking-widest shadow-xl">
                <Link href="/admin" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Voltar para Admin
                </Link>
            </Button>
        </div>
    )
}
