import { StorybookConfig } from '@storybook/html-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/html-vite',
  async viteFinal(config, options) {
    config.assetsInclude = ['**/*.md'];
    return config;
  },
  docs: {
    autodocs: true,
  },
};
export default config;
