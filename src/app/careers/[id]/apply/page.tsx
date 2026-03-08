'use client'

import { useState } from 'react'
import { submitApplication } from '@/app/actions/careers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ApplyPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setResult(null)

        const payload = {
            job_id: params.id,
            full_name: formData.get('full_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            linkedin_url: formData.get('linkedin_url') as string,
            summary: formData.get('summary') as string,
        }

        const res = await submitApplication(payload)
        setResult(res)
        setLoading(false)
    }

    // Tela de sucesso (Write-Only: sem dados de volta)
    if (result?.success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-8">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Candidatura Enviada!</h1>
                    <p className="text-muted-foreground mb-8">{result.message}</p>
                    <Link href="/careers" className="text-primary hover:underline font-medium">
                        ← Voltar para vagas
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <Link href={`/careers/${params.id}`} className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" /> Voltar para a vaga
                    </Link>
                    <h1 className="text-2xl font-black text-foreground">Formulário de Candidatura</h1>
                    <p className="text-muted-foreground mt-1">Preencha seus dados abaixo. Seus dados estão protegidos.</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-10">
                {result && !result.success && (
                    <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg mb-6 border border-destructive/20 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{result.message}</span>
                    </div>
                )}

                <form action={handleSubmit} className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
                    <div>
                        <Label htmlFor="full_name">Nome Completo *</Label>
                        <Input id="full_name" name="full_name" placeholder="Seu nome completo" required maxLength={100} className="mt-1" />
                    </div>

                    <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" name="email" type="email" placeholder="seu@email.com" required maxLength={100} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" name="phone" placeholder="(11) 99999-9999" maxLength={20} className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="linkedin_url">LinkedIn</Label>
                            <Input id="linkedin_url" name="linkedin_url" placeholder="https://linkedin.com/in/..." maxLength={200} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="summary">Resumo Profissional</Label>
                        <textarea
                            id="summary"
                            name="summary"
                            placeholder="Conte brevemente sobre sua experiência e por que se interessa por esta vaga..."
                            maxLength={500}
                            rows={4}
                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Máximo 500 caracteres</p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Candidatura'}
                    </Button>

                    <p className="text-[10px] text-muted-foreground text-center">
                        Ao enviar, você concorda com o tratamento dos seus dados conforme a LGPD.
                    </p>
                </form>
            </main>
        </div>
    )
}
