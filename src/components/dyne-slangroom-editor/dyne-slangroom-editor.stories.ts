import type { Components } from '@/src/components';
import { Meta, StoryObj } from '@storybook/html';

const meta = {
  title: 'Components/Slangroom Editor',
  component: 'dyne-slangroom-editor',
  render: () => `<dyne-slangroom-editor></dyne-slangroom-editor>`,
} satisfies Meta<Components.DyneSlangroomEditor>;

export default meta;
type Story = StoryObj<Components.DyneSlangroomEditor>;

export const Defaults: Story = {
  args: {},
};
