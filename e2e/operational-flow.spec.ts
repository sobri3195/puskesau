import { expect, test } from '@playwright/test';

test('main operational flow: review critical alert and navigate to module', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Notifikasi & Peringatan' })).toBeVisible();

  await page.getByRole('button', { name: 'Critical-only OFF' }).click();
  await expect(page.getByText('Critical-only ON')).toBeVisible();

  await page.getByRole('button', { name: 'Aktifkan kode donor' }).first().click();

  await expect(page.getByText('Aksi dijalankan: Aktifkan kode donor → Pelayanan Medis')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pelayanan Medis' })).toBeVisible();
});
