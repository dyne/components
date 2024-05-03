import { Meta, StoryObj } from '@storybook/html';
import type { Components } from '../../components.js';
import { ColorArgTypes, EmphasisArgTypes, SizeArgTypes } from '../types.js';

const meta = {
  title: 'Design System/Atoms/Button',
  component: 'dyne-button',
  render: args => `<dyne-button color="${args.color}" size="${args.size}" emphasis="${args.emphasis}">Squezee me</dyne-button>`,
  argTypes: {
    ...ColorArgTypes,
    ...SizeArgTypes,
    ...EmphasisArgTypes,
  },
} satisfies Meta<Components.DyneButton>;

export default meta;
type Story = StoryObj<Components.DyneButton>;

export const Default: Story = {
  args: {
    color: 'primary',
    size: 'medium',
    emphasis: 'medium',
  },
};

export const LowEmphasis: Story = {
  args: {
    emphasis: 'low',
    color: 'primary',
    size: 'medium',
  },
};
