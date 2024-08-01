import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';

test.describe('dyne-slangroom-preset', () => {
  test('renders', async ({ page }) => {
    await page.goto('/components/dyne-slangroom-preset/test/dyne-slangroom-preset.e2e.html');

    const element = page.locator('dyne-slangroom-preset');
    await expect(element).toHaveAttribute('contract');
  });
});
