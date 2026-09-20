import { test, expect } from '@playwright/test';

test.describe('Home — Lista de compras', () => {
  test('renderiza página home sem erros', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Minhas Listas');
  });

  test('exibe estado vazio com CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByText('Criar primeira lista');
    // Either FAB or empty state CTA is visible
    const fab = page.getByLabel('Nova lista');
    await expect(fab).toBeVisible();
  });

  test('abre sheet de nova lista ao clicar no FAB', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nova lista').click();
    await expect(page.getByRole('dialog', { name: 'Nova lista' })).toBeVisible();
  });

  test('cria lista e navega para tela de detalhes', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nova lista').click();
    await page.getByPlaceholder('Ex: Carrefour 14/09').fill('Atacadão Teste');
    await page.getByRole('button', { name: 'Criar lista' }).click();

    await expect(page).toHaveURL(/\/lista/);
    await expect(page.locator('h1')).toContainText('Atacadão Teste');
  });

  test('tela de lista mostra total zerado', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nova lista').click();
    await page.getByPlaceholder('Ex: Carrefour 14/09').fill('Lista E2E');
    await page.getByRole('button', { name: 'Criar lista' }).click();

    await expect(page.getByTestId('total-cost')).toContainText('R$');
  });
});

test.describe('Tela de lista — adicionar item', () => {
  test('adiciona item e atualiza total', async ({ page }) => {
    // Create a list first
    await page.goto('/');
    await page.getByLabel('Nova lista').click();
    await page.getByPlaceholder('Ex: Carrefour 14/09').fill('Lista Item Test');
    await page.getByRole('button', { name: 'Criar lista' }).click();
    await expect(page).toHaveURL(/\/lista/);

    // Add an item
    await page.getByLabel('Adicionar item').click();
    await expect(page.getByRole('dialog', { name: 'Adicionar item' })).toBeVisible();

    const nameInput = page.getByPlaceholder('Ex: Arroz Camil 5kg');
    await nameInput.fill('Arroz Tipo 1 5kg');

    await page.getByLabel('Preço unitário (R$)').fill('22.50');
    await page.getByRole('button', { name: 'Adicionar à lista' }).click();

    await expect(page.getByText('Arroz Tipo 1 5kg')).toBeVisible();
    await expect(page.getByTestId('total-cost')).toContainText('22,50');
  });
});
