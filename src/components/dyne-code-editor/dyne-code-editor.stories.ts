import type { Components } from '@/src/components.js';
import { Meta, StoryObj } from '@storybook/html';

const meta = {
  title: 'Design System/Atoms/Slangroom Editor',
  component: 'dyne-slangroom-editor',
  render: () => `<dyne-slangroom-editor></dyne-slangroom-editor>`,
} satisfies Meta<Components.DyneSlangroomEditor>;

export default meta;
type Story = StoryObj<Components.DyneSlangroomEditor>;

export const Defaults: Story = {
  args: {},
};
