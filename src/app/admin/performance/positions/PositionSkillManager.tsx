'use client'

import { useState } from 'react'
import { Skill } from '@/app/admin/actions/performance-skills'
import { PositionSkill, updatePositionSkill, removePositionSkill } from '@/app/admin/actions/performance-position-skills'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from 'lucide-react' // Usaremos ícones em vez de badge se não houver
import { Plus, Trash2, Star, Brain, Zap, Loader2 } from 'lucide-react'

interface PositionSkillManagerProps {
    positionId: string
    currentSkills: PositionSkill[]
    availableSkills: Skill[]
}

export default function PositionSkillManager({
    positionId,
    currentSkills: initialSkills,
    availableSkills
}: PositionSkillManagerProps) {
    const [currentSkills, setCurrentSkills] = useState<PositionSkill[]>(initialSkills)
    const [loading, setLoading] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)

    const handleUpdateLevel = async (skillId: string, level: number) => {
        setLoading(`level-${skillId}`)
        const result = await updatePositionSkill(positionId, skillId, level)
        if (result.success) {
            // Atualização local simplificada para UX
            setCurrentSkills(prev => prev.map(ps =>
                ps.skill_id === skillId ? { ...ps, required_level: level } : ps
            ))
        }
        setLoading(null)
    }

    const handleAdd = async (skillId: string) => {
        setLoading(`add-${skillId}`)
        const result = await updatePositionSkill(positionId, skillId, 3) // Nível 3 padrão
        if (result.success) {
            // Recarregar ou update local
            window.location.reload() // Simplificado para garantir integridade dos dados (joins)
        }
        setLoading(null)
    }

    const handleRemove = async (skillId: string) => {
        if (!confirm('Remover esta competência deste cargo?')) return
        setLoading(`remove-${skillId}`)
        const result = await removePositionSkill(positionId, skillId)
        if (result.success) {
            setCurrentSkills(prev => prev.filter(ps => ps.skill_id !== skillId))
        }
        setLoading(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold">Competências do Cargo</h3>
                    <p className="text-sm text-muted-foreground">Defina o perfil ideal para este cargo.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Fechar' : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Skill
                        </>
                    )}
                </Button>
            </div>

            {isAdding && (
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-sm">Vincular Nova Competência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableSkills
                                .filter(s => !currentSkills.some(cs => cs.skill_id === s.id))
                                .map(skill => (
                                    <div key={skill.id} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {skill.category === 'hard_skill' ? <Zap className="h-3 w-3 text-orange-500" /> : <Brain className="h-3 w-3 text-blue-500" />}
                                            <span className="text-xs font-bold truncate max-w-[120px]">{skill.name}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 text-primary"
                                            onClick={() => handleAdd(skill.id)}
                                            disabled={loading === `add-${skill.id}`}
                                        >
                                            {loading === `add-${skill.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {currentSkills.map((ps) => (
                    <Card key={ps.id} className="group overflow-hidden border-l-4 border-l-primary/30">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${ps.skills?.category === 'hard_skill' ? 'bg-orange-500/10' : 'bg-blue-500/10'}`}>
                                    {ps.skills?.category === 'hard_skill' ?
                                        <Zap className="h-5 w-5 text-orange-500" /> :
                                        <Brain className="h-5 w-5 text-blue-500" />
                                    }
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm tracking-tight">{ps.skills?.name}</h4>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => handleUpdateLevel(ps.skill_id, level)}
                                                disabled={loading === `level-${ps.skill_id}`}
                                                className={`transition-all ${level <= ps.required_level
                                                        ? 'text-yellow-500 scale-110'
                                                        : 'text-muted-foreground/30 hover:text-yellow-500/50'
                                                    }`}
                                            >
                                                <Star className={`h-4 w-4 ${level <= ps.required_level ? 'fill-current' : ''}`} />
                                            </button>
                                        ))}
                                        <span className="text-[10px] font-bold text-muted-foreground ml-2 uppercase">
                                            Nível {ps.required_level}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(ps.skill_id)}
                                disabled={loading === `remove-${ps.skill_id}`}
                            >
                                {loading === `remove-${ps.skill_id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {currentSkills.length === 0 && !isAdding && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-40">
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nenhuma competência vinculada</p>
                    </div>
                )}
            </div>
        </div>
    )
}
