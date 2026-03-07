'use client'

import React from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts'

interface RUARadarChartProps {
    resilience: number
    utility: number
    ambition: number
}

export function RUARadarChart({ resilience, utility, ambition }: RUARadarChartProps) {
    const data = [
        { subject: 'Resiliência', A: resilience, fullMark: 5 },
        { subject: 'Utilidade', A: utility, fullMark: 5 },
        { subject: 'Ambição', A: ambition, fullMark: 5 },
    ]

    return (
        <div className="w-full h-[300px] flex items-center justify-center bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 5]}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                        tickCount={6}
                    />
                    <Radar
                        name="RUA"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.6}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
