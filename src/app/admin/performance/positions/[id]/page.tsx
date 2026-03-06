import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getPositionSkills } from '@/app/admin/actions/performance-position-skills'
import { getSkills } from '@/app/admin/actions/performance-skills'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Briefcase, MapPin, Building2, TrendingUp } from 'lucide-react'
import { PositionSkillManager } from './PositionSkillManager'

export const dynamic = 'force-dynamic'

export default async function PositionDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createServerSupabaseClient()

    // Buscar detalhes do cargo
    const { data: position } = await supabase
        .from('positions')
        .select('*, orgs:organizations(name), levels(name)')
        .eq('id', params.id)
        .single()

    if (!position) notFound()

    // Buscar competências vinculadas e disponíveis
    const [currentSkillsResult, allSkillsResult] = await Promise.all([
        getPositionSkills(params.id),
        getSkills()
    ])

    const currentSkills = currentSkillsResult.success ? currentSkillsResult.data || [] : []
    const availableSkills = allSkillsResult.success ? allSkillsResult.data || [] : []

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-card border-b px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/admin/positions">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{position.title}</h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-3 w-3" /> {position.orgs?.name}
                            <span className="mx-1">•</span>
                            <TrendingUp className="h-3 w-3" /> {position.levels?.name || 'Nível não definido'}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Sobre o Cargo</h3>
                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <p className="text-sm leading-relaxed text-foreground/80">
                                {position.description || 'Nenhuma descrição detalhada disponível para este cargo.'}
                            </p>
                        </div>
                    </section>

                    <PositionSkillManager
                        positionId={params.id}
                        currentSkills={currentSkills}
                        availableSkills={availableSkills}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
                        <h3 className="font-bold text-sm mb-2">Resumo do Perfil</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Total Competências</span>
                                <span className="font-extrabold">{currentSkills.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Hard Skills</span>
                                <span className="font-extrabold text-orange-600">
                                    {currentSkills.filter(s => s.skills?.category === 'hard_skill').length}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Soft Skills</span>
                                <span className="font-extrabold text-blue-600">
                                    {currentSkills.filter(s => s.skills?.category === 'soft_skill').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <h4 className="font-bold text-sm mb-4">Ações Rápidas</h4>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start text-xs font-bold uppercase tracking-tight" size="sm">
                                <Briefcase className="mr-2 h-4 w-4" />
                                Gerar PDIs Sugeridos
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-xs font-bold uppercase tracking-tight" size="sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                Mapear Sucessores
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
