'use client'

import React from 'react'
import {
    UserPlus,
    Rocket,
    Target,
    PlusCircle,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
    {
        title: 'Novo Colaborador',
        description: 'Convidar talento',
        href: '/admin/users/new',
        icon: UserPlus,
        color: 'bg-blue-500',
        hover: 'hover:bg-blue-600'
    },
    {
        title: 'Abrir Ciclo',
        description: 'Performance 9-Box',
        href: '/admin/performance/evaluations/new',
        icon: Rocket,
        color: 'bg-amber-500',
        hover: 'hover:bg-amber-600'
    },
    {
        title: 'Novo KPI',
        description: 'Meta estratégica',
        href: '/admin/kpis/new',
        icon: Target,
        color: 'bg-emerald-500',
        hover: 'hover:bg-emerald-600'
    }
]

export function AdminQuickActions() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {quickActions.map((action) => {
                const Icon = action.icon
                return (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`${action.color} text-white p-3 rounded-2xl shadow-lg transition-transform group-hover:scale-110`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 tracking-tight">{action.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{action.description}</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <PlusCircle className="w-4 h-4" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
