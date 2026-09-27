import { test, expect } from '@playwright/test';

test.describe('Home — Lista de compras', () => {
  test('renderiza página home sem erros', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Minhas Listas');
  });

  test('exibe FAB de nova lista', async ({ page }) => {
    await page.goto('/');
    const fab = page.getByRole('button', { name: 'Nova lista' });
    await expect(fab).toBeVisible();
  });

  test('abre sheet de nova lista ao clicar no FAB', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await expect(page.getByRole('dialog', { name: 'Nova lista' })).toBeVisible();
  });

  test('cria lista e navega para tela de detalhes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByPlaceholder('Ex: Atacadão, Carrefour…').fill('Atacadão Teste');
    await page.getByRole('button', { name: 'Criar lista' }).click();

    await expect(page).toHaveURL(/\/lista/);
    await expect(page.locator('h1')).toContainText('Atacadão Teste');
  });

  test('tela de lista mostra total zerado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByPlaceholder('Ex: Atacadão, Carrefour…').fill('Lista E2E');
    await page.getByRole('button', { name: 'Criar lista' }).click();

    await expect(page.getByTestId('total-cost')).toContainText('R$');
  });
});

test.describe('Tela de lista — adicionar item', () => {
  test('adiciona item e atualiza total', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByPlaceholder('Ex: Atacadão, Carrefour…').fill('Lista Item Test');
    await page.getByRole('button', { name: 'Criar lista' }).click();
    await expect(page).toHaveURL(/\/lista/);

    await page.getByRole('button', { name: 'Adicionar item' }).click();
    await expect(page.getByRole('dialog', { name: 'Adicionar item' })).toBeVisible();

    const nameInput = page.getByPlaceholder('Ex: Arroz Camil 5kg');
    await nameInput.fill('Arroz Tipo 1 5kg');

    await page.getByLabel('Preço unitário (R$)').fill('22.50');
    await page.getByRole('button', { name: 'Adicionar à lista' }).click();

    await expect(page.getByText('Arroz Tipo 1 5kg')).toBeVisible();
    await expect(page.getByTestId('total-cost')).toContainText('22,50');
  });

  test('compra de vários pacotes de peso/volume multiplica o total corretamente', async ({
    page,
  }) => {
    // Regression test for a real bug report: buying 4 packages of 1kg flour
    // at R$4.50 each must total R$18.00, not R$4.50 (the price of a single
    // package). See ListItem.packageCount.
    await page.goto('/');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByPlaceholder('Ex: Atacadão, Carrefour…').fill('Lista Farinha');
    await page.getByRole('button', { name: 'Criar lista' }).click();
    await expect(page).toHaveURL(/\/lista/);

    await page.getByRole('button', { name: 'Adicionar item' }).click();
    await expect(page.getByRole('dialog', { name: 'Adicionar item' })).toBeVisible();

    await page.getByPlaceholder('Ex: Arroz Camil 5kg').fill('Farinha de Trigo 1kg');
    await page.getByLabel('Unidade').selectOption('kg');
    await page.getByLabel('Tamanho da embalagem').fill('1');
    await page.getByLabel('Quantos pacotes você comprou?').fill('4');
    await page.getByLabel('Preço da embalagem (R$)').fill('4.50');
    await page.getByRole('button', { name: 'Adicionar à lista' }).click();

    await expect(page.getByText('Farinha de Trigo 1kg')).toBeVisible();
    await expect(page.getByTestId('total-cost')).toContainText('18,00');
  });
});
