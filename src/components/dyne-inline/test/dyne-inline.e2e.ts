import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

test.describe('dyne-inline', () => {
  test('should render', async ({ page }) => {
    // The path here is the path to the www output relative to the dev server root directory
    await page.goto('/components/dyne-inline/test/dyne-inline.e2e.html');

    // Rest of test
    const component = await page.locator('dyne-inline');
    await expect(component).toHaveCSS('display', 'flex');
    await expect(component).toHaveClass('hydrated');
    await expect(component).toHaveText(`
    Click me
    
    
    
    
    
    
    
    
    
    
  
  
  
    Trust me
    
    
    
    
    
    
    
    
    
    
  
  
  
  


`);
  });
});
