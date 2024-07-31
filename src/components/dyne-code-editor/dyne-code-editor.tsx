import { Component, Element, Method, State, h, Prop, Host, Watch } from '@stencil/core';

import { basicSetup } from 'codemirror';
import { EditorState, EditorStateConfig } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

import { nanoid } from 'nanoid';

//

@Component({
  tag: 'dyne-code-editor',
  styleUrl: 'dyne-code-editor.scss',
  shadow: true,
})
export class DyneCodeEditor {
  @Element() el: HTMLElement;

  @Prop({ reflect: true }) name = nanoid(5);
  @Prop({ reflect: true }) config: EditorStateConfig = { extensions: basicSetup };
  @Prop({ reflect: true }) class = '';
  @Prop({ reflect: true }) content = '';

  view: EditorView;

  @Watch('content')
  async updateEditorContent() {
    await this.setContent(this.content);
  }

  private get state() {
    return this.view.state;
  }

  //

  async componentDidLoad() {
    this.view = createEditor(this.getContainer(), { ...this.config, doc: this.content });
  }

  //

  @Method()
  async getContent(): Promise<string> {
    return this.state.doc.toString();
  }

  @Method()
  async setContent(text: string): Promise<void> {
    this.view.dispatch({
      changes: { from: 0, to: this.state.doc.length, insert: text },
    });
  }

  //

  private getContainer() {
    const editorContainer = this.el.shadowRoot?.getElementById(this.name);
    if (!editorContainer) throw new Error('Container not initialized');
    return editorContainer;
  }

  //

  render() {
    return (
      <Host>
        <div id={this.name} class={this.class}></div>
      </Host>
    );
  }
}

//

function createEditor(parent: HTMLElement, config: EditorStateConfig = {}) {
  const state = EditorState.create({
    ...config,
    extensions: [config.extensions ?? [], basicSetup],
  });
  const view = new EditorView({
    parent,
    state,
  });
  return view;
}
