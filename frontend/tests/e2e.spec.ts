import { test, expect } from '@playwright/test';

test.describe('Luvaria Ulisses — E2E Tests', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Luvaria Ulisses/);
    await expect(page.getByText('Luvaria Ulisses')).toBeVisible();
    await expect(page.getByText('Desde 1925')).toBeVisible();
  });

  test('deve navegar para Reserva VIP', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Reserva VIP').click();
    await expect(page.getByText('Experiência Exclusiva')).toBeVisible();
    await expect(page.getByText('Escolha a Data')).toBeVisible();
  });

  test('deve abrir página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Acesse sua conta')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
  });

  test('deve fazer login como admin', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('admin@luvariaulisses.com');
    await page.getByLabel('Senha').fill('Admin@2026!');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Deve redirecionar para admin
    await expect(page).toHaveURL(/.*\/admin.*/);
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('errado@email.com');
    await page.getByLabel('Senha').fill('senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Deve mostrar mensagem de erro genérica
    await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible();
  });

  test('deve acessar painel admin', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('E-mail').fill('admin@luvariaulisses.com');
    await page.getByLabel('Senha').fill('Admin@2026!');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Verificar painel admin
    await expect(page.getByText('Painel Administrativo')).toBeVisible();
    await expect(page.getByText('Gerenciar Produtos')).toBeVisible();
    await expect(page.getByText('Gerenciar Clientes')).toBeVisible();
    await expect(page.getByText('Ver Reservas')).toBeVisible();
  });
});
