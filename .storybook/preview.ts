import { withThemeByClassName } from '@storybook/addon-themes';
import { Preview } from '@storybook/html';
// import { defineCustomElements } from '../loader';
import dyneTheme from './dyne-theme';

let defineCustomElements: () => void = () => {};

if (process.env.NODE_ENV !== 'development') {
  // Only import the loader in production builds
  defineCustomElements = require('../loader').defineCustomElements;
}

defineCustomElements();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    docs: { toc: true, themes: dyneTheme },
    layout: 'centered',
    viewport: {
      viewports: {
        iphone: { name: 'Small', styles: { width: '393px', height: '767px' } },
        large: { name: 'Large', styles: { width: '1024px', height: '1000px' } },
      },
    },
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#1E293B' },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
