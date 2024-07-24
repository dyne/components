import { Component, Host, Prop, Method, h } from '@stencil/core';
import { SlangroomPreset } from '../dyne-slangroom-preset-loader/dyne-slangroom-preset-loader';

@Component({
  tag: 'dyne-slangroom-preset',
  styleUrl: 'dyne-slangroom-preset.scss',
  shadow: true,
})
export class DyneSlangroomPreset {
  @Prop({ reflect: true }) contract = '';
  @Prop({ reflect: true }) data = '';
  @Prop({ reflect: true }) keys = '';
  @Prop({ reflect: true }) name = '';
  @Prop({ reflect: true }) description = '';
  @Prop({ reflect: true }) group = '';

  @Method()
  async getPreset(): Promise<SlangroomPreset> {
    return {
      contract: this.contract,
      data: this.data,
      keys: this.keys,
      name: this.name,
      group: this.group,
      meta: { title: this.name, highlight: '1' },
    };
  }

  render() {
    return <Host></Host>;
  }
}
