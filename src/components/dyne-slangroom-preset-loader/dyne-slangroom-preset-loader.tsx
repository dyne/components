import { Component, Host, Prop, State, Element, h } from '@stencil/core';
import SlangroomPresets from './utils/slangroom-presets.json';

@Component({
  tag: 'dyne-slangroom-preset-loader',
  styleUrl: 'dyne-slangroom-preset-loader.scss',
  shadow: true,
})
export class DyneSlangroomPresetLoader {
  @Element() el: HTMLElement;

  @Prop() editorId: string;

  get dialog() {
    return this.el.shadowRoot?.querySelector('dialog');
  }

  get editor() {
    return document.getElementById(this.editorId) as HTMLDyneSlangroomEditorElement;
  }

  private loadPresetInEditor(preset: SlangroomPreset) {
    this.editor.setAttribute('contract', preset.contract);
    this.editor.keys = preset.keys;
    this.editor.data = preset.data;
  }

  private onPresetSelect(preset: SlangroomPreset) {
    this.loadPresetInEditor(preset);
    this.dialog?.close();
  }

  render() {
    return (
      <Host>
        <dyne-button onClick={() => this.dialog?.showModal()}>Select preset</dyne-button>
        <dialog class="rounded-lg">
          <div class="flex gap-4 justify-between items-center p-4 border-b sticky top-0 bg-white">
            <p>Select a slangroom preset</p>
            <dyne-button size="small" emphasis="m" onClick={() => this.dialog?.close()}>
              X
            </dyne-button>
          </div>
          <Presets onPresetSelect={this.onPresetSelect.bind(this)}></Presets>
        </dialog>
      </Host>
    );
  }
}

type SlangroomPreset = (typeof SlangroomPresets)['helpers']['set'];

type PresetsProps = {
  onPresetSelect?: (preset: SlangroomPreset) => void;
};

function Presets(props: PresetsProps) {
  const { onPresetSelect = () => {} } = props;

  return (
    <div class="p-4 space-y-4">
      {Object.entries(SlangroomPresets).map(([groupName, groupContent]) => (
        <div>
          <p class="uppercase text-xs font-semibold tracking-wide text-slate-600 mb-2">
            {groupName}
          </p>
          <ul class="space-y-1">
            {Object.entries(groupContent).map(([presetName, presetContent]) => (
              <li>
                <button
                  class="capitalize p-2 w-full text-left rounded-md bg-slate-100 hover:bg-slate-300"
                  onClick={() => onPresetSelect(presetContent)}
                >
                  {presetContent.meta.title ?? presetName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
