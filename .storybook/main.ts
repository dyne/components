import { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/home/home.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@saucelabs/storybook-variants',
  ],
  framework: '@storybook/html-vite',
  staticDirs: ['../dist'],
  async viteFinal(config, options) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      assetsInclude: ['**/*.md'],
    });
  },
  docs: {
    autodocs: true,
  },
};

export default config;
