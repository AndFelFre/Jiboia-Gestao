'use client'

import { useState, useEffect } from 'react'
import { getUsers } from '@/app/admin/actions/users'
import { sendKudo } from '@/app/actions/kudos'
import {
    Heart,
    Send,
    Users,
    CheckCircle2,
    Sparkles,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const KUDO_TAGS = [
    { id: 'colaboracao', label: '🤝 Colaboração', color: 'blue' },
    { id: 'lideranca', label: '👑 Liderança', color: 'amber' },
    { id: 'agilidade', label: '⚡ Agilidade', color: 'emerald' },
    { id: 'inovacao', label: '💡 Inovação', color: 'purple' },
    { id: 'excelencia', label: '🎯 Excelência', color: 'rose' }
]

export function KudosBox() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedUser, setSelectedUser] = useState('')
    const [message, setMessage] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        const res = await getUsers()
        if (res.success) {
            setUsers(res.data || [])
        }
        setLoading(false)
    }

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
        )
    }

    async function handleSubmit() {
        if (!selectedUser || !message) return
        setIsSubmitting(true)
        const res = await sendKudo({
            receiverId: selectedUser,
            message,
            tags: selectedTags
        })
        if (res.success) {
            setSuccess(true)
            setMessage('')
            setSelectedUser('')
            setSelectedTags([])
            setTimeout(() => setSuccess(false), 3000)
        } else {
            alert(res.error)
        }
        setIsSubmitting(false)
    }

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card group">
            <CardHeader className="p-8 border-b border-border/50 bg-gradient-to-r from-rose-500/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
                            <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
                            Enviar um Kudo
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">Reconheça o excelente trabalho de um colega hoje.</CardDescription>
                    </div>
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in zoom-in">
                            <CheckCircle2 className="w-5 h-5" />
                            Kudo Enviado!
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                    {/* Seleção de Usuário */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Para quem é o reconhecimento?</Label>
                        <div className="relative">
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                className="w-full h-14 bg-muted border-none rounded-2xl px-5 text-sm appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            >
                                <option value="">Selecione um colega...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
                                ))}
                            </select>
                            <Users className="absolute right-5 top-4 w-5 h-5 text-muted-foreground/30 pointer-events-none" />
                        </div>
                    </div>

                    {/* Mensagem */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Sua Mensagem</Label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Descreva o que seu colega fez de incrível..."
                            className="w-full min-h-[120px] bg-muted border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                        />
                    </div>

                    {/* Tags de Valores */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Valores Demonstrados</Label>
                        <div className="flex flex-wrap gap-2">
                            {KUDO_TAGS.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.label)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${selectedTags.includes(tag.label)
                                        ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-105'
                                        : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                                        }`}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedUser || !message}
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black text-lg shadow-xl shadow-primary/20 transition-all group active:scale-95"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <span>Espalhar Gratidão</span>
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
