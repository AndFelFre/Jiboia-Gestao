const { createClient } = require('@supabase/supabase-js');

// URL CORRETA EXTRAÍDA DO .ENV.LOCAL
const supabaseUrl = 'https://cobwahabczwwuvpvj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idGNsaHZlY2xzcWNsdnNxY2x2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMjkyMTM4NiwiZXhwIjoyMDM4NDk3Mzg2fQ.y_O8j8IP1b1OeUkTzrdbeP_aRraPQ_OWo41Qtf_QNRYv7wWVEZ8oG6pVGL';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAuditPhaseC1() {
    console.log('--- Iniciando Auditoria Fase C.1 (Estrutura) ---');

    try {
        // ST-01: Organização
        console.log('Testando ST-01: Organização...');
        const { data: org, error: orgErr } = await supabase
            .from('organizations')
            .upsert({
                name: 'Org de Teste Auditoria',
                slug: 'org-teste-audit',
                settings: { test: true }
            }, { onConflict: 'slug' })
            .select();

        if (orgErr) {
            console.error('ST-01 FALHA:', JSON.stringify(orgErr, null, 2));
        } else {
            console.log('ST-01 OK:', org);

            if (org && org.length > 0) {
                const orgId = org[0].id;

                // ST-02: Unidade
                console.log('Testando ST-02: Unidade...');
                const { data: unit, error: unitErr } = await supabase
                    .from('units')
                    .upsert({
                        org_id: orgId,
                        name: 'Unidade Matriz Teste'
                    }, { onConflict: 'org_id, name' })
                    .select();

                if (unitErr) console.error('ST-02 FALHA:', unitErr);
                else console.log('ST-02 OK:', unit);

                // ST-04: Nível
                console.log('Testando ST-04: Nível...');
                const { data: level, error: levelErr } = await supabase
                    .from('levels')
                    .upsert({
                        org_id: orgId,
                        name: 'Nível Especialista I',
                        sequence: 10
                    }, { onConflict: 'org_id, sequence' })
                    .select();

                if (levelErr) console.error('ST-04 FALHA:', levelErr);
                else console.log('ST-04 OK:', level);

                // ST-05: Trilha
                console.log('Testando ST-05: Trilha...');
                const { data: track, error: trackErr } = await supabase
                    .from('tracks')
                    .upsert({
                        org_id: orgId,
                        name: 'Trilha de Produto'
                    }, { onConflict: 'org_id, name' })
                    .select();

                if (trackErr) console.error('ST-05 FALHA:', trackErr);
                else console.log('ST-05 OK:', track);

                // ST-03: Cargo
                if (level && level.length > 0 && track && track.length > 0) {
                    console.log('Testando ST-03: Cargo...');
                    const { data: pos, error: posErr } = await supabase
                        .from('positions')
                        .upsert({
                            org_id: orgId,
                            title: 'Gerente de Produto I',
                            level_id: level[0].id,
                            track_id: track[0].id
                        }, { onConflict: 'org_id, title' })
                        .select();

                    if (posErr) console.error('ST-03 FALHA:', posErr);
                    else console.log('ST-03 OK:', pos);
                }
            }
        }
    } catch (err) {
        console.error('ERRO CRÍTICO NO SCRIPT:', err);
    }

    console.log('--- Auditoria C.1 Finalizada ---');
}

runAuditPhaseC1().catch(console.error);
