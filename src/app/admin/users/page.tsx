import Link from 'next/link'
import { getUsers } from '../actions/users'
import { UserActions } from './UserActions'
import { getOrganizations } from '../actions/organizations'
import { getUnits } from '../actions/units'
import { Button } from '@/components/ui/button'
import { Plus, User as UserIcon, Shield, MapPin, Building, Mail } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Organization {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  org_id: string
  unit_id: string
  role_id: string
  email: string
  full_name?: string
  status: 'active' | 'inactive' | 'pending'
}

async function getRoles() {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase/server')
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('roles').select('*').order('name')
    if (error) throw error
    return { success: true, data }
  } catch {
    return { success: false, data: [] }
  }
}

export default async function UsersPage() {
  const [usersResult, orgsResult, unitsResult, rolesResult] = await Promise.all([
    getUsers(),
    getOrganizations(),
    getUnits(),
    getRoles()
  ])

  const users: User[] = usersResult.success && usersResult.data
    ? (usersResult.data as User[])
    : []
  const organizations: Organization[] = orgsResult.success && orgsResult.data
    ? (orgsResult.data as Organization[])
    : []
  const units: Unit[] = unitsResult.success && unitsResult.data
    ? (unitsResult.data as Unit[])
    : []
  const roles: Role[] = rolesResult.success && rolesResult.data
    ? (rolesResult.data as Role[])
    : []

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-600',
      inactive: 'bg-muted text-muted-foreground',
      pending: 'bg-yellow-500/10 text-yellow-600'
    }
    return styles[status as keyof typeof styles] || styles.inactive
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/admin" className="text-primary hover:text-primary/80 text-sm">
                ← Admin
              </Link>
              <h1 className="text-2xl font-bold text-foreground mt-1">Usuários</h1>
            </div>
            <Button asChild>
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Convidar Usuário
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {users.length === 0 ? (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Comece convidando seus colaboradores e parceiros para a plataforma."
            action={
              <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                <Link href="/admin/users/new">Convidar Primeiro Usuário</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Perfil do Usuário
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Papel (Acesso)
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Unidade / Org
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Gerenciamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {users.map((user) => {
                  const org = organizations.find(o => o.id === user.org_id)
                  const unit = units.find(u => u.id === user.unit_id)
                  const role = roles.find(r => r.id === user.role_id)

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-sm border border-indigo-100/50 group-hover:scale-105 transition-transform">
                            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-none">{user.full_name || 'Convite Pendente'}</div>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                              <Mail className="w-2.5 h-2.5 opacity-50" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100">
                          <Shield className="w-3.5 h-3.5" />
                          {role?.name || '-'}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {unit?.name || '-'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 pl-4">
                            {org?.name || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`inline - flex items - center px - 3 py - 1 rounded - full text - [10px] font - black uppercase tracking - widest border border - current transition - all ${getStatusBadge(user.status)} `}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <UserActions userId={user.id} status={user.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
