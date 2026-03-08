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
    ChevronRight
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
            "fixed left-0 top-0 h-screen bg-slate-900 border-r border-white/5 z-50 transition-all duration-500 shadow-2xl flex flex-col pt-6 print:hidden",
            collapsed ? "w-24" : "w-72"
        )}>
            {/* Logo Section */}
            <div className="px-6 mb-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                        J
                    </div>
                    {!collapsed && (
                        <span className="font-black text-xl tracking-tight text-white">Jiboia</span>
                    )}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                {sidebarItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                            {!collapsed && (
                                <span className="text-[11px] uppercase font-black tracking-widest">{item.title}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User section */}
            <div className="p-4 mt-auto border-t border-white/5">
                <div className={cn(
                    "bg-white/5 rounded-2xl p-4 flex items-center gap-3",
                    collapsed ? "justify-center" : "justify-start"
                )}>
                    <div className="w-10 h-10 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center text-primary font-black shadow-sm shrink-0">
                        {user.full_name?.charAt(0) || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-white tracking-tighter truncate">{user.full_name}</p>
                            <p className="text-[8px] font-bold text-primary uppercase tracking-widest truncate">Acesso Corporativo</p>
                        </div>
                    )}
                </div>

                <form action="/api/auth/signout" method="post" className="mt-4">
                    <button className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all group",
                        collapsed ? "justify-center" : "justify-start"
                    )}>
                        <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                        {!collapsed && <span className="font-black text-[10px] uppercase tracking-widest">Sair</span>}
                    </button>
                </form>
            </div>
        </aside>
    )
}
