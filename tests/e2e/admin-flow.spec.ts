import { test, expect } from '@playwright/test';

/**
 * QA Audit E2E: Fluxos Administrativos de DHO
 * 
 * Este teste valida a integridade do ciclo de criação de dados:
 * 1. Preenchimento de formulário
 * 2. Feedback visual (Toast Sonner)
 * 3. Redirecionamento correto
 */

test.describe('Admin DHO Flow Audit', () => {

    test('Deve criar um novo cargo com feedback visual e redirecionamento', async ({ page }: { page: any }) => {
        // 1. Acessa a página de novo cargo
        await page.goto('/admin/positions/new');

        // 2. Valida se o formulário carregou
        await expect(page.locator('h1')).toContainText(/Criar Cargo/i);

        // 3. Preenche os campos obrigatórios
        // Seleciona a organização (ajuste o seletor conforme o id da sua org de teste)
        await page.selectOption('select#org_id', { index: 1 });

        await page.fill('input#title', `QA Automation Test - ${Date.now()}`);
        await page.fill('textarea#description', 'Teste de integração automatizado para validar fluxo de redirecionamento e Toasts.');

        // 4. Submete o formulário
        await page.click('button[type="submit"]');

        // 5. Validação de Feedback (Toast)
        // Procuramos pelo texto de sucesso que configuramos no formulário
        await expect(page.locator('text=Cargo criado com sucesso!')).toBeVisible();

        // 6. Validação de Redirecionamento
        // Após o sucesso, o sistema deve levar o usuário de volta para a listagem
        await expect(page).toHaveURL(/.*\/admin\/positions/);
    });

    test('Deve validar navegação básica da Sidebar', async ({ page }: { page: any }) => {
        await page.goto('/dashboard');

        // Testa link de Analytics
        await page.click('nav >> text=Analytics');
        await expect(page).toHaveURL(/.*\/admin\/analytics/);

        // Testa link de Auditoria
        await page.click('nav >> text=Auditoria');
        await expect(page).toHaveURL(/.*\/admin\/audit/);
    });
});
