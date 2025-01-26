# forkbombeu-ncr-editor



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type     | Default     |
| ----------------- | ------------------- | ----------- | -------- | ----------- |
| `contract`        | `contract`          |             | `string` | `''`        |
| `data`            | `data`              |             | `string` | `''`        |
| `keys`            | `keys`              |             | `string` | `''`        |
| `metadata`        | `metadata`          |             | `string` | `''`        |
| `oasEndpoint`     | `oas-endpoint`      |             | `string` | `undefined` |
| `saveContractUrl` | `save-contract-url` |             | `string` | `undefined` |
| `schema`          | `schema`            |             | `string` | `''`        |


## Methods

### `getContent() => Promise<NcrEditorContent | undefined>`



#### Returns

Type: `Promise<NcrEditorContent | undefined>`



### `setContent(editor: EditorId, content: string) => Promise<void>`



#### Parameters

| Name      | Type       | Description |
| --------- | ---------- | ----------- |
| `editor`  | `EditorId` |             |
| `content` | `string`   |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [dyne-slangroom-editor](../dyne-slangroom-editor)
- [dyne-slangroom-preset-loader](../dyne-slangroom-preset-loader)
- [dyne-button](../dyne-button)

### Graph
```mermaid
graph TD;
  forkbombeu-ncr-editor --> dyne-slangroom-editor
  forkbombeu-ncr-editor --> dyne-slangroom-preset-loader
  forkbombeu-ncr-editor --> dyne-button
  dyne-slangroom-editor --> dyne-button
  dyne-slangroom-editor --> dyne-code-editor
  dyne-slangroom-preset-loader --> dyne-button
  dyne-slangroom-preset-loader --> dyne-code-editor
  style forkbombeu-ncr-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
