import Link from 'next/link'
import { getSkills } from '@/app/admin/actions/performance-skills'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import CompetencyMatrix from './CompetencyMatrix'

export const dynamic = 'force-dynamic'

export default async function CompetenciesPage() {
    const skillsResult = await getSkills()
    const skills = skillsResult.success ? skillsResult.data || [] : []

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-card border-b px-6 py-4 shadow-sm mb-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/admin">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold text-foreground">Gestão de Performance</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/performance/evaluations">Ciclos de Avaliação</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pb-12">
                <CompetencyMatrix initialSkills={skills} />
            </main>
        </div>
    )
}
