import { createServerSupabaseClientReadOnly } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createServerSupabaseClientReadOnly()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Buscar dados do usuário para a sidebar
    const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <DashboardSidebar user={userData || { full_name: 'Usuário' }} />
            <div className="flex-1 pl-72 transition-all duration-500 h-screen overflow-y-auto bg-background">
                {children}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .flex-1 { padding-left: 0 !important; }
                }
            ` }} />
        </div>
    )
}
