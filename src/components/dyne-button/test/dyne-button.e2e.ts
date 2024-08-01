import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('dyne-button', () => {
  test('should render the correct name', async ({ page }) => {
    // The path here is the path to the www output relative to the dev server root directory
    await page.goto('/components/dyne-button/test/dyne-button.e2e.html');

    // Rest of test
    const component = page.locator('dyne-button');
    await expect(component).toHaveText(`ciao`);
  });
});
