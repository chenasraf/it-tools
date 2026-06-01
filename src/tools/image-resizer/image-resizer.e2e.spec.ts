import { expect, test } from '@playwright/test';

test.describe('Tool - Image resizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-resizer');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Image resizer - IT Tools');
  });
});
