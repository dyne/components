import type { Components } from '@/src/components';
import { Meta, StoryObj } from '@storybook/html';

const meta = {
  title: 'Components/Code Editor',
  component: 'dyne-code-editor',
  render: () => `<dyne-code-editor></dyne-code-editor>`,
} satisfies Meta<Components.DyneCodeEditor>;

export default meta;
type Story = StoryObj<Components.DyneCodeEditor>;

export const Defaults: Story = {
  args: {},
};
