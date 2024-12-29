import { newE2EPage } from '@stencil/core/testing';

describe('forkbombeu-ncr-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<forkbombeu-ncr-editor></forkbombeu-ncr-editor>');

    const element = await page.find('forkbombeu-ncr-editor');
    expect(element).toHaveClass('hydrated');
  });
});
