import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AI-native commerce/i })).toBeVisible();
});
