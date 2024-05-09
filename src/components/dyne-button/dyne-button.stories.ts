import type { Components } from '@/src/components.js';
import { Meta, StoryObj } from '@storybook/html';
import { ColorArgTypes, EmphasisArgTypes, SizeArgTypes } from '../types.js';

const meta = {
  title: 'Design System/Atoms/Button',
  component: 'dyne-button',
  render: args => `<dyne-button color="${args.color}" size="${args.size}" emphasis="${args.emphasis}">${args.emphasis} / ${args.color} / ${args.size} </dyne-button>`,
  argTypes: {
    ...ColorArgTypes,
    ...SizeArgTypes,
    ...EmphasisArgTypes,
  },
  args: {
    emphasis: 'moderate',
    color: 'primary',
    size: 'medium',
  },
  parameters: {
    variants: {
      enable: true,
      include: ['size', 'color'],
    },
  },
} satisfies Meta<Components.DyneButton>;

export default meta;
type Story = StoryObj<Components.DyneButton>;

export const Defaults: Story = {
  args: {
    emphasis: 'moderate',
    color: 'primary',
    size: 'medium',
  },
};

export const HighEmphasis: Story = {
  args: {
    ...Defaults.args,
    emphasis: 'high',
  },
};

export const SlightEmphasis: Story = {
  args: {
    ...Defaults.args,
    emphasis: 'slight',
  },
};
