import { create } from '@storybook/theming';

export default create({
  base: 'light',
  brandTitle: 'Dyne Components',
  brandUrl: '/',
  brandImage: 'https://dyne.org/images/logos/black-Logotype.png',
  brandTarget: '_self',

  fontBase: '"Syne Variable", sans-serif',
  fontCode: 'monospace',

  //
  colorPrimary: 'rgb(46,41,121)',
  colorSecondary: 'rgb(25,130,121)',

  // UI
  appBg: 'rgb(228,224,255)',
  appPreviewBg: 'rgb(252,248,255)',
  appContentBg: '#dcd9e0',
  appBorderColor: 'transparent',
  appBorderRadius: 10,

  // Text colors
  textColor: '#10162F',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#9E9E9E',
  barSelectedColor: '#585C6D',
  barHoverColor: '#585C6D',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#10162F',
  inputTextColor: '#10162F',
  inputBorderRadius: 2,
});
