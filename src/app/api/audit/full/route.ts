import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getDHOScorecard } from '@/app/admin/actions/dho-scorecard';

export async function GET() {
    const supabase = createAdminSupabaseClient();
    const summary: any = {
        logs: [],
        errors: []
    };
    const startTimestamp = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const log = (msg: string) => summary.logs.push(msg);
    const error = (step: string, err: any) => {
        summary.errors.push({
            step,
            message: err.message,
            code: err.code,
            details: err.details,
            hint: err.hint,
            column: err.column,
            table: err.table,
            schema: err.schema
        });
        log(`ERRO EM ${step}: ${err.message} (Coluna: ${err.column || '?'})`);
    }

    try {
        log('--- Auditoria Deep Debug C.3/C.4 ---');

        // 1. Setup Ambiente
        const slug = `audit-deep-${startTimestamp}`;
        const { data: org, error: oError } = await supabase.from('organizations').insert({ name: `Audit Deep ${startTimestamp}`, slug }).select().single();
        if (oError) { error('Org Creation', oError); throw new Error('Stop'); }
        log(`Org OK: ID=${org.id} Slug=${org.slug}`);

        const { data: user, error: uError } = await supabase.from('users').insert({
            org_id: org.id,
            unit_id: null, // Verificando se unit_id é opcional
            role_id: null, // Verificando se role_id é opcional (em users costuma ser link fixo)
            email: `deep.${startTimestamp}@test.com`,
            full_name: 'User Deep',
            status: 'active'
        }).select().single();

        // NOTA: Se o insert acima falhar por NOT NULL em unit_id ou role_id, saberemos agora.
        if (uError) {
            error('User Creation', uError);
            // Tentar ver os cargos e unidades existentes para preencher um válido
            const { data: roles } = await supabase.from('roles').select('id, name');
            const { data: units } = await supabase.from('units').select('id').eq('org_id', org.id).limit(1);
            log(`DICA RECUADO: Roles=${JSON.stringify(roles)} Units=${JSON.stringify(units)}`);
            // Tentar novamente com dados mínimos válidos se possível (mas geralmente org_id é o que importa)
            throw new Error('Stop');
        }
        log(`User OK: ${user.id}`);

        // --- FASE C.3 ---
        log('Testando PDI Plan...');
        // Verificando se leader_id é obrigatório mesmo para development
        const { data: plan, error: pErr } = await supabase.from('pdi_plans').insert({
            org_id: org.id,
            user_id: user.id,
            title: 'Deep Plan',
            status: 'active',
            plan_type: 'development'
        }).select().single();

        if (pErr) {
            error('PDI Plan', pErr);
        } else {
            log('PDI Plan OK');
        }

    } catch (err: any) {
        if (err.message !== 'Stop') log(`ERRO CRÍTICO: ${err.message}`);
    }

    return NextResponse.json(summary);
}
