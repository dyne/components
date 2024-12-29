import { Component, Element, State, Method, Prop, Host, h } from '@stencil/core';
import { EditorId, type SlangroomEditorContent } from '../dyne-slangroom-editor/dyne-slangroom-editor';

@Component({
  tag: 'forkbombeu-ncr-editor',
  styleUrl: 'forkbombeu-ncr-editor.scss',
  shadow: false,
})

export class ForkbombeuNcrEditor {
  @Element() el: HTMLElement;

  @Prop() contract = '';
  @Prop() data = '';
  @Prop() keys = '';
  @Prop() metadata = '';
  @Prop() schema = '';

  @Prop() saveContractUrl: string;
  @Prop() oasEndpoint: string;

  @State() slangroomEditor?: HTMLDyneSlangroomEditorElement | null;
  @State() name: string = '';

  private mutationObserver: MutationObserver;

  @Method()
  async getContent(): Promise<NcrEditorContent | undefined> {
    const editorContent = await this.getSlangroomEditorInfo();
    if (!editorContent) return;
    editorContent['metadata'] = this.metadata;
    editorContent['schema'] = this.schema;
    return editorContent as NcrEditorContent;
  }

  @Method()
  async setContent(editor: EditorId | NcrExtensions, content: string): Promise<void> {
    if (editor in NcrExtensions) {
      this[editor] = content;
      return;
    }
    await this.slangroomEditor?.setContent(editor as EditorId, content);
  }

  //

  private async getSlangroomEditorInfo() {
    const editorContent = await this.slangroomEditor?.getContent();
    if (!editorContent) {
      console.error('Error, no slangroom editor found');
      return;
    }
    if (this.name !== '') editorContent.name = this.name;
    return editorContent;
  }

  async componentDidLoad() {
    this.slangroomEditor = this.el.querySelector('#forkbombeu-ncr-dev');
    if (!this.slangroomEditor) {
      throw new Error('Slangroom editor not found!')
    }

    this.slangroomEditor.addEventListener('nameChanged', (event: CustomEvent) => {
      this.name = event.detail;
    });
  }

  //

  private async saveContract() {
    try {
      const editorContent = await this.getContent();
      console.log(editorContent);
      const response = await fetch(this.saveContractUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editorContent)
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
    } catch(e) {
      console.error(`Failed to save contract: ${e}`)
    }
  }

  private async handleInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    await this.slangroomEditor?.setContent(EditorId.NAME, value);
  }

  render() {
    return (
      <Host>
        <div class="space-y-4">
          <dyne-slangroom-editor id="forkbombeu-ncr-dev" ref={el => this.slangroomEditor = el}>
            <dyne-slangroom-preset-loader
              slot="topbar-right"
              editor-id="forkbombeu-ncr-dev"
              load-local-presets="false"
              oas-endpoint={this.oasEndpoint}
            >
              <dyne-slangroom-preset
                group="helpers"
                name="Preset Element Test"
                contract="Test"
                data="Test"
              ></dyne-slangroom-preset>
            </dyne-slangroom-preset-loader>
            <dyne-button slot="topbar-right" size="small" onClick={() => this.saveContract()}>
              Save contract
            </dyne-button>
            <input
              id="name-input"
              slot="topbar"
              type="text"
              value={this.name}
              class="w-full border rounded px-4 py-2 text-sm text-center"
              onInput={this.handleInputChange.bind(this)}
            />
          </dyne-slangroom-editor>
        </div>
      </Host>
    );
  }
}

// Types

export enum NcrExtensions {
  METADATA = 'metadata',
  SCHEMA = 'schema'
}

export type NcrEditorContent = SlangroomEditorContent & {
  metadata: string;
  schema: string;
}
