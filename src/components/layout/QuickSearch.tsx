'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Command as CommandIcon,
    ArrowRight,
    Sparkles,
    Zap
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ADMIN_MODULES, SEARCHABLE_ACTIONS, NavModule } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function QuickSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const router = useRouter()

    // Bloquear scroll do body quando aberto
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [open])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Cmd+K ou Ctrl+K
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                // Proteção: não disparar se estiver em um input/textarea
                const activeElement = document.activeElement as HTMLElement
                const isInput = activeElement?.tagName === 'INPUT' ||
                    activeElement?.tagName === 'TEXTAREA' ||
                    activeElement?.isContentEditable

                if (!isInput) {
                    e.preventDefault()
                    setOpen((open) => !open)
                }
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const results = React.useMemo(() => {
        const search = query.toLowerCase()

        const combined = [
            ...ADMIN_MODULES.map(m => ({ ...m, type: 'Módulo' as const })),
            ...SEARCHABLE_ACTIONS.map(a => ({ ...a, icon: Zap, color: 'emerald' as const, type: 'Ação' as const }))
        ]

        if (!query) return combined.slice(0, 8)

        return combined.filter(item =>
            item.title.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search) ||
            item.tags.some(tag => tag.includes(search))
        )
    }, [query])

    React.useEffect(() => {
        setSelectedIndex(0)
    }, [results])

    const onSelect = (item: any) => {
        setOpen(false)
        setQuery('')
        router.push(item.href)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault()
            onSelect(results[selectedIndex])
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl sm:rounded-[2rem] w-full h-full sm:h-auto max-h-screen sm:max-h-[85vh] flex flex-col transition-all">
                <div className="relative border-b border-slate-100 shrink-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        autoFocus
                        placeholder="Buscar módulos ou ações... (Novo KPI, Turnover, etc)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-16 pl-14 pr-16 bg-transparent border-none focus-visible:ring-0 text-lg font-medium text-slate-900 placeholder:text-slate-400"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <CommandIcon className="w-3 h-3" /> K
                    </div>
                    {/* Botão de Fechar no Mobile */}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 sm:hidden text-slate-400 font-bold text-xs uppercase"
                    >
                        Fechar
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {results.length > 0 ? (
                        results.map((item, index) => {
                            const Icon = item.icon
                            const isSelected = index === selectedIndex

                            return (
                                <button
                                    key={item.href + item.title}
                                    onClick={() => onSelect(item)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left group",
                                        isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
                                        isSelected ? "bg-white/20 border-white/20" : "bg-white border-slate-100 shadow-sm"
                                    )}>
                                        <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-primary")} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={cn("text-sm font-black tracking-tight", isSelected ? "text-white" : "text-slate-900")}>
                                                {item.title}
                                            </p>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest",
                                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className={cn("text-xs font-medium opacity-70 truncate max-w-[280px] sm:max-w-none", isSelected ? "text-white/80" : "text-slate-400")}>
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        isSelected ? "bg-white/20 opacity-100" : "bg-slate-100 opacity-0 group-hover:opacity-100"
                                    )}>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            )
                        })
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                <Search className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-900 font-black">Nenhum resultado encontrado</p>
                            <p className="text-slate-400 text-sm font-medium">Tente buscar por termos diferentes.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Navegar:
                            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">↑↓</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Selecionar:
                            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">Enter</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest italic group ml-auto sm:ml-0">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Navegação Inteligente
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
