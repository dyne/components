import type { Components } from '@/src/components';
import { Meta, StoryObj } from '@storybook/html';

const meta = {
  title: 'Design System/Atoms/Inline',
  component: 'dyne-inline',
  render: args => `<dyne-inline gap="${args.gap}"><dyne-button>Click me</dyne-button><dyne-button>Trust me</dyne-button></dyne-inline>`,
  argTypes: {
    gap: {
      control: {
        type: 'number',
      },
      defaultValue: 4,
    },
  },
} satisfies Meta<Components.DyneInline>;

export default meta;

type Story = StoryObj<Components.DyneInline>;

export const Defaults: Story = {
  args: {
    gap: 4,
  },
};
