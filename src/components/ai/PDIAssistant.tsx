'use client'

import { PDISuggestion } from '@/app/admin/actions/analytics'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowRight, Lightbulb, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PDIAssistantProps {
    suggestions: PDISuggestion[]
}

export function PDIAssistant({ suggestions }: PDIAssistantProps) {
    if (suggestions.length === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="font-bold text-emerald-900">Perfil em Dia!</p>
                    <p className="text-sm text-emerald-700">Você não possui gaps de competência identificados para seu cargo atual.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Sugestões de Desenvolvimento (IA)</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {suggestions.map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:border-primary/30 transition-all shadow-sm group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${s.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{s.skillName}</h4>
                                    <Badge variant="outline" className="text-[9px] uppercase border-none bg-slate-100 text-slate-500">
                                        Gap: {s.gap} pts
                                    </Badge>
                                </div>
                            </div>
                            <Badge className={`rounded-full ${s.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                {s.priority === 'high' ? 'Alta Prioridade' : 'Desenvolvimento'}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {s.suggestion}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs cursor-pointer group-hover:gap-3 transition-all">
                            Começar plano de ação <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
