import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';

test.describe('dyne-slangroom-preset-loader', () => {
  test('renders', async ({ page }) => {
    await page.goto(
      '/components/dyne-slangroom-preset-loader/test/dyne-slangroom-preset-loader.e2e.html',
    );

    const element = page.locator('dyne-slangroom-preset-loader');
    await expect(element).toHaveAttribute('editor-id');
  });
});
