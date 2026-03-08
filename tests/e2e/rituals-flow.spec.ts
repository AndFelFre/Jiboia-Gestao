import { test, expect } from '@playwright/test';

test.describe('QA: Rituals and Performance Flows', () => {

    test('Deve registrar um novo rito 1:1 com sucesso', async ({ page }: { page: any }) => {
        // 1. Navegar para a lista de usuários e escolher um perfil
        await page.goto('/admin/users');
        await page.waitForSelector('table');

        // Clica no primeiro "Ver Perfil" da tabela
        await page.click('table >> tr:nth-child(1) >> a:has-text("Ver Perfil")');

        const userNameElement = page.locator('h1');
        const userName = await userNameElement.innerText();

        // 2. Abrir o modal de Novo Rito
        const btnNovoRito = page.locator('button:has-text("Novo Rito")');
        await expect(btnNovoRito).toBeVisible();
        await btnNovoRito.click();

        // 3. Preencher o formulário
        await page.fill('input#title', '1:1 Semanal de Alinhamento');
        await page.fill('textarea#description', 'Discussão sobre metas e blockers da semana.');

        // Selecionar tipo One on One (já vem padrão, mas vamos garantir)
        await page.click('button:has-text("1:1")');

        // 4. Salvar
        await page.click('button:has-text("Registrar Rito")');

        // 5. Validar feedback e aparição na lista
        await expect(page.locator('text=Rito registrado com sucesso!')).toBeVisible();
        await expect(page.locator('h4:has-text("1:1 Semanal de Alinhamento")')).toBeVisible();
    });

    test('Deve validar visualmente o Scorecard DHO no perfil', async ({ page }: { page: any }) => {
        await page.goto('/admin/users');
        await page.click('table >> tr:nth-child(1) >> a:has-text("Ver Perfil")');

        // Verifica se o Scorecard está visível
        const scorecard = page.locator('div:has-text("Scorecard DHO")');
        await expect(scorecard).toBeVisible();

        // Verifica se a nota geral está presente
        const overallScore = page.locator('span:has-text("%")').first();
        await expect(overallScore).toBeVisible();
    });
});
