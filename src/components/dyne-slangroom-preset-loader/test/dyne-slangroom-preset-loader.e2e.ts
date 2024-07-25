import { newE2EPage } from '@stencil/core/testing';

describe('dyne-slangroom-preset-loader', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<dyne-slangroom-preset-loader></dyne-slangroom-preset-loader>');

    const element = await page.find('dyne-slangroom-preset-loader');
    expect(element).toHaveAttribute('editor-id');
  });
});
