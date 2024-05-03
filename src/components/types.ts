import { ArgTypes } from '@storybook/html';

const SizeOptions = 'small medium large'.split(' ');
export const SizeArgTypes: ArgTypes = {
  size: {
    defaultValue: 'medium',
    options: SizeOptions,
    control: { type: 'inline-radio' },
  },
};
export type Size = (typeof SizeOptions)[number];

const ShapeOptions = 'round square'.split(' ');
export const ShapeArgTypes = {
  options: ShapeOptions,
  control: { type: 'inline-radio' },
};
export type Shape = (typeof ShapeOptions)[number];

const ColorOptions = 'primary secondary tertiary background'.split(' ');
export const ColorArgTypes: ArgTypes = {
  color: {
    options: ColorOptions,
    description: 'Componentsd attribute color',
    defaultValue: 'primary',
    default: 'primary',
    control: { type: 'radio' },
  },
};
export type Color = (typeof ColorOptions)[number];

const EmphasisOptions = 'low medium high'.split(' ');
export const EmphasisArgTypes: ArgTypes = {
  emphasis: {
    defaultValue: 'medium',
    options: EmphasisOptions,
    control: { type: 'inline-radio' },
  },
};
export type Emphasis = (typeof SizeOptions)[number];
