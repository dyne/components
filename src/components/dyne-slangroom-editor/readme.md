# dyne-slangroom-editor

<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description | Type                                   | Default     |
| --------------------- | ------------------------ | ----------- | -------------------------------------- | ----------- |
| `contract`            | `contract`               |             | `string`                               | `''`        |
| `data`                | `data`                   |             | `string`                               | `''`        |
| `keys`                | `keys`                   |             | `string`                               | `''`        |
| `keysLocalStorageKey` | `keys-local-storage-key` |             | `string \| undefined`                  | `undefined` |
| `keysMode`            | `keys-mode`              |             | `"editor" \| "localStorage" \| "none"` | `'editor'`  |


## Methods

### `getContent() => Promise<SlangroomEditorContent>`



#### Returns

Type: `Promise<SlangroomEditorContent>`



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

- [dyne-button](../dyne-button)
- [dyne-code-editor](../dyne-code-editor)

### Graph
```mermaid
graph TD;
  dyne-slangroom-editor --> dyne-button
  dyne-slangroom-editor --> dyne-code-editor
  style dyne-slangroom-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
