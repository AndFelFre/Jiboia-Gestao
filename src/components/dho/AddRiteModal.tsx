'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, MessagesSquare, Star, Flag, Loader2 } from 'lucide-react'
import { addLeadershipRite } from '@/app/admin/actions/dho-rites'
import { toast } from '@/components/ui/feedback'
import type { DHORiteType } from '@/types'

interface AddRiteModalProps {
    userId: string
    userName: string
}

export function AddRiteModal({ userId, userName }: AddRiteModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        riteType: 'one_on_one' as DHORiteType,
        title: '',
        description: '',
        deadline: new Date().toISOString().split('T')[0],
        status: 'not_started' as 'not_started' | 'completed'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title) {
            toast.error('O título do rito é obrigatório')
            return
        }

        setLoading(true)
        try {
            const result = await addLeadershipRite({
                userId,
                riteType: formData.riteType,
                title: formData.title,
                description: formData.description,
                deadline: formData.deadline,
                status: formData.status
            })

            if (result.success) {
                toast.success('Rito registrado com sucesso!')
                setIsOpen(false)
                // Limpar form
                setFormData({
                    riteType: 'one_on_one',
                    title: '',
                    description: '',
                    deadline: new Date().toISOString().split('T')[0],
                    status: 'not_started'
                })
            } else {
                toast.error(result.error || 'Erro ao registrar rito')
            }
        } catch (error) {
            toast.error('Erro inesperado ao salvar rito')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg border-slate-200 text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" />
                    Novo Rito
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Novo Rito de Liderança</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Registre um acompanhamento para <span className="text-indigo-600 font-bold">{userName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Rito</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'one_on_one', label: '1:1', icon: MessagesSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { id: 'feedback', label: 'Feedback', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { id: 'checkpoint', label: 'Checkpoint', icon: Flag, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, riteType: type.id as DHORiteType })}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${formData.riteType === type.id
                                                ? `border-indigo-600 ${type.bg} shadow-md`
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                    >
                                        <type.icon className={`w-5 h-5 ${type.color}`} />
                                        <span className="text-[10px] font-black uppercase">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título do Rito *</Label>
                            <Input
                                id="title"
                                placeholder="Ex: Feedback Mensal de Performance"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Inicial</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="not_started">Agendado (Pendente)</option>
                                    <option value="completed">Já Realizado (Concluído)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observações (Opcional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Pontos discutidos, combinados ou lições aprendidas..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-xl border-slate-200 min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-8">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Registrar Rito'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
