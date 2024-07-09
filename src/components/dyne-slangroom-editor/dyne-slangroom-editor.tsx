import { Component, Element, Method, State, h } from '@stencil/core';

import { basicSetup } from 'codemirror';
// import { dracula } from 'thememirror';
import { defaultKeymap } from '@codemirror/commands';
import { EditorState, EditorStateConfig, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import '@slangroom/browser/build/slangroom.js';
import { json } from '@codemirror/lang-json';

//

const SCRIPT_EDITOR_ID = 'script-editor';
const DATA_EDITOR_ID = 'data-editor';
const KEYS_EDITOR_ID = 'keys-editor';

//

function highlight(text) {
  const json = JSON.stringify(JSON.parse(text), null, 3).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

const parse = (token, text) => {
  const line = text.split(token)[1];
  const value = line.split('"')[0];

  return highlight(atob(value.trim()));
};

function trace(t) {
  return '<h3>Trace</h3>' + parse('J64 TRACE:', t);
}

function heap(t) {
  return '<h3>Heap</h3>' + parse('J64 HEAP:', t);
}

@Component({
  tag: 'dyne-slangroom-editor',
  styleUrl: 'dyne-slangroom-editor.scss',
  shadow: true,
})
export class DyneSlangroomEditor {
  @Element() el: HTMLElement;
  @State() output: string;
  @State() trace: string;
  @State() heap: string;

  private editors: {
    script: EditorView;
    data: EditorView;
    keys: EditorView;
  };

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
    const extensions: Extension = [keymap.of([...defaultKeymap, { key: 'Ctrl-Enter', run: this.executeContract.bind(this) }])];

    const contractSample = `Rule unknown ignore
Given I connect to 'did_url' and do get and output into 'did'
Given I have a 'string dictionary' named 'did'
Given I have a 'string' named 'foo'
Then print data`;

    const scriptEditorContainer = this.el.shadowRoot.querySelector(`.${SCRIPT_EDITOR_ID}`);
    const dataEditorContainer = this.el.shadowRoot.querySelector(`.${DATA_EDITOR_ID}`);
    const keysEditorContainer = this.el.shadowRoot.querySelector(`.${KEYS_EDITOR_ID}`);
    if (scriptEditorContainer && dataEditorContainer && keysEditorContainer) {
      this.editors = {
        script: createEditor(scriptEditorContainer, {
          doc: contractSample,
          extensions,
        }),
        data: createEditor(dataEditorContainer, {
          doc: 'asdsadw',
          extensions: [extensions, json()],
        }),
        keys: createEditor(keysEditorContainer, {
          doc: 'ascxa',
          extensions: [extensions, json()],
        }),
      };
    }
  }

  private async executeContract(): Promise<boolean> {
    const contract = await this.getEditorContent('script');
    const data = await this.getEditorContent('data');
    const keys = await this.getEditorContent('keys');
    try {
      console.log('Executing contract:', contract, 'with window.slangroom:', window['slangroom']);
      const result = await window['slangroom'].execute(contract, {
        data: parseJsonObjectWithFallback(data),
        keys: parseJsonObjectWithFallback(keys),
      });
      this.output = JSON.stringify(result.result, null, 2);
    } catch (error) {
      console.log(error);
      this.trace = error.message;
      this.heap = error.message;
    }
    this.updateOutput();
    return true; // Prevent default behavior
  }

  private updateOutput() {
    const outputDiv = this.el.shadowRoot.querySelector('#output');
    const traceDiv = this.el.shadowRoot.querySelector('#trace');
    const heapDiv = this.el.shadowRoot.querySelector('#heap');
    if (this.output) outputDiv.innerHTML = highlight(this.output);
    if (this.trace && this.heap) {
      traceDiv.innerHTML = trace(this.trace);
      heapDiv.innerHTML = heap(this.heap);
    }
  }

  render() {
    return (
      <div>
        <div>
          <div class={SCRIPT_EDITOR_ID}></div>
        </div>
        <div>
          <div class={DATA_EDITOR_ID}></div>
        </div>
        <div>
          <div class={KEYS_EDITOR_ID}></div>
        </div>
        <dyne-button onClick={() => this.executeContract()}>Run Contract</dyne-button>
        <div class="gap-10">
          <pre id="output" class="font-mono"></pre>
          <pre id="trace" class="font-mono border border-red-400"></pre>
          <pre id="heap" class="font-mono border border-red-400"></pre>
        </div>
      </div>
    );
  }
}

// -- Utils -- //

function createEditor(parent: Element, config: EditorStateConfig = {}) {
  const state = EditorState.create({ ...config, extensions: [basicSetup, config.extensions ?? []] });
  return new EditorView({
    state,
    parent,
  });
}

async function loadSlangroom() {
  try {
    await import('@slangroom/browser/build/slangroom.js');
  } catch (error) {
    console.error('Failed to load slangroom:', error);
  }
}

function parseJsonObjectWithFallback(string: string): Record<string, unknown> {
  try {
    return JSON.parse(string);
  } catch {
    return {};
  }
}

export type EditorName = keyof DyneSlangroomEditor['editors'];
