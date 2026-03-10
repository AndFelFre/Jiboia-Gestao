'use client'

import React, { useState } from 'react'
import { Save, Plus, Minus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitFunnelActivity } from '@/app/admin/actions/sales-funnel'
import { toast } from 'sonner'

interface FunnelActivityFormProps {
    initialData?: {
        prospections: number
        visits: number
        proposals: number
    }
}

export function FunnelActivityForm({ initialData }: FunnelActivityFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        prospections: initialData?.prospections || 0,
        visits: initialData?.visits || 0,
        proposals: initialData?.proposals || 0
    })

    const handleIncrement = (key: keyof typeof formData, step: number) => {
        setFormData(prev => ({
            ...prev,
            [key]: Math.max(0, prev[key] + step)
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const result = await submitFunnelActivity(formData)
            if (result.success) {
                toast.success(result.data)
            } else {
                toast.error(result.error)
            }
        } catch (err) {
            toast.error('Erro ao salvar atividades')
        } finally {
            setLoading(false)
        }
    }

    const ActivityInput = ({ label, value, field, description }: any) => (
        <div className="space-y-3 p-4 bg-slate-50/50 rounded-3xl border border-slate-100">
            <div>
                <Label className="text-xs font-black uppercase text-slate-800 tracking-widest">{label}</Label>
                <p className="text-[10px] font-medium text-slate-400 uppercase leading-tight">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl bg-white shadow-sm"
                    onClick={() => handleIncrement(field, -1)}
                >
                    <Minus className="w-5 h-5 text-slate-400" />
                </Button>
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => setFormData(p => ({ ...p, [field]: parseInt(e.target.value) || 0 }))}
                    className="h-12 text-center text-xl font-black rounded-2xl border-slate-100 bg-white"
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => handleIncrement(field, 1)}
                >
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )

    return (
        <Card className="rounded-[2.5rem] border-slate-100 overflow-hidden shadow-sm">
            <CardHeader className="p-6">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Registro de Suor Diário</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Quanto você trabalhou hoje para bater sua meta?</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
                <ActivityInput
                    label="Prospecções"
                    description="Portas batidas / Primeiro contato"
                    value={formData.prospections}
                    field="prospections"
                />
                <ActivityInput
                    label="Visitas / Reuniões"
                    description="Apresentação do produto / Pitch"
                    value={formData.visits}
                    field="visits"
                />
                <ActivityInput
                    label="Propostas Enviadas"
                    description="Cotação / Envio de taxas"
                    value={formData.proposals}
                    field="proposals"
                />

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 gap-2 mt-4"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Resultados de Hoje
                </Button>
            </CardContent>
        </Card>
    )
}
