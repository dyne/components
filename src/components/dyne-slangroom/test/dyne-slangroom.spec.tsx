import { newSpecPage } from '@stencil/core/testing';
import { DyneSlangroom } from '../dyne-slangroom';

describe('dyne-slangroom', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DyneSlangroom],
      html: `<dyne-slangroom></dyne-slangroom>`,
    });
    expect(page.root).toEqualHtml(`
      <dyne-slangroom>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </dyne-slangroom>
    `);
  });
});
