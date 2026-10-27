import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/especies.html');
});

test('el catálogo muestra las especies', async ({ page }) => {
  await expect(page.locator('especie-card')).not.toHaveCount(0);
});

test('al hacer clic en una especie aparece el botón Me gusta', async ({ page }) => {
  await page.locator('especie-card').nth(2).click();
  await expect(page.getByRole('button', { name: '👍 Me gusta' })).toBeVisible();
});

test('Me gusta suma 1', async ({ page }) => {
  await page.locator('especie-card').nth(2).click();
  await page.getByRole('button', { name: '👍 Me gusta' }).click();
  await expect(page.locator('especie-valoracion')).toContainText('1');
});

test('dos clics suman 2', async ({ page }) => {
  await page.locator('especie-card').nth(2).click();
  const boton = page.getByRole('button', { name: '👍 Me gusta' });
  await boton.click();
  await boton.click();
  await expect(page.locator('especie-valoracion')).toContainText('2');
});

test('los likes se guardan al cambiar de especie', async ({ page }) => {
  const boton = page.getByRole('button', { name: '👍 Me gusta' });
  await page.locator('especie-card').nth(2).click();
  await boton.click();
  await page.locator('especie-card').nth(0).click();
  await page.locator('especie-card').nth(2).click();
  await expect(page.locator('especie-valoracion')).toContainText('1');
});