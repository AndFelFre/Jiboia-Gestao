'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShieldAlert, Users, Info, ArrowRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RetentionRiskData {
    unitId: string
    avgRiskScore: number | null
    sampleSize: number
    riskLevel: 'high' | 'medium' | 'low' | 'hidden'
}

interface RetentionRiskMatrixProps {
    data: RetentionRiskData[]
}

export function RetentionRiskMatrix({ data }: RetentionRiskMatrixProps) {
    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-rose-500 text-white'
            case 'medium': return 'bg-amber-500 text-white'
            case 'low': return 'bg-emerald-500 text-white'
            default: return 'bg-slate-100 text-slate-400 dark:bg-slate-800'
        }
    }

    const getRiskLabel = (level: string) => {
        switch (level) {
            case 'high': return 'Crítico'
            case 'medium': return 'Moderado'
            case 'low': return 'Estável'
            default: return 'Privativo'
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                        Mapa de Risco de Retenção
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((unit, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-primary/20 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                        Unidade: {unit.unitId.substring(0, 8)}...
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        <Users className="w-3 h-3" />
                                        {unit.sampleSize} Colaboradores
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getRiskColor(unit.riskLevel)}`}>
                                    {getRiskLabel(unit.riskLevel)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Índice de Estabilidade</span>
                                    <span className="font-black">
                                        {unit.avgRiskScore !== null ? `${(100 - unit.avgRiskScore).toFixed(0)}%` : 'N/D'}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${unit.riskLevel === 'high' ? 'bg-rose-500' : unit.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: unit.avgRiskScore !== null ? `${100 - unit.avgRiskScore}%` : '0%' }}
                                    />
                                </div>
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 cursor-help">
                                            <span className="font-bold italic">Saiba mais</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-900 text-white border-none p-3 max-w-[200px]">
                                        <p className="text-xs leading-relaxed">
                                            {unit.riskLevel === 'hidden'
                                                ? 'Dados protegidos pela regra N<3 (Privacidade por Design).'
                                                : `Risco calculado com base em atrasos de ritos e onboarding para o grupo.`
                                            }
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Baixo Risco
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderado
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Alta Atenção
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
