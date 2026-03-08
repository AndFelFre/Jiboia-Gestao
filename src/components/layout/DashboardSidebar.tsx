'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutGrid,
    Users,
    Zap,
    Target,
    BarChart3,
    History,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck
} from 'lucide-react'
import { useState } from 'react'

interface SidebarItem {
    title: string
    href: string
    icon: any
    role?: string
}

const sidebarItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Recrutamento', href: '/admin/recruitment', icon: Users },
    { title: 'Performance', href: '/admin/performance/evaluations', icon: Zap },
    { title: 'PDI', href: '/dashboard/pdi', icon: Target },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Auditoria', href: '/admin/audit', icon: History, role: 'admin' },
    { title: 'Admin', href: '/admin', icon: Settings, role: 'admin' },
]

export function DashboardSidebar({ user }: { user: any }) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-white border-r border-slate-100 z-50 transition-all duration-500 shadow-2xl shadow-slate-200/50 flex flex-col pt-6 print:hidden",
            collapsed ? "w-24" : "w-72"
        )}>
            {/* Logo Section */}
            <div className="px-6 mb-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                        J
                    </div>
                    {!collapsed && (
                        <span className="font-black text-xl tracking-tight text-slate-900">Jiboia</span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                {sidebarItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                            {!collapsed && (
                                <span className="font-black text-[11px] uppercase tracking-widest">{item.title}</span>
                            )}
                            {isActive && !collapsed && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User section */}
            <div className="p-4 mt-auto border-t border-slate-50">
                <div className={cn(
                    "bg-slate-50/50 rounded-3xl p-4 flex items-center gap-3",
                    collapsed ? "justify-center" : "justify-start"
                )}>
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary font-black shadow-sm shrink-0">
                        {user.full_name?.charAt(0) || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-slate-800 tracking-tighter truncate">{user.full_name}</p>
                            <p className="text-[8px] font-bold text-primary uppercase tracking-widest truncate">Admin Access</p>
                        </div>
                    )}
                </div>

                <form action="/api/auth/signout" method="post" className="mt-4">
                    <button className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group",
                        collapsed ? "justify-center" : "justify-start"
                    )}>
                        <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                        {!collapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sair do Sistema</span>}
                    </button>
                </form>
            </div>
        </aside>
    )
}
