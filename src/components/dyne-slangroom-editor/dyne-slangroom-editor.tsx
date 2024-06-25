import { Component, Element, Method, State, h } from '@stencil/core';

import { defaultKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import '@slangroom/browser/build/slangroom.js';

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
  private editorView: EditorView;

  async componentDidLoad() {
    const editorContainer = this.el.shadowRoot.querySelector('.editor-container');
    if (editorContainer) {
      const startState = EditorState.create({
        doc: `Rule unknown ignore
Given I connect to 'did_url' and do get and output into 'did'
Given I have a 'string dictionary' named 'did'
Given I have a 'string' named 'foo'
Then print data`,
        extensions: [keymap.of([...defaultKeymap, { key: 'Ctrl-Enter', run: this.executeContract.bind(this) }])],
      });

      this.editorView = new EditorView({
        state: startState,
        parent: editorContainer,
      });

      try {
        await import('@slangroom/browser/build/slangroom.js');
      } catch (error) {
        console.error('Failed to load slangroom:', error);
      }
    }
  }

  @Method()
  async getEditorContent(): Promise<string> {
    return this.editorView.state.doc.toString();
  }

  @Method()
  async setEditorContent(content: string): Promise<void> {
    this.editorView.dispatch({
      changes: { from: 0, to: this.editorView.state.doc.length, insert: content },
    });
  }

  private async executeContract(): Promise<boolean> {
    const contract = await this.getEditorContent();
    try {
      console.log('Executing contract:', contract, 'with window.slangroom:', window['slangroom']);
      const result = await window['slangroom'].execute(contract, {
        data: {
          foo: 'bar',
          did_url: 'https://did.dyne.org/dids/did:dyne:sandbox.test:pEn78CGNEKvMR7DJQ1yvUVUpAHKzsBz45mQw3zD2js9',
        },
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
      <dyne-inline>
        <div>
          <div class="editor-container"></div>
          <dyne-button onClick={() => this.executeContract()}>Run Contract</dyne-button>
        </div>
        <div class="gap-10">
          <pre id="output" class="font-mono"></pre>
          <pre id="trace" class="font-mono border border-red-400"></pre>
          <pre id="heap" class="font-mono border border-red-400"></pre>
        </div>
      </dyne-inline>
    );
  }
}
