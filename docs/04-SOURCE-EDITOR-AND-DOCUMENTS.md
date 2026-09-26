# Source Editor and Document System

## Input methods

Support:
- direct typing;
- paste;
- `.mmd` / Mermaid source file import;
- drag-and-drop source file where browser permissions allow;
- opening compatible Markdown containing Mermaid blocks, if implemented as a supported import mode.

## Source preservation

Do not normalize user source unnecessarily.

Preserve:
- whitespace where practical;
- comments;
- directives;
- front matter;
- diagram text.

## Editing

Required:
- undo/redo;
- select/copy/paste;
- find;
- keyboard shortcuts;
- line numbers;
- syntax-aware diagnostics where practical;
- large-file handling.

## Local documents

V1 should support multiple local documents without requiring a server account.

Use IndexedDB for durable document storage where practical.

Document record should include:
- stable internal document key;
- user-visible title;
- source;
- created timestamp;
- updated timestamp;
- optional history;
- presentation settings;
- last successful render metadata.

Internal identifiers must never leak into downloaded filenames.

## Autosave

Autosave locally after controlled debounce and on important lifecycle events.

Never save every keystroke synchronously in a way that blocks typing.

## History

Provide local revision recovery.

History must:
- have bounded storage;
- avoid unbounded growth;
- recover previous source;
- never silently overwrite the current source.

## File naming

Default filename must derive from a sanitized user-visible title, e.g.:

`my-system-architecture.mmd`
`my-system-architecture.svg`
`my-system-architecture.png`
`my-system-architecture.pdf`

Do not use database IDs, UUIDs, object URLs, React keys or browser-generated identifiers as filenames.
