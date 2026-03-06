'use client'

import { toggleOnboardingItem } from '@/app/admin/actions/onboarding'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface Item {
    progress_id: string
    status: 'pending' | 'completed'
    id: string
    title: string
    description: string
    sequence: number
}

export function OnboardingChecklist({ items }: { items: Item[] }) {
    const router = useRouter()
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

    async function handleToggle(progressId: string, currentStatus: string) {
        if (loadingMap[progressId]) return

        setLoadingMap(prev => ({ ...prev, [progressId]: true }))

        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
        const res = await toggleOnboardingItem(progressId, newStatus)

        if (res.success) {
            router.refresh()
        }

        setLoadingMap(prev => ({ ...prev, [progressId]: false }))
    }

    return (
        <>
            {items.map((item, idx) => {
                const isCompleted = item.status === 'completed'
                const isLoading = loadingMap[item.progress_id]

                return (
                    <div key={item.progress_id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Ícone de status "Timeline Node" */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 
                            transition-colors duration-300 relative"
                            style={{
                                borderColor: isCompleted ? 'var(--radius)' : '',
                                backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--card))'
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : isCompleted ? (
                                <Check className="w-5 h-5 text-primary-foreground" />
                            ) : (
                                <span className="text-xs font-bold text-muted-foreground">{item.sequence}</span>
                            )}
                        </div>

                        {/* Card do Item */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border/50 bg-background/50 backdrop-blur shadow-sm hover:shadow-md transition-all">
                            <h4 className={`text-lg font-bold mb-1 transition-colors ${isCompleted ? 'text-muted-foreground line-through decoration-primary/50' : 'text-foreground'}`}>
                                {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-sm text-muted-foreground mb-4 opacity-80">{item.description}</p>
                            )}

                            <button
                                onClick={() => handleToggle(item.progress_id, item.status)}
                                disabled={isLoading}
                                className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${isCompleted
                                        ? 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                                    }`}
                            >
                                {isLoading ? 'Processando...' : isCompleted ? 'Desfazer' : 'Marcar como Feito'}
                            </button>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
