'use client'

import { useState } from 'react'
import { logFunnelInput } from '@/app/actions/funnel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function FunnelForm({ activities }: { activities: any[] }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const activity_id = formData.get('activity_id') as string
        const input_date = formData.get('input_date') as string
        const amountStr = formData.get('amount') as string
        const notes = (formData.get('notes') as string) || ''

        if (!activity_id || !input_date || !amountStr) {
            setError('Preencha os campos obrigatórios.')
            setLoading(false)
            return
        }

        const payload = {
            activity_id,
            input_date,
            amount: parseInt(amountStr, 10),
            notes
        }

        const res = await logFunnelInput(payload)

        if (!res.success) {
            setError(res.error || 'Erro ao registrar apontamento.')
        } else {
            setSuccess(true)
            // Opcional: reset form via ref
        }

        setLoading(false)
    }

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Novo Apontamento</h2>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl mb-6 font-medium border border-destructive/20 flex items-center gap-3 animate-in shake duration-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 text-emerald-500 text-sm p-4 rounded-xl mb-6 font-medium border border-emerald-500/20 flex items-center gap-3 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    Apontamento salvo com sucesso!
                </div>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="input_date">Data</Label>
                    <Input
                        id="input_date"
                        name="input_date"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        required
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="activity_id">Atividade</Label>
                    <select
                        id="activity_id"
                        name="activity_id"
                        required
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Selecione uma atividade...</option>
                        {activities.map((a: any) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="amount">Quantidade</Label>
                    <Input
                        id="amount"
                        name="amount"
                        type="number"
                        min="0"
                        defaultValue="1"
                        required
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="notes">Observações (Opcional)</Label>
                    <Input
                        id="notes"
                        name="notes"
                        type="text"
                        placeholder="Algum comentário sobre essas atividades?"
                        className="mt-1"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-4">
                    {loading ? 'Salvando...' : 'Salvar Apontamento'}
                </Button>
            </form>
        </div>
    )
}
