import Link from 'next/link'
import { getUsers, updateUserStatus } from '../actions/users'
import { getOrganizations } from '../actions/organizations'
import { getUnits } from '../actions/units'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/feedback'

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
            description="Comece convidando colaboradores para a sua organização."
            action={
              <Button asChild variant="outline">
                <Link href="/admin/users/new">Convidar Primeiro Usuário</Link>
              </Button>
            }
          />
        ) : (
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Papel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users.map((user) => {
                  const org = organizations.find(o => o.id === user.org_id)
                  const unit = units.find(u => u.id === user.unit_id)
                  const role = roles.find(r => r.id === user.role_id)

                  return (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{user.full_name || 'Sem nome'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 capitalize">
                          {role?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{unit?.name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{org?.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <form action={async () => {
                          'use server'
                          const newStatus = user.status === 'active' ? 'inactive' : 'active'
                          await updateUserStatus(user.id, newStatus)
                        }} className="inline"
                        >
                          <button
                            type="submit"
                            className={`${user.status === 'active' ? 'text-orange-600 hover:text-orange-600/80' : 'text-green-600 hover:text-green-600/80'} mr-4`}
                          >
                            {user.status === 'active' ? 'Desativar' : 'Ativar'}
                          </button>
                        </form>
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
