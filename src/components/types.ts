import { ArgTypes } from '@storybook/html';

const SizeOptions = 'small medium large'.split(' ');
export const SizeArgTypes: ArgTypes = {
  size: {
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

const ColorOptions = 'primary secondary tertiary'.split(' ');
export const ColorArgTypes: ArgTypes = {
  color: {
    options: ColorOptions,
    description: 'Componentsd attribute color',
    control: { type: 'radio' },
  },
};
export type Color = (typeof ColorOptions)[number];

const EmphasisOptions = 'slight moderate high'.split(' ');
export const EmphasisArgTypes: ArgTypes = {
  emphasis: {
    description: 'How much importance have the action of this component?',
    options: EmphasisOptions,
    control: { type: 'inline-radio' },
  },
};
export type Emphasis = (typeof SizeOptions)[number];
