'use client'

import { useState, useEffect } from 'react'
import { getActivePulseSurveys, submitPulseResponse, PulseSurvey } from '@/app/actions/pulse'
import {
    CheckCircle2,
    ChevronRight,
    Smile,
    Meh,
    Frown,
    SmilePlus,
    Angry,
    Loader2
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RATINGS = [
    { score: 1, icon: Angry, color: 'text-red-500', label: 'Muito Insatisfeito' },
    { score: 2, icon: Frown, color: 'text-orange-500', label: 'Insatisfeito' },
    { score: 3, icon: Meh, color: 'text-amber-500', label: 'Neutro' },
    { score: 4, icon: Smile, color: 'text-blue-500', label: 'Satisfeito' },
    { score: 5, icon: SmilePlus, color: 'text-emerald-500', label: 'Muito Satisfeito' }
]

export function PulseSurveyCard() {
    const [surveys, setSurveys] = useState<PulseSurvey[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedScore, setSelectedScore] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        loadSurveys()
    }, [])

    async function loadSurveys() {
        const res = await getActivePulseSurveys({})
        if (res.success && res.data) {
            setSurveys(res.data)
        }
        setLoading(false)
    }

    async function handleSubmit() {
        if (!selectedScore || !surveys[currentIndex]) return
        setIsSubmitting(true)
        const res = await submitPulseResponse({
            surveyId: surveys[currentIndex].id,
            score: selectedScore
        })
        if (res.success) {
            setSubmitted(true)
            setTimeout(() => {
                if (currentIndex < surveys.length - 1) {
                    setCurrentIndex(prev => prev + 1)
                    setSubmitted(false)
                    setSelectedScore(null)
                }
            }, 2000)
        }
        setIsSubmitting(false)
    }

    if (loading) return (
        <div className="h-48 bg-muted rounded-[2.5rem] animate-pulse" />
    )

    if (surveys.length === 0 || (submitted && currentIndex === surveys.length - 1)) {
        return (
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-emerald-600 dark:bg-emerald-700 text-white p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Tudo em dia!</h3>
                    <p className="text-white/80 text-sm">Obrigado por compartilhar seu feedback. Isso nos ajuda a construir uma empresa melhor.</p>
                </div>
            </Card>
        )
    }

    const currentSurvey = surveys[currentIndex]

    return (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card group">
            <CardHeader className="p-8 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Pesquisa Pulse</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{currentIndex + 1} de {surveys.length}</span>
                        </div>
                        <CardTitle className="text-xl font-black text-foreground leading-tight">
                            {currentSurvey.question}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="flex justify-between items-center gap-4 mb-8">
                    {RATINGS.map((r) => (
                        <button
                            key={r.score}
                            onClick={() => setSelectedScore(r.score)}
                            disabled={submitted}
                            className={`flex flex-col items-center gap-2 flex-1 transition-all group/btn ${selectedScore === r.score
                                ? 'scale-110'
                                : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                                }`}
                        >
                            <div className={`p-4 rounded-3xl transition-all ${selectedScore === r.score ? 'bg-primary text-primary-foreground shadow-xl' : 'bg-muted text-muted-foreground/50'
                                }`}>
                                <r.icon className="w-8 h-8" />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${selectedScore === r.score ? 'text-foreground' : 'text-muted-foreground/70'
                                }`}>
                                {r.label}
                            </span>
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!selectedScore || submitted || isSubmitting}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                            <span>Enviar Resposta</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
