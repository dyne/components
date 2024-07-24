import { Component, Host, Prop, State, Element, Watch, h } from '@stencil/core';
import SlangroomPresets from './utils/slangroom-presets.json';
import { EditorId } from '../dyne-slangroom-editor/dyne-slangroom-editor';
import { Array as A, pipe, Effect } from 'effect';

@Component({
  tag: 'dyne-slangroom-preset-loader',
  styleUrl: 'dyne-slangroom-preset-loader.scss',
  shadow: true,
})
export class DyneSlangroomPresetLoader {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) editorId: string;

  @State() presets: SlangroomPreset[] = SlangroomPresets;
  @State() filteredPresets: SlangroomPreset[] = this.presets;

  @Watch('presets')
  updatePresetsSearch() {
    this.filteredPresets = this.presets;
  }

  get dialog() {
    return this.el.shadowRoot?.querySelector('dialog');
  }

  get editor() {
    return document.getElementById(this.editorId) as HTMLDyneSlangroomEditorElement;
  }

  private async loadPresetInEditor(preset: SlangroomPreset) {
    await this.editor.setContent(EditorId.CONTRACT, preset.contract);
    await this.editor.setContent(EditorId.DATA, preset.data);
    await this.editor.setContent(EditorId.KEYS, preset.keys);
  }

  private onPresetSelect(preset: SlangroomPreset) {
    this.loadPresetInEditor(preset);
    this.dialog?.close();
  }

  private readPresetsFromElements() {
    return pipe(
      Effect.succeed(this.el.querySelectorAll('dyne-slangroom-preset')),
      Effect.map(presetElementNodeList => Array.from(presetElementNodeList)),
      Effect.flatMap(presetElementArray =>
        pipe(
          presetElementArray,
          A.map(presetElement => presetElement.getPreset()),
          A.map(presetPromise => Effect.promise(() => presetPromise)),
          Effect.all,
        ),
      ),
      Effect.runPromise,
    );
  }

  private addPresets(presets: SlangroomPreset[]) {
    this.presets = [...this.presets, ...presets];
  }

  async componentDidLoad() {
    pipe(await this.readPresetsFromElements(), presets => this.addPresets(presets));
  }

  render() {
    return (
      <Host>
        <dyne-button size="small" emphasis="m" onClick={() => this.dialog?.showModal()}>
          Select preset
        </dyne-button>
        <dialog class="rounded-lg">
          <div class="flex gap-4 justify-between items-center p-4 border-b sticky top-0 bg-white">
            <p>Select a slangroom preset</p>
            <dyne-button size="small" emphasis="m" onClick={() => this.dialog?.close()}>
              X
            </dyne-button>
          </div>
          <PresetsSelect
            presets={this.presets}
            onPresetSelect={this.onPresetSelect.bind(this)}
          ></PresetsSelect>
        </dialog>
      </Host>
    );
  }
}

export type SlangroomPreset = (typeof SlangroomPresets)[number];

type PresetsProps = {
  onPresetSelect?: (preset: SlangroomPreset) => void;
  presets?: SlangroomPreset[];
};

function PresetsSelect(props: PresetsProps) {
  const { onPresetSelect = () => {}, presets = [] } = props;

  const groupedPresets = pipe(
    presets,
    A.groupBy(p => p.group),
  );

  return (
    <div class="p-4 space-y-4">
      {Object.entries(groupedPresets).map(([groupName, groupContent]) => (
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
