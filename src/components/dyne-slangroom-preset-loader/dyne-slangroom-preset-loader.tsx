import { Component, Host, Prop, State, Element, h } from '@stencil/core';

@Component({
  tag: 'dyne-slangroom-preset-loader',
  styleUrl: 'dyne-slangroom-preset-loader.scss',
  shadow: true,
})
export class DyneSlangroomPresetLoader {
  @Element() el: HTMLElement;

  @Prop() editorId: string;

  render() {
    return (
      <Host>
        ao
        <slot></slot>
      </Host>
    );
  }
}
