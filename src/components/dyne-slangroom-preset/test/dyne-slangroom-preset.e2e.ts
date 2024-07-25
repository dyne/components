import { newE2EPage } from '@stencil/core/testing';

describe('dyne-slangroom-preset', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<dyne-slangroom-preset></dyne-slangroom-preset>');

    const element = await page.find('dyne-slangroom-preset');
    expect(element).toHaveAttribute('contract');
  });
});
