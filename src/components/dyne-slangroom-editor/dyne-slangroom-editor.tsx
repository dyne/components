import { Component, Element, State, Prop, Method, h, Watch } from '@stencil/core';

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

  @Prop() keysMode: 'none' | 'editor' | 'localStorage' = 'editor';
  @Prop() keysLocalStorageKey: string | undefined = undefined;

  @Method()
  async getContent(): Promise<SlangroomEditorContent> {
    return {
      contract: await this.getEditor(EditorId.CONTRACT).getContent(),
      data: await this.getEditor(EditorId.DATA).getContent(),
      keys: await this.getEditor(EditorId.KEYS).getContent(),
      result: this.result,
    };
  }

  //

  async componentDidLoad() {
    this.checkForMissingLocalStorageKey();
    await loadSlangroom();
  }

  private checkForMissingLocalStorageKey() {
    const isMissing = !Boolean(this.keysLocalStorageKey) && this.keysMode == 'localStorage';
    if (isMissing)
      throw new Error(
        'Prop `keys-local-storage-key` must be set when using `keys-mode = localStorage`',
      );
  }

  private async executeContract() {
    this.result = undefined;
    this.isExecuting = true;

    const contract = await this.getEditorContent(EditorId.CONTRACT);
    const data = await this.getEditorContent(EditorId.DATA);
    const keys = await this.getKeys();

    this.result = await executeSlangroomContract({
      contract,
      data: parseJsonObjectWithFallback(data),
      keys,
    });

    this.isExecuting = false;
  }

  private getEditorContent(id: EditorId) {
    return this.getEditor(id).getContent();
  }

  private async getKeys() {
    switch (this.keysMode) {
      case 'none':
        return {};
      case 'editor':
        return parseJsonObjectWithFallback(await this.getEditorContent(EditorId.KEYS));
      case 'localStorage':
        return this.readKeysFromLocalStorage();
    }
  }

  private readKeysFromLocalStorage() {
    if (this.keysMode == 'localStorage' && this.keysLocalStorageKey) {
      const item = localStorage.getItem(this.keysLocalStorageKey);
      if (item) return parseJsonObjectWithFallback(item);
    }
    return {};
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
    return (
      this.el.shadowRoot?.querySelectorAll(`dyne-code-editor`) ??
      ([] as unknown as NodeListOf<HTMLDyneCodeEditorElement>)
    );
  }

  private getEditor(id: EditorId) {
    const editor = Array.from(this.editors).find(editor => editor.name == id);
    if (!editor) throw new Error('Editor not initialized in DOM');
    return editor;
  }

  //

  render() {
    return (
      <div class="space-y-4">
        <Container>
          <div class="flex justify-between items-center">
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
                  name={EditorId.CONTRACT}
                  content={this.contract}
                  config={{ extensions: this.keyboardExtension }}
                ></dyne-code-editor>
              </Section>

              <Section title={EditorId.DATA}>
                <dyne-code-editor
                  name={EditorId.DATA}
                  content={this.data}
                  config={{ extensions: [this.keyboardExtension, json()] }}
                ></dyne-code-editor>
              </Section>

              {this.keysMode == 'editor' && (
                <Section title={EditorId.KEYS}>
                  <dyne-code-editor
                    name={EditorId.KEYS}
                    content={this.keys}
                    config={{ extensions: [this.keyboardExtension, json()] }}
                  ></dyne-code-editor>
                </Section>
              )}
            </div>
          </Container>

          <Container className="md:grow md:w-0 shrink-0 md:basis-2">
            {this.showEmptyState && <EmptyState />}
            {this.isExecuting && <Spinner />}
            {this.result && <ResultRenderer result={this.result} />}
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

export type SlangroomEditorContent = {
  contract: string;
  data: string;
  keys: string;
  result: SlangroomResult | undefined;
};

// Utils

function parseJsonObjectWithFallback(string: string): Record<string, unknown> {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
}

// Partials

function ResultRenderer(props: { result: SlangroomResult }) {
  const { result } = props;
  if (result.success === true) return <ValueRenderer value={result.value} />;
  else return <ErrorRenderer error={result.error} />;
}

function ValueRenderer(props: { value: SlangroomValue }) {
  return (
    <Section title="Result">
      <dyne-code-editor
        name={EditorId.RESULT}
        content={JSON.stringify(props.value, null, 2)}
        config={{
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
      return (
        <Section title="Error">
          <AnsiRenderer className="text-[13px] overflow-auto" text={error}></AnsiRenderer>
        </Section>
      );
    } else {
      return (
        <Section title="Error">
          <p class="bg-red-50  text-red-800 rounded-lg border border-red-300  divide-red-300  p-4 gap-3 text-sm flex items-center">
            {error}
          </p>
        </Section>
      );
    }
  } else {
    return <ZencodeErrorRenderer error={error} />;
  }
}

// bg-slate-100 -> #F1F5F9
// text-slate-800 -> #1E293B
function AnsiRenderer(props: { text: string; className?: string }) {
  const { text, className = '' } = props;
  const converter = new Convert({ bg: '#F1F5F9', fg: '#1E293B' });
  return <pre class={className} innerHTML={converter.toHtml(text)}></pre>;
}

function ZencodeErrorRenderer(props: { error: ZencodeRuntimeError }) {
  const { error } = props;
  return (
    <div>
      <Title name="trace" className="mb-1" />
      <dyne-code-editor name="trace" content={error.trace.join('\n')}></dyne-code-editor>

      <Title name="logs" className="mb-1" />
      <dyne-code-editor name="logs" content={error.logs.join('\n')}></dyne-code-editor>

      <Title name="heap" className="mb-1" />
      <dyne-code-editor
        name="heap"
        content={JSON.stringify(error.heap, null, 2)}
        config={{
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
