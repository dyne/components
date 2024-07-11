import { Component, Element, Method, State, Prop, h } from '@stencil/core';

// import { dracula } from 'thememirror';
import { defaultKeymap } from '@codemirror/commands';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';

import {
  SlangroomError,
  SlangroomResult,
  SlangroomValue,
  ZencodeRuntimeError,
  executeSlangroomContract,
  loadSlangroom,
} from './utils/slangroom';

import hasAnsi from 'has-ansi';
import Convert from 'ansi-to-html';

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

  @Prop() contract = '';
  @Prop() data = '';
  @Prop() keys = '';

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

  private get showEmptyState() {
    return !Boolean(this.value) && !Boolean(this.error) && !Boolean(this.isExecuting);
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
      <div class="space-y-4">
        <Container>
          <div class="  flex justify-between items-center">
            <Title name="Slangroom" />
            <dyne-button size="small" emphasis="high" onClick={() => this.executeContract()}>
              Execute contract
            </dyne-button>
          </div>
        </Container>

        <div class="flex sm:flex-col md:flex-row items-stretch gap-4">
          <Container className="md:grow md:w-0 shrink-0 md:basis-2">
            <div class="space-y-4">
              <Section title={EditorId.CONTRACT}>
                <dyne-code-editor
                  id={EditorId.CONTRACT}
                  config={{ doc: contractSample, extensions: this.keyboardExtension }}
                ></dyne-code-editor>
              </Section>

              <Section title={EditorId.DATA}>
                <dyne-code-editor
                  id={EditorId.DATA}
                  config={{ doc: dataSample, extensions: [this.keyboardExtension, json()] }}
                ></dyne-code-editor>
              </Section>

              <Section title={EditorId.KEYS}>
                <dyne-code-editor
                  id={EditorId.KEYS}
                  config={{ extensions: [this.keyboardExtension, json()] }}
                ></dyne-code-editor>
              </Section>
            </div>
          </Container>

          <Container className="md:grow md:w-0 shrink-0 md:basis-2">
            {this.showEmptyState && <EmptyState />}
            {this.isExecuting && <Spinner />}
            {this.value && <ValueRenderer value={this.value} />}
            {this.error && <ErrorRenderer error={this.error} />}
          </Container>
        </div>
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
    <Section title="Result">
      <dyne-code-editor
        id={EditorId.RESULT}
        config={{
          doc: JSON.stringify(props.value, null, 2),
          extensions: [json()],
        }}
      ></dyne-code-editor>
    </Section>
  );
}

function ErrorRenderer(props: { error: SlangroomError }) {
  const { error } = props;
  if (typeof error == 'string') {
    if (hasAnsi(error)) {
      const converter = new Convert();
      return (
        <Section title="Error">
          <pre class="text-[13px] overflow-auto" innerHTML={converter.toHtml(error)}></pre>
        </Section>
      );
    } else {
      return (
        <Section title="Error">
          <p>{error}</p>
        </Section>
      );
    }
  } else {
    return <ZencodeErrorRenderer error={error}/>
  }
}

function AnsiErrorRenderer(props:{error:string, className?:string}) {
  const {error, className =''} = props
  const converter = new Convert();
  return (<pre class={className} innerHTML={converter.toHtml(error)}></pre>)
}

function ZencodeErrorRenderer(props: {error: ZencodeRuntimeError}) {
  const {error} = props
  return (
    <div>
      <Title name="trace" className="mb-1" />
      <dyne-code-editor
        config={{
          doc: error.trace.join('\n'),
        }}
      ></dyne-code-editor>

      <Title name="logs" className="mb-1" />
      <dyne-code-editor
        config={{
          doc: error.logs.join('\n'),
        }}
      ></dyne-code-editor>

      <Title name="heap" className="mb-1" />
      <dyne-code-editor
        config={{
          doc: JSON.stringify(error.heap, null, 2),
          extensions: [json()],
        }}
      ></dyne-code-editor>
    </div>
  );
}

function Title(props: { name: string; className?: string }) {
  const { name, className = '' } = props;
  return <h4 class={`capitalize font-semibold text-lg text-slate-800 ${className}`}>{name}</h4>;
}

function Spinner() {
  return (
    <div class="w-full h-full flex flex-col items-center justify-center gap-2">
      <div class="spinner"></div>
      <p class="text-slate-400">Loading...</p>
    </div>
  );
}

function Section(props: { className?: string; title: string }, children: JSX.Element) {
  const { className = '', title } = props;
  return (
    <div class={className}>
      <Title name={title} className="mb-2" />
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div class="text-slate-400 w-full h-full flex items-center justify-center">
      <p>Result of the contract will appear here!</p>
    </div>
  );
}

function Container(props: { className?: string }, children: JSX.Element) {
  const { className = '' } = props;
  return <div class={`bg-slate-100 text-slate-800 rounded-md p-4 ${className}`}>{children}</div>;
}
