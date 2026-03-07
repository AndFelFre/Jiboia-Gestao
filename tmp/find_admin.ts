import { createAdminSupabaseClient } from '../src/lib/supabase/admin';

async function findAdminUser() {
    const supabase = createAdminSupabaseClient();

    console.log('--- Buscando Usuário Administrador ---');
    const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, role:roles(name)')
        .eq('email', 'andreadm@adm.com')
        .single();

    if (error) {
        console.error('Erro ao buscar usuário:', error.message);
    } else {
        console.log('Usuário Encontrado:', JSON.stringify(user, null, 2));
    }
}

findAdminUser().catch(console.error);
