'use client'

import { useState, useEffect } from 'react'
import { getKudosFeed, Kudo } from '@/app/actions/kudos'
import { getRecentAwards } from '@/app/admin/actions/gamification'
import {
    Heart,
    Award,
    MessageSquare,
    Clock,
    Sparkles,
    TrendingUp,
    ShieldCheck
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatRelativeTime(date: Date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'agora mesmo'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `há ${diffInHours} h`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `há ${diffInDays} dias`
    return date.toLocaleDateString('pt-BR')
}

type FeedItem = {
    id: string
    type: 'kudo' | 'badge'
    title: string
    content: string
    senderName: string
    receiverName: string
    date: Date
    tags?: string[]
    iconName?: string
    badgeColor?: string
}

export function SocialFeed() {
    const [items, setItems] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFeed()
    }, [])

    async function loadFeed() {
        const [kRes, bRes] = await Promise.all([
            getKudosFeed({ limit: 10 }),
            getRecentAwards({ limit: 10 })
        ])

        const feedItems: FeedItem[] = []

        if (kRes.success && kRes.data) {
            (kRes.data as any[]).forEach((k) => {
                feedItems.push({
                    id: k.id,
                    type: 'kudo',
                    title: 'Enviou um Kudo!',
                    content: k.message,
                    senderName: k.sender?.full_name || 'Alguém',
                    receiverName: k.receiver?.full_name || 'Colega',
                    date: new Date(k.created_at),
                    tags: k.tags
                })
            })
        }

        if (bRes.success && bRes.data) {
            (bRes.data as any[]).forEach((b) => {
                feedItems.push({
                    id: b.id,
                    type: 'badge',
                    title: `Conquistou a medalha ${b.badges?.name}!`,
                    content: b.comment || b.badges?.description,
                    senderName: 'RG Digital',
                    receiverName: b.users?.full_name || 'Colega',
                    date: new Date(b.awarded_at),
                    badgeColor: b.badges?.color,
                    iconName: b.badges?.icon
                })
            })
        }

        // Ordenar por data
        setItems(feedItems.sort((a, b) => b.date.getTime() - a.date.getTime()))
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-3xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Mural da Comunidade
                </h3>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <Card key={item.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-card hover:shadow-md transition-shadow animate-in slide-in-from-bottom-4 duration-500">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                {/* Side Icon */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'kudo' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {item.type === 'kudo' ? <Heart className="w-6 h-6 fill-current" /> : <Award className="w-6 h-6" />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="font-bold text-foreground">{item.senderName}</span>
                                            <span className="text-muted-foreground mx-1.5 font-medium">→</span>
                                            <span className="font-bold text-foreground">{item.receiverName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                            <Clock className="w-3 h-3" />
                                            {formatRelativeTime(item.date)}
                                        </div>
                                    </div>

                                    <p className="text-foreground font-bold text-sm leading-tight mt-1">{item.title}</p>
                                    <p className="text-muted-foreground text-xs mt-2 italic leading-relaxed">&quot;O reconhecimento é o combustível do alto desempenho.&quot; – Não poupe elogios sinceros para fortalecer nossa cultura.</p>
                                    <p className="text-muted-foreground text-xs mt-2 italic leading-relaxed">"{item.content}"</p>

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {item.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground border-none text-[9px] font-bold px-2 py-0">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {item.type === 'badge' && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                Conquista Verificada
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {items.length === 0 && (
                    <div className="py-20 text-center space-y-3 bg-muted/30 rounded-[3rem] border border-dashed border-border">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground font-medium italic">O mural está silencioso... Que tal enviar o primeiro kudo?</p>
                    </div>
                )}
            </div>
        </div>
    )
}
