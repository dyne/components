import { Preview } from '@storybook/html';
import { defineCustomElements } from '../loader';
import dyneTheme from './dyne-theme';

defineCustomElements();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    docs: { toc: true, themes: dyneTheme },
  },
};

export default preview;
