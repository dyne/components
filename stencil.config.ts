import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import tailwind, {
  PluginOpts,
  setPluginConfigurationDefaults,
  tailwindHMR,
} from 'stencil-tailwind-plugin';
import tailwindConf from './tailwind.config.ts';

setPluginConfigurationDefaults({
  ...PluginOpts.DEFAULT,
  stripComments: true,
  minify: true,
  tailwindCssPath: './src/css/theme.css',
  tailwindConf,
});

export const config: Config = {
  namespace: 'dyne-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{ src: '**/*.html' }, { src: '**/*.css' }],
    },
    {
      type: 'docs-vscode',
      file: 'vscode-data.json',
    },
  ],
  testing: {
    browserHeadless: 'new',
    // Stencil Test Runner will no longer execute any 'e2e.ts` files
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec)|[//](e2e))\\.[jt]sx?$',
  },
  plugins: [sass(), tailwind(), tailwindHMR()],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
  globalStyle: 'src/css/theme.css',
  // globalScript: 'src/app.ts',
};
