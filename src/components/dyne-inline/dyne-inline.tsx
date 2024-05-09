import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'dyne-inline',
  styleUrl: 'dyne-inline.scss',
  shadow: true,
})
export class DyneButton {
  @Prop({ reflect: true }) gap?: number = 4;
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
