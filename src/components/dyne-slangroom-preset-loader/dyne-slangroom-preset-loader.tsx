import { Component, Host, Prop, State, Element, Watch, h } from '@stencil/core';
import SlangroomPresets from './utils/slangroom-presets.json';
import { EditorId } from '../dyne-slangroom-editor/dyne-slangroom-editor';
import { Array as A, pipe, Effect } from 'effect';
import Fuse from 'fuse.js';

@Component({
  tag: 'dyne-slangroom-preset-loader',
  styleUrl: 'dyne-slangroom-preset-loader.scss',
  shadow: true,
})
export class DyneSlangroomPresetLoader {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) editorId: string;
  @Prop() loadLocalPresets: boolean = true;
  @Prop() oasEndpoint?: string;

  @State() presets: SlangroomPreset[] = [];
  @State() filteredPresets: SlangroomPreset[] = [];
  @State() searchText = '';

  get dialog() {
    return this.el.shadowRoot?.querySelector('dialog');
  }

  get editor() {
    return document.getElementById(this.editorId) as HTMLDyneSlangroomEditorElement;
  }

  async componentDidLoad() {
    if (this.loadLocalPresets) {
      this.presets = SlangroomPresets;
    }
    if (this.oasEndpoint) {
      const apiPresets = await this.fetchPresetsFromOas();
      this.addPresets(apiPresets);
    }
    await this.loadPresetsFromElements();
    lockScrollOnDialogOpen(this.dialog!);
  }

  // Preset selection

  private onPresetSelect(preset: SlangroomPreset) {
    this.loadPresetInEditor(preset);
    this.dialog?.close();
  }

  private async loadPresetInEditor(preset: SlangroomPreset) {
    await this.editor.setContent(EditorId.NAME, preset.name);
    await this.editor.setContent(EditorId.CONTRACT, preset.contract);
    await this.editor.setContent(EditorId.DATA, preset.data);
    await this.editor.setContent(EditorId.KEYS, preset.keys);
  }

  // Load presets from dyne-slangroom-preset

  private async loadPresetsFromElements() {
    const presets = await this.readPresetsFromElements();
    this.addPresets(presets);
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

  private async fetchPresetsFromOas(): Promise<SlangroomPreset[]> {
    if (!this.oasEndpoint) return [];

    try {
      const response = await fetch(this.oasEndpoint);
      if (!response.ok) {
        console.error('Failed to fetch presets:', response.statusText);
        return [];
      }
      const oas = await response.json();
      const oasPaths: OasPaths = oas.paths;
      const res: SlangroomPreset[] = [];
      for (const [contractPath, contractMethods] of Object.entries(oasPaths)) {
        if (contractPath.endsWith('/app') || contractPath.endsWith('/raw')) {
          continue;
        }
        const contractInfo = contractMethods?.post || contractMethods?.get;
        if (!contractInfo) continue;
        res.push({
          name: contractPath,
          contract: contractInfo.description,
          keys: contractInfo.keys,
          data: '',
          meta: {
            title: contractPath,
            highlight: ""
          },
          group: contractInfo.tags[0]
        });
      }
      return res;
    } catch (error) {
      console.error('Error fetching presets:', error);
      return [];
    }
  }

  @Watch('presets')
  updatePresetsSearch() {
    this.filteredPresets = this.presets;
  }

  // Search

  private updateSearchText(e: Event) {
    this.searchText = (e.target as any).value;
  }

  @Watch('searchText')
  filterPresets() {
    this.filteredPresets = filterPresetsByText(this.presets, this.searchText);
  }

  // Utils

  private setDialogEvents() {
    this.dialog?.addEventListener('close', () => unlockScroll());
    this.dialog?.addEventListener('cancel', () => unlockScroll());
    this.dialog?.addEventListener('cancel', () => unlockScroll());
  }

  //

  render() {
    return (
      <Host>
        <dyne-button size="small" emphasis="m" onClick={() => this.dialog?.showModal()}>
          Select preset
        </dyne-button>

        <dialog class="backdrop:bg-black backdrop:opacity-75 h-screen m-0 bg-white text-black">
          <div class="sticky top-0 bg-white">
            <div class="flex gap-4 justify-between items-center p-4 border-b ">
              <p>Select a Slangroom preset</p>
              <dyne-button size="small" emphasis="m" onClick={() => this.dialog?.close()}>
                X
              </dyne-button>
            </div>

            <div class="p-4 border-b">
              <input
                class="block border w-full p-2 rounded-md hover:bg-slate-100 focus:bg-transparent bg-transparent"
                name="search"
                value={this.searchText}
                placeholder="Search for a topic"
                onInput={e => this.updateSearchText(e)}
              ></input>
            </div>
          </div>

          <PresetsSelect
            presets={this.filteredPresets}
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

type OasPathMethod = {
  description: string;
  keys: string;
  tags: string[];
};

type OasPathValue = {
  get?: OasPathMethod;
  post?: OasPathMethod;
};

type OasPaths = Record<string, OasPathValue>;

function PresetsSelect(props: PresetsProps) {
  const { onPresetSelect = () => {}, presets = [] } = props;

  const groupedPresets = pipe(
    presets,
    A.groupBy(p => p.group),
  );

  return (
    <div class="p-4 space-y-6">
      {Object.entries(groupedPresets).map(([groupName, groupContent]) => (
        <div>
          <p class="uppercase text-xs font-semibold tracking-wide text-slate-500 mb-2">
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

//

function filterPresetsByText(presets: SlangroomPreset[], text: string): SlangroomPreset[] {
  if (!Boolean(text)) return presets;
  const fuse = new Fuse(presets, {
    keys: ['name', 'group', 'meta.title'],
    threshold: 0.4,
  });
  return fuse.search(text).map(result => result.item);
}

function lockScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.overflow = '';
}

function lockScrollOnDialogOpen(dialog: HTMLDialogElement) {
  const observer = new MutationObserver(mutationsList => {
    mutationsList
      .filter(mutation => mutation.attributeName === 'open')
      .forEach(() => {
        if (dialog.open) {
          lockScroll();
        } else {
          unlockScroll();
        }
      });
  });

  observer.observe(dialog, { attributes: true });
}
