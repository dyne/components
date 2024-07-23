import { newSpecPage } from '@stencil/core/testing';
import { DyneSlangroomPresetLoader } from '../dyne-slangroom-preset-loader';

describe('dyne-slangroom-preset-loader', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [DyneSlangroomPresetLoader],
      html: `<dyne-slangroom-preset-loader></dyne-slangroom-preset-loader>`,
    });
    expect(page.root).toEqualHtml(`
      <dyne-slangroom-preset-loader>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </dyne-slangroom-preset-loader>
    `);
  });
});
