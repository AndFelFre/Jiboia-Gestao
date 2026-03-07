import { getUserTimeline } from '@/app/admin/actions/dho-timeline'
import { getUserOnboardingRampUp } from '@/app/admin/actions/dho-onboarding'
import { getUserLeadershipRites } from '@/app/admin/actions/dho-rites-fetch'
import { getDHOScorecard } from '@/app/admin/actions/dho-scorecard'
import { getEvaluationForUser } from '@/app/admin/actions/dho-performance'
import { getUsers } from '@/app/admin/actions/users'
import { getOrganizations } from '@/app/admin/actions/organizations'
import { getPositions } from '@/app/admin/actions/positions'
import { UserTimeline } from '@/components/dho/UserTimeline'
import { OnboardingRampUp } from '@/components/dho/OnboardingRampUp'
import { LeadershipRites } from '@/components/dho/LeadershipRites'
import { DHOScorecardView } from '@/components/dho/DHOScorecardView'
import { EvaluationManagementView } from '@/components/dho/EvaluationManagementView'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building, Briefcase, TrendingUp } from 'lucide-react'

interface UserProfilePageProps {
    params: {
        id: string
    }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const { id: userId } = params

    // Fetch Base User Data
    const usersResult = await getUsers()
    const users = usersResult.success ? (usersResult.data as any[]) : []
    const user = users.find(u => u.id === userId)

    if (!user) {
        notFound()
    }

    // Fetch supplementary metadata (Orgs, Positions) if needed
    const orgsResult = await getOrganizations()
    const orgs = orgsResult.success ? (orgsResult.data as any[]) : []
    const currentOrg = orgs.find(o => o.id === user.org_id)?.name || 'N/A'

    const posResult = await getPositions(user.org_id)
    const positions = posResult.success ? (posResult.data as any[]) : []
    const currentPos = positions.find(p => p.id === user.position_id)?.title || 'Não definido'

    // Fetch DHO Data
    const [timelineResult, rampUpResult, ritesResult, scorecardResult, performanceResult] = await Promise.all([
        getUserTimeline(userId),
        getUserOnboardingRampUp(userId),
        getUserLeadershipRites(userId),
        getDHOScorecard(userId),
        getEvaluationForUser(userId)
    ])

    const timelineEvents = timelineResult.success ? (timelineResult.data || []) : []
    const rampUpMetrics = rampUpResult.success ? rampUpResult.data : null
    const leadershipRites = ritesResult.success ? (ritesResult.data || []) : []
    const scorecardData = scorecardResult.success ? scorecardResult.data : null
    const evaluation = performanceResult.success ? performanceResult.data : null

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/admin/users" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Voltar para Usuários
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.full_name || 'Usuário Pendente'}</h1>
                                <p className="text-sm font-medium text-slate-500">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* DHO Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Cargo Atual</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{currentPos}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <Building className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Organização</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{currentOrg}</p>
                        </div>
                    </div>
                </div>

                {/* Scorecard Hero */}
                {scorecardData && (
                    <DHOScorecardView scorecard={scorecardData} />
                )}

                {/* Performance Evaluation Section (RUA + SMART) */}
                <EvaluationManagementView userId={userId} evaluation={evaluation || null} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - RampUp & Rites */}
                    <div className="lg:col-span-1 space-y-6">
                        <OnboardingRampUp metrics={rampUpMetrics} />
                        <LeadershipRites rites={leadershipRites} userId={userId} />
                    </div>

                    {/* Right Column - Timeline */}
                    <div className="lg:col-span-2">
                        <UserTimeline events={timelineEvents} />
                    </div>
                </div>
            </main>
        </div>
    )
}
