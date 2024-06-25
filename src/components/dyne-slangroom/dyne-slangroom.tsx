import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'dyne-slangroom',
  styleUrl: 'dyne-slangroom.css',
  shadow: true,
})
export class DyneSlangroom {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
