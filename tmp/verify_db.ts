import { createAdminSupabaseClient } from '../src/lib/supabase/admin';

async function verifyPersistence() {
    const supabase = createAdminSupabaseClient();

    console.log('--- Verificando Persistência Banco de Dados ---');

    // ST-01: Organização
    const { data: org } = await supabase.from('organizations').select('*').eq('slug', 'org-teste-audit').maybeSingle();
    console.log('ST-01 (Org):', org ? 'PRESENTE (' + org.id + ')' : 'AUSENTE');

    // ST-02: Unidade
    if (org) {
        const { data: unit } = await supabase.from('units').select('*').eq('name', 'Unidade Matriz Teste').eq('org_id', org.id).maybeSingle();
        console.log('ST-02 (Unit):', unit ? 'PRESENTE' : 'AUSENTE');
    }

    // ST-04: Nível
    const { data: level } = await supabase.from('levels').select('*').eq('name', 'Nível Especialista I').maybeSingle();
    console.log('ST-04 (Level):', level ? 'PRESENTE' : 'AUSENTE');

    // ST-05: Trilha
    const { data: track } = await supabase.from('tracks').select('*').eq('name', 'Trilha de Produto').maybeSingle();
    console.log('ST-05 (Track):', track ? 'PRESENTE' : 'AUSENTE');
}

verifyPersistence().catch(console.error);
