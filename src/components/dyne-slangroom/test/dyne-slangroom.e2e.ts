import { newE2EPage } from '@stencil/core/testing';

describe('dyne-slangroom', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<dyne-slangroom></dyne-slangroom>');

    const element = await page.find('dyne-slangroom');
    expect(element).toHaveClass('hydrated');
  });
});
