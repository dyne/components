import { Component, Host, Prop, State, Element, h } from '@stencil/core';
import s from './utils/slangroom-presets.json';

@Component({
  tag: 'dyne-slangroom-preset-loader',
  styleUrl: 'dyne-slangroom-preset-loader.scss',
  shadow: true,
})
export class DyneSlangroomPresetLoader {
  @Element() el: HTMLDivElement;

  @Prop() editorId: string;

  private getDialog() {
    const x = this.el.shadowRoot?.querySelector('dialog');
    console.log(x);
    return x;
  }

  render() {
    return (
      <div>
        <dyne-button onClick={this.getDialog}>Select preset</dyne-button>
        <dialog>ao</dialog>
        <pre class="text-white">{JSON.stringify(s, null, 2)}</pre>
        <slot></slot>
      </div>
    );
  }
}
