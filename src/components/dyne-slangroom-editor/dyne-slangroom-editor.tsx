import { Component, Element, Method, State, h } from '@stencil/core';

// import { dracula } from 'thememirror';
import { defaultKeymap } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';

import {
  SlangroomError,
  SlangroomResult,
  SlangroomValue,
  executeSlangroomContract,
  loadSlangroom,
} from './utils/slangroom';

import Convert from 'ansi-to-html';
import hasAnsi from 'has-ansi';

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

//

@Component({
  tag: 'dyne-slangroom-editor',
  styleUrl: 'dyne-slangroom-editor.scss',
  shadow: true,
})
export class DyneSlangroomEditor {
  @Element() el: HTMLElement;

  @State() result: SlangroomResult | undefined = undefined;
  @State() isExecuting = false;

  @Method()
  async getEditorContent(): Promise<string> {
    // Todo get the whole data: keys, data, config, etc
    return '';
    // return this.editors[editorName].state.doc.toString();
  }

  @Method()
  async setEditorContent(): Promise<void> {
    // Todo implement
    // this.editors[editorName].dispatch({
    // changes: { from: 0, to: this.editors[editorName].state.doc.length, insert: content },
    // });
  }

  //

  async componentDidLoad() {
    await loadSlangroom();
  }

  private async executeContract() {
    this.result = undefined;
    this.isExecuting = true;

    const contract = await this.getEditor(EditorId.CONTRACT).getContent();
    const data = await this.getEditor(EditorId.DATA).getContent();
    const keys = await this.getEditor(EditorId.KEYS).getContent();

    this.result = await executeSlangroomContract({
      contract,
      data: parseJsonObjectWithFallback(data),
      keys: parseJsonObjectWithFallback(keys),
    });
    this.isExecuting = false;
  }

  private get error() {
    return this.result?.success === false ? this.result.error : undefined;
  }

  private get value() {
    return this.result?.success === true ? this.result.value : undefined;
  }

  //

  private get keyboardExtension(): Extension {
    return [
      keymap.of([...defaultKeymap, { key: 'Ctrl-Enter', run: this.executeContract.bind(this) }]),
    ];
  }

  get editors() {
    return this.el.shadowRoot?.querySelectorAll(`dyne-code-editor`) ?? [];
  }

  private getEditor(id: EditorId) {
    const editor = Array.from(this.editors).find(editor => editor.id == id);
    if (!editor) throw new Error('Editor not initialized in DOM');
    return editor;
  }

  //

  render() {
    return (
      <div>
        <div class="space-y-4">
          <dyne-code-editor
            id={EditorId.CONTRACT}
            config={{ doc: contractSample, extensions: this.keyboardExtension }}
          ></dyne-code-editor>
          <dyne-code-editor
            id={EditorId.DATA}
            config={{ doc: dataSample, extensions: [this.keyboardExtension, json()] }}
          ></dyne-code-editor>
          <dyne-code-editor
            id={EditorId.KEYS}
            config={{ extensions: [this.keyboardExtension, json()] }}
          ></dyne-code-editor>
        </div>

        <button onClick={() => this.executeContract()}>Execute contract</button>

        {this.isExecuting && <Spinner />}
        {this.value && <ValueRenderer value={this.value} />}
        {this.error && <ErrorRenderer error={this.error} />}
      </div>
    );
  }
}

// Types

export enum EditorId {
  CONTRACT = 'contract',
  DATA = 'data',
  KEYS = 'keys',
  HEAP = 'heap',
  RESULT = 'result',
}

// Utils

function parseJsonObjectWithFallback(string: string): Record<string, unknown> {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
}

// Partials

function ValueRenderer(props: { value: SlangroomValue }) {
  return (
    <dyne-code-editor
      id={EditorId.RESULT}
      config={{
        doc: JSON.stringify(props.value, null, 2),
        extensions: [json()],
      }}
    ></dyne-code-editor>
  );
}

function ErrorRenderer(props: { error: SlangroomError }) {
  const { error } = props;
  if (typeof error == 'string') {
    if (hasAnsi(error)) {
      const converter = new Convert();
      const errorHtml = converter.toHtml(error);
      const e = document.createElement('div');
      e.innerHTML = errorHtml;
      // @ts-ignore
      return e;
    } else {
      return (
        <div>
          <Title name="error" className="mb-1" />
          <p>{error}</p>
        </div>
      );
    }
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

function Spinner() {
  return <p>loading...</p>;
}

// function EditorContainer(props: {  class?: string }, children) {
//   return (
//     <div  class={props.class ?? ''}>
//       <Title name={name} className="mb-1" />
//       {children}
//     </div>
//   );
// }
