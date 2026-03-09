'use server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function resetUserPasswordAdmin() {
    const supabase = createAdminSupabaseClient()
    const email = 'andrefelippefreire23@gmail.com'
    const newPassword = 'tes123test456'

    try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        const user = users.find(u => u.email === email)
        if (!user) throw new Error('Usuário não encontrado')

        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: newPassword,
            email_confirm: true
        })

        if (updateError) throw updateError

        return { success: true, message: `Senha atualizada para ${email}` }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
