import { Component, Element, Method, State, h, Watch } from '@stencil/core';

import { basicSetup } from 'codemirror';
// import { dracula } from 'thememirror';
import { defaultKeymap } from '@codemirror/commands';
import { EditorState, EditorStateConfig, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import '@slangroom/browser/build/slangroom.js';
import { json } from '@codemirror/lang-json';

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

  @State() contractResult: ExecuteContractResult | undefined = undefined;
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

    this.contractResult = await executeContract({
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

async function loadSlangroom() {
  try {
    await import('@slangroom/browser/build/slangroom.js');
  } catch (error) {
    console.error('Failed to load slangroom:', error);
  }
}

type ExecuteContractProps = {
  contract: string;
  data: Record<string, unknown>;
  keys: Record<string, unknown>;
};

type ExecuteContractResult = { success: true; value: Record<string, unknown> } | { success: false; error: string };

async function executeContract(props: ExecuteContractProps): Promise<ExecuteContractResult> {
  const { contract, data = {}, keys = {} } = props;
  try {
    console.log('Executing contract:', contract, 'with window.slangroom:', window['slangroom']);
    const result = await window['slangroom'].execute(contract, {
      data,
      keys,
    });
    return {
      success: true,
      value: result.result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function parseErrorString(errorMessage: string) {
  try {
    const parsed = JSON.parse(errorMessage);
    if (isArrayError(parsed)) return parsed;
    else throw new Error('Unknown error format');
  } catch (e) {
    console.log(e);
  }
  return errorMessage;
}

function isArrayError(data: unknown): data is Array<string> {
  return Array.isArray(data) && data.every(i => typeof i == 'string');
}

function processArrayError(arrayError: string[]): ParsedArrayError {
  const HEAP_TOKEN = 'J64 HEAP:';
  const TRACE_TOKEN = 'J64 TRACE:';

  function findBase64(token: string) {
    return (
      arrayError
        .find(s => s.startsWith(token))
        ?.split(token)
        .at(-1)
        ?.trim() ?? ''
    );
  }

  const heap = parseHeap(atob(findBase64(HEAP_TOKEN)));
  const trace = parseTrace(atob(findBase64(TRACE_TOKEN)));

  const logs = arrayError.filter(s => !s.startsWith(HEAP_TOKEN) && !s.startsWith(TRACE_TOKEN)).join('\n');

  return {
    logs,
    heap,
    trace,
  };
}

function parseTrace(traceString: string) {
  const parsedTrace = JSON.parse(traceString) as Array<string>;
  return parsedTrace.join('\n');
}

function parseHeap(heapString: string) {
  const parsedHeap = JSON.parse(heapString) as Record<string, unknown>;
  return JSON.stringify(parsedHeap, null, 2);
}

type ParsedArrayError = {
  logs: string;
  heap: string;
  trace: string;
};

function parseError(errorMessage: string) {
  const parsed = parseErrorString(errorMessage);
  if (Array.isArray(parsed)) return processArrayError(parsed);
  else return parsed;
}

//

function ErrorRenderer(props: { error: string }) {
  const error = parseError(props.error);
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
