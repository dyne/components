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

  @State() formData: Metadata;
  @State() slangroomEditor?: HTMLDyneSlangroomEditorElement | null;
  @State() name: string = '';
  @State() reloadPresets: boolean = false;

  @Method()
  async getContent(): Promise<NcrEditorContent | undefined> {
    const editorContent = await this.getSlangroomEditorInfo();
    return editorContent as NcrEditorContent;
  }

  @Method()
  async setContent(editor: EditorId, content: string): Promise<void> {
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
    if (JSON.stringify(this.formData) !== '{}') editorContent.metadata = JSON.stringify(this.formData);
    return editorContent;
  }

  async componentWillLoad() {
    this.formData = this.metadata !== '' ? JSON.parse(this.metadata) : defaultMetadata;
  }

  async componentDidLoad() {
    this.slangroomEditor = this.el.querySelector('#forkbombeu-ncr-dev');
    if (!this.slangroomEditor) {
      throw new Error('Slangroom editor not found!')
    }

    this.slangroomEditor.addEventListener('nameChanged', async (event: CustomEvent) => {
      this.name = event.detail;
      const temp = await this.slangroomEditor!.getContent();
      this.formData = JSON.parse(temp!.metadata);
      this.reloadPresets = false;
    });
  }

  //

  private async saveContract() {
    try {
      const editorContent = await this.getContent();
      if (!editorContent || editorContent.name == '') {
        throw new Error('Empty name')
      }
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
      // TODO: set slangroomEditor result to error
      console.error(`Failed to save contract: ${e}`)
    }
    // reload preset list
    this.reloadPresets = true;
  }

  private handleInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.name = value;
  }

  // metadata

  private handleMetadataChange(key: keyof Metadata, value: any) {
    this.formData = { ...this.formData, [key]: value };
  }

  renderBooleanField(key: keyof BooleanMetadata) {
    return (
      <div>
        <input
          type="checkbox"
          checked={!!this.formData[key]}
          onInput={(event: Event) =>
            this.handleMetadataChange(key, (event.target as HTMLInputElement).checked)
          }
        />
        <label class="ml-2 text-sm font-medium text-slate-700">{key}</label>
      </div>
    );
  }

  renderInputField(key: keyof StringMetadata) {
    return (
      <div class="flex items-center">
        <label class="w-40 text-sm font-medium text-slate-700">{key}: </label>
        <input
          type="text"
          value={this.formData[key] || ''}
          onInput={(event: Event) =>
            this.handleMetadataChange(key, (event.target as HTMLInputElement).value)
          }
        />
      </div>
    );
  }

  renderArrayField(key: keyof ArrayMetadata) {
    const values = this.formData[key] as string[] || [];
    return (
      <div>
        <label>{key}: </label>
        {values.map((value, index) => (
          <div>
            <input
              type="text"
              value={value}
              onInput={(event: Event) =>
                this.handleMetadataChange(key, [
                  ...values.slice(0, index),
                  (event.target as HTMLInputElement).value,
                  ...values.slice(index + 1),
                ])
              }
            />
            <button
              type="button"
              onClick={() =>
                this.handleMetadataChange(key, values.filter((_, i) => i !== index))
              }
            >
              🚮
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            this.handleMetadataChange(key, [...values, ''])
          }
        >
          🆕
        </button>
      </div>
    );
  }

  renderObjectField(key: keyof ObjectMetadata) {
    return (
      <div>
        <label>{key}
      </label>
        <textarea
          value={JSON.stringify(this.formData[key] || {}, null, 2)}
          onInput={(event: Event) =>
            this.handleMetadataChange(
              key,
              JSON.parse((event.target as HTMLTextAreaElement).value || '{}')
            )
          }
        ></textarea>
      </div>
    );
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
              reload-presets={this.reloadPresets}
            >
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

          <div class="bg-slate-100 shadow-md rounded-lg p-6 space-y-6">
            <h2 class="text-xl font-semibold text-slate-900">Metadata Editor</h2>
            <form class="space-y-6">
              <div class="form-section">
                <h3 class="text-lg font-bold text-slate-900">Enabled Metadata</h3>
                {this.renderBooleanField('hidden')}
                {this.renderBooleanField('hideFromOpenapi')}
                {this.renderBooleanField('disableGet')}
                {this.renderBooleanField('disablePost')}
                {this.renderBooleanField('httpHeaders')}
              </div>

              <div class="form-section">
                <h3 class="text-lg font-bold text-slate-900">REST Metadata</h3>
                {this.renderInputField('contentType')}
                {this.renderInputField('successCode')}
                {this.renderInputField('successContentType')}
                {this.renderInputField('successDescription')}
                {this.renderInputField('errorCode')}
                {this.renderInputField('errorContentType')}
                {this.renderInputField('errorDescription')}
                {this.renderInputField('precondition')}
              </div>

              <div class="form-section">
                <h3 class="text-lg font-bold text-slate-900">Tags</h3>
                {this.renderArrayField('tags')}
              </div>

              <div class="form-section">
                <h3 class="text-lg font-bold text-slate-900">Examples</h3>
                {this.renderObjectField('examples')}
              </div>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}

// Types

export type NcrEditorContent = SlangroomEditorContent & {
  metadata: string;
  schema: string;
}

export type BooleanMetadata = {
  hidden: boolean;
  hideFromOpenapi: boolean;
  disableGet: boolean;
  disablePost: boolean;
  httpHeaders: boolean;
}
export type StringMetadata = {
  contentType: string;
  successCode: string;
  successContentType: string;
  successDescription: string;
  errorCode: string;
  errorDescription: string;
  errorContentType: string;
  precondition: string;
}
export type ArrayMetadata = {
  tags: Array<string>;
}
export type ObjectMetadata = {
  examples: Record<string, any>;
}
export type Metadata = BooleanMetadata & StringMetadata & ArrayMetadata & ObjectMetadata;


// default metadata

const defaultMetadata: Metadata = {
  httpHeaders: false,
  hidden: false,
  hideFromOpenapi: false,
  disableGet: false,
  disablePost: false,
  contentType: 'application/json',
  successCode: '200',
  successContentType: 'application/json',
  successDescription: 'The zencode execution output, splitted by newline',
  errorCode: '500',
  errorContentType: 'plain/text',
  errorDescription: 'Zenroom execution error',
  precondition: '',
  tags: ['📑 Zencode APIs'],
  examples: {}
}
