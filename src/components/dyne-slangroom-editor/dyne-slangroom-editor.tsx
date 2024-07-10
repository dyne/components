import { Component, Element, Method, State, h, Watch } from '@stencil/core';

import { basicSetup } from 'codemirror';
// import { dracula } from 'thememirror';
import { defaultKeymap } from '@codemirror/commands';
import { EditorState, EditorStateConfig, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import '@slangroom/browser/build/slangroom.js';
import { json } from '@codemirror/lang-json';

import { SlangroomResult, executeSlangroomContract, loadSlangroom, parseSlangroomError } from './utils/slangroom';

//

const contractSample = `Rule unknown ignore
Given I connect to 'did_url' and do get and output into 'did'
Given I have a 'string dictionary' named 'did'
Given I have a 'string' named 'foo'
Then print data`;

const dataSample = `{
  "foo": "bar",
  "did_url": "https://did.dyne.org/dids/did:dyne:sandbox.test:pEn78CGNEKvMR7DJQ1yvUVUpAHKzsBz45mQw3zD2js9"
}`;

const HIDDEN_CLASS = 'hidden';

//

@Component({
  tag: 'dyne-slangroom-editor',
  styleUrl: 'dyne-slangroom-editor.scss',
  shadow: true,
})
export class DyneSlangroomEditor {
  @Element() el: HTMLElement;

  @State() contractResult: SlangroomResult | undefined = undefined;
  @State() isRunning = false;

  private editors: {
    contract: EditorView;
    data: EditorView;
    keys: EditorView;
    output: EditorView;
    // error: EditorView;
  };

  //

  async componentDidLoad() {
    this.createEditors();
    await loadSlangroom();
  }

  @Method()
  async getEditorContent(editorName: EditorName): Promise<string> {
    return this.editors[editorName].state.doc.toString();
  }

  @Method()
  async setEditorContent(editorName: EditorName, content: string): Promise<void> {
    this.editors[editorName].dispatch({
      changes: { from: 0, to: this.editors[editorName].state.doc.length, insert: content },
    });
  }

  private createEditors() {
    const extensions: Extension = [keymap.of([...defaultKeymap, { key: 'Ctrl-Enter', run: this.executeSlangroomContract.bind(this) }])];

    this.editors = {
      contract: this.initalizeEditor('contract', {
        doc: contractSample,
        extensions,
      }),
      data: this.initalizeEditor('data', {
        doc: dataSample,
        extensions: [extensions, json()],
      }),
      keys: this.initalizeEditor('keys', {
        doc: '{}',
        extensions: [extensions, json()],
      }),
      output: this.initalizeEditor('output', { extensions: [json()] }),
      // error: this.initalizeEditor('error', { extensions: [json()] }),
    };
  }

  private initalizeEditor(editorName: EditorName, config: EditorStateConfig = {}) {
    const container = this.getEditorContainer(editorName);
    return createEditor(container, config);
  }

  private async executeSlangroomContract(): Promise<boolean> {
    this.contractResult = undefined;
    this.isRunning = true;

    const contract = await this.getEditorContent('contract');
    const data = await this.getEditorContent('data');
    const keys = await this.getEditorContent('keys');

    this.contractResult = await executeSlangroomContract({
      contract,
      data: parseJsonObjectWithFallback(data),
      keys: parseJsonObjectWithFallback(keys),
    });

    this.isRunning = false;
    return true; // Prevent default behavior
  }

  private getErrorMessage() {
    if (this.contractResult?.success === false) {
      return this.contractResult.error;
    }
  }

  //

  getEditorContainer(editorName: EditorName) {
    const editorContainer = this.el.shadowRoot?.getElementById(editorName);
    if (!editorContainer) throw new Error('Container not initialized');
    return editorContainer;
  }

  //

  @Watch('contractResult')
  showResult() {
    if (this.contractResult === undefined) {
      // this.hideEditor('error');
      this.hideEditor('output');
    } else if (this.contractResult.success === true) {
      this.showEditor('output');
      this.setEditorContent('output', JSON.stringify(this.contractResult.value, null, 2));
    } else if (this.contractResult.success === false) {
      // this.showEditor('error');
      console.log(this.contractResult.error);
      // this.setEditorContent('error', this.error);
    }
  }

  hideEditor(name: EditorName) {
    this.getEditorContainer(name).classList.add(HIDDEN_CLASS);
  }

  showEditor(name: EditorName) {
    this.getEditorContainer(name).classList.remove(HIDDEN_CLASS);
  }

  //

  render() {
    return (
      <div>
        <div class="space-y-4">
          <EditorContainer name="contract" />
          <EditorContainer name="data" />
          <EditorContainer name="keys" />
        </div>

        <dyne-button onClick={() => this.executeSlangroomContract()}>Run Contract</dyne-button>

        {this.isRunning && <p>loading...</p>}

        {Boolean(this.getErrorMessage()) && <ErrorRenderer error={this.getErrorMessage()!} />}

        <div class="gap-10">
          <EditorContainer name="output" className="hidden" />
          {/* <EditorContainer name="error" className="hidden" /> */}
        </div>
      </div>
    );
  }
}

// -- Utils -- //

function createEditor(parent: Element, config: EditorStateConfig = {}) {
  const state = EditorState.create({ ...config, extensions: [config.extensions ?? [], basicSetup] });
  return new EditorView({
    state,
    parent,
  });
}

//

function ErrorRenderer(props: { error: string }) {
  const error = parseSlangroomError(props.error);
  if (typeof error == 'string') {
    return (
      <div>
        <Title name="error" className="mb-1" />
        <p>{error}</p>
      </div>
    );
  } else {
    return (
      <div>
        <Title name="logs" className="mb-1" />
        <pre>{error.logs}</pre>
        <Title name="trace" className="mb-1" />
        <pre>{error.trace}</pre>
        <Title name="heap" className="mb-1" />
        <pre>{error.heap}</pre>
      </div>
    );
  }
}

function Title(props: { name: string; className: string }) {
  return <h4 class={`capitalize font-medium text-lg ${props.className}`}>{props.name}</h4>;
}

function EditorContainer(props: { name: EditorName; className?: string }) {
  const { name, className = '' } = props;
  return (
    <div id={name} class={className}>
      <Title name={name} className="mb-1" />
    </div>
  );
}

//

function parseJsonObjectWithFallback(string: string): Record<string, unknown> {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
}

export type EditorName = keyof DyneSlangroomEditor['editors'];

//

// const parse = (token, text) => {
//   const line = text.split(token)[1];
//   const value = line.split('"')[0];

//   return highlight(atob(value.trim()));
// };
