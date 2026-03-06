'use client'

import { useState } from 'react'
import { createSkill, Skill } from '@/app/admin/actions/performance-skills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Plus,
    Search,
    Brain,
    Zap,
    Filter,
    Loader2,
    Trash2,
    Edit2
} from 'lucide-react'

interface CompetencyMatrixProps {
    initialSkills: Skill[]
}

export default function CompetencyMatrix({ initialSkills }: CompetencyMatrixProps) {
    const [skills, setSkills] = useState<Skill[]>(initialSkills)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const filteredSkills = skills.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddSkill = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const result = await createSkill({
            name: formData.get('name') as string,
            category: formData.get('category') as 'hard_skill' | 'soft_skill',
            description: formData.get('description') as string,
        })

        if (result.success && result.data) {
            setSkills([result.data, ...skills])
            setIsAdding(false)
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold">Matriz de Competências</h2>
                    <p className="text-sm text-muted-foreground">Gerencie o catálogo de hard e soft skills da organização.</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Competência
                </Button>
            </div>

            <div className="flex gap-4 items-center mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou descrição..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/50 shadow-md">
                    <CardHeader>
                        <CardTitle>Adicionar Competência</CardTitle>
                        <CardDescription>Defina os detalhes da nova habilidade no catálogo.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleAddSkill}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Competência</Label>
                                    <Input name="name" id="name" required placeholder="Ex: Gestão de Tempo" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <select
                                        name="category"
                                        id="category"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/20"
                                    >
                                        <option value="soft_skill">Soft Skill (Comportamental)</option>
                                        <option value="hard_skill">Hard Skill (Técnica)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição (Opcional)</Label>
                                <textarea
                                    name="description"
                                    id="description"
                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm min-h-[100px] outline-none focus:ring-2 ring-primary/20"
                                    placeholder="Explique o que esta competência avalia..."
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar no Catálogo
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                    <Card key={skill.id} className="hover:border-primary/30 transition-colors group">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                {skill.category === 'hard_skill' ?
                                    <Zap className="h-4 w-4 text-orange-500" /> :
                                    <Brain className="h-4 w-4 text-blue-500" />
                                }
                                <CardTitle className="text-sm font-bold uppercase tracking-tight">{skill.name}</CardTitle>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${skill.category === 'hard_skill' ?
                                    'bg-orange-500/10 text-orange-600 border-orange-200' :
                                    'bg-blue-500/10 text-blue-600 border-blue-200'
                                }`}>
                                {skill.category === 'hard_skill' ? 'HARD' : 'SOFT'}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                {skill.description || 'Sem descrição definida.'}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredSkills.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nenhuma competência encontrada</p>
                </div>
            )}
        </div>
    )
}
