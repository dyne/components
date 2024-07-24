import { newSpecPage } from '@stencil/core/testing';
import { DyneSlangroomPreset } from '../dyne-slangroom-preset';

describe('dyne-slangroom-preset', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DyneSlangroomPreset],
      html: `<dyne-slangroom-preset></dyne-slangroom-preset>`,
    });
    expect(page.root).toEqualHtml(`
      <dyne-slangroom-preset>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </dyne-slangroom-preset>
    `);
  });
});
