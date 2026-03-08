import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function GamificationPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 mb-8 border-4 border-yellow-500/20">
                <Trophy size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Gamificação & Reconhecimento</h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md">
                Premiar o engajamento está no nosso DNA. Estamos preparando o ranking de badges e conquistas.
            </p>
            <Button asChild className="rounded-3xl px-12 py-8 bg-yellow-600 hover:bg-yellow-700 text-white shadow-2xl shadow-yellow-200">
                <Link href="/admin" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                    <ArrowLeft size={20} />
                    Retornar ao Painel
                </Link>
            </Button>
        </div>
    )
}
