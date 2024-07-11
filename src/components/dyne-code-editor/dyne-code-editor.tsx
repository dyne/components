import { Component, Element, Method, State, h, Prop } from '@stencil/core';

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

  @Prop() id = nanoid(5);
  @Prop() config: EditorStateConfig = { extensions: basicSetup };
  @Prop() class = '';

  @State() view: EditorView;

  private get state() {
    return this.view.state;
  }

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

  async componentDidLoad() {
    this.view = createEditor(this.getContainer(), this.config);
  }

  private getContainer() {
    const editorContainer = this.el.shadowRoot?.getElementById(this.id);
    if (!editorContainer) throw new Error('Container not initialized');
    return editorContainer;
  }

  render() {
    return <div id={this.id} class={this.class}></div>;
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
