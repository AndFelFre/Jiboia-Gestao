import { requirePermission } from '@/lib/supabase/auth'
import { getOnboardingTemplates } from '../actions/onboarding'
import { PlusCircle, ListChecks } from 'lucide-react'
import { CreateTemplateForm } from '@/components/onboarding/CreateTemplateForm'
import { AddItemForm } from '@/components/onboarding/AddItemForm'

export const dynamic = 'force-dynamic'

export default async function AdminOnboardingPage() {
    // Garante que só quem tem permissão acessa
    await requirePermission('onboarding.manage')

    // Busca os dados via Server Action existente
    const res = await getOnboardingTemplates()
    const templates = res.success ? (res.data || []) : []

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10">
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl">
                        <ListChecks className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Gestão de Onboarding</h2>
                        <p className="text-muted-foreground mt-1">
                            Crie trilhas de integração e defina o passo-a-passo (D0, D15, D30) dos novos colaboradores.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Novo Template */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-primary" />
                            Nova Trilha
                        </h3>
                        <CreateTemplateForm />
                    </div>
                </div>

                {/* Lado Direito: Templates Existentes */}
                <div className="lg:col-span-2 space-y-6">
                    {templates.length === 0 ? (
                        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
                            <ListChecks className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Nenhuma Trilha Encontrada</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Você ainda não criou nenhum template de onboarding. Utilize o formulário ao lado para começar.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {templates.map(template => (
                                <div key={template.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                                {template.name}
                                                {!template.is_active && (
                                                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full uppercase tracking-wider font-bold">Inativo</span>
                                                )}
                                            </h3>
                                            {template.description && (
                                                <p className="text-muted-foreground mt-1 text-sm">{template.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                                            Itens do Checklist ({template.onboarding_items?.length || 0})
                                        </h4>

                                        {/* Lista de Itens */}
                                        {template.onboarding_items && template.onboarding_items.length > 0 ? (
                                            <div className="space-y-3 mb-6">
                                                {template.onboarding_items
                                                    .sort((a: any, b: any) => a.sequence - b.sequence)
                                                    .map((item: any) => (
                                                        <div key={item.id} className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg group">
                                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                                {item.sequence}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-foreground">{item.title}</p>
                                                                {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic mb-6">Esta trilha ainda não possui itens.</p>
                                        )}

                                        {/* Add Item Form  */}
                                        <div className="border-t border-border/50 pt-4 mt-4">
                                            <AddItemForm templateId={template.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

