import { Component, Host, Prop, h } from '@stencil/core';
import { Color, Emphasis, Size } from '../types';

import '@material/web/button/elevated-button';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/text-button';

@Component({
  tag: 'dyne-button',
  styleUrl: 'dyne-button.scss',
  shadow: true,
})
export class DyneButton {
  /** button color could be: 'primary', 'secondary' or 'tertiary' or even 'neutral' */
  @Prop({ reflect: true }) color?: Color = 'primary';
  /** button sizes are s, m, l */
  @Prop({ reflect: true }) size?: Size = 'medium';
  /** button emphasis could be: 'low', 'medium', 'high' */
  @Prop({ reflect: true }) emphasis?: Emphasis = 'medium';

  render() {
    let ButtonComponent;
    switch (this.emphasis) {
      case 'low':
        ButtonComponent = 'md-text-button';
        break;
      case 'medium':
        ButtonComponent = 'md-outlined-button';
        break;
      case 'high':
        ButtonComponent = 'md-filled-button';
        break;
      default:
        ButtonComponent = 'md-elevated-button';
    }

    return (
      <Host>
        <ButtonComponent>
          <slot></slot>
        </ButtonComponent>
      </Host>
    );
  }
}
