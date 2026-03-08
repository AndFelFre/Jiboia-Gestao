'use client'

import { ExecutiveReportData } from '@/app/admin/actions/reports'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, TrendingUp, Users, Zap, Info } from 'lucide-react'

interface ExecutiveReportTemplateProps {
    data: ExecutiveReportData
}

export function ExecutiveReportTemplate({ data }: ExecutiveReportTemplateProps) {
    return (
        <div className="bg-white p-12 max-w-[1000px] mx-auto print:p-0 print:max-w-none font-sans text-slate-900">
            {/* Header de Capa */}
            <div className="border-b-4 border-slate-900 pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">Relatório Executivo de Calibração</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">{data.organizationName} • {data.period}</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gerado em: {new Date(data.generatedAt).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 justify-end mt-1 text-emerald-600 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        Compliance LGPD Ativa
                    </div>
                </div>
            </div>

            {/* Sumário Executivo */}
            <section className="mb-16">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 border-l-4 border-primary pl-4 uppercase tracking-tight">
                    1. Visão Geral de Performance (RUA/SMART)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.performance.map((unit, idx) => (
                        <Card key={idx} className="border-slate-100 shadow-none rounded-2xl bg-slate-50/50">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-sm uppercase italic">Unidade: {unit.unit_id.substring(0, 10)}...</h4>
                                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-slate-100">N={unit.sample_size}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">Resiliência</div>
                                        <div className="text-lg font-black">{unit.avg_resilience?.toFixed(1) || 'N/D'}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">Utilidade</div>
                                        <div className="text-lg font-black">{unit.avg_utility?.toFixed(1) || 'N/D'}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                                        <div className="text-[8px] font-black text-slate-400 uppercase">Ambição</div>
                                        <div className="text-lg font-black">{unit.avg_ambition?.toFixed(1) || 'N/D'}</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Taxa SMART</span>
                                    <span className="text-sm font-black text-emerald-600">{unit.smart_conversion_rate?.toFixed(1)}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Estabilidade e Riscos */}
            <section className="mb-16 break-before-page">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 border-l-4 border-rose-500 pl-4 uppercase tracking-tight">
                    2. Estabilidade de Talentos e Risco de Turnover
                </h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest transition-all">
                            <th className="py-4">Unidade</th>
                            <th className="py-4">Score de Risco</th>
                            <th className="py-4">Status de Alerta</th>
                            <th className="py-4 text-right">Amostra</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.retention.map((row, idx) => (
                            <tr key={idx} className="text-sm">
                                <td className="py-4 font-bold italic">{row.unitId.substring(0, 10)}...</td>
                                <td className="py-4 font-black">{row.avgRiskScore !== null ? row.avgRiskScore.toFixed(1) : 'Oculto'}</td>
                                <td className="py-4">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${row.riskLevel === 'high' ? 'bg-rose-100 text-rose-600' :
                                            row.riskLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {row.riskLevel}
                                    </span>
                                </td>
                                <td className="py-4 text-right font-mono text-xs">{row.sampleSize}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Disclaimer Legal / Conformidade */}
            <footer className="mt-auto pt-12 border-t border-slate-100 text-[9px] text-slate-400 space-y-2">
                <div className="flex items-start gap-2">
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                    <p>
                        **NOTA DE PRIVACIDADE (LGPD/GDPR):** Este relatório utiliza técnicas de anonimização segregada.
                        Dados baseados em amostras inferiores a 3 (N < 3) são automaticamente ocultados para proteger a identidade individual.
                        Este documento é confidencial e destinado exclusivamente a ritos de calibração de liderança.
                    </p>
                </div>
                <p className="font-bold uppercase tracking-tighter">© 2026 Projeto Jiboia • Inteligência Operacional de DHO</p>
            </footer>

            <style jsx global>{`
                @media print {
                    @page { margin: 2cm; }
                    body { -webkit-print-color-adjust: exact; }
                    .break-before-page { break-before: page; }
                }
            `}</style>
        </div>
    )
}
