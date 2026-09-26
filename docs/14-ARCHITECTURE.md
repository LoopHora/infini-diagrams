# Technical Architecture

## Suggested stack

The exact stack may follow the existing LoopHora conventions, but the implementation should remain:
- React;
- TypeScript;
- browser-first;
- local-first;
- modular;
- testable.

## Core modules

### Document Store
Owns:
- documents;
- persistence;
- revision history.

### Source Editor
Owns:
- source editing;
- diagnostics;
- keyboard behavior.

### Diagram Engine Adapter
Interface:

```ts
interface DiagramEngine {
  id: string;
  canHandle(source: string): boolean;
  render(source: string, options: RenderOptions): Promise<RenderResult>;
  validate(source: string): Promise<ValidationResult>;
}
```

Mermaid is the first engine.

### Presentation Engine
Owns:
- background;
- padding;
- output dimensions;
- theme-related product settings.

### Export Engine
Interface:

```ts
interface Exporter {
  format: ExportFormat;
  export(input: ExportInput, options: ExportOptions): Promise<Blob>;
}
```

### Filename Service
One canonical service generates every download filename.

No individual export component may invent filenames.

### Clipboard Service
Handles:
- source;
- SVG;
- PNG where supported.

### Security Layer
Owns:
- source validation;
- renderer security;
- SVG sanitation;
- URL safety;
- resource limits.

## Registry approach

Use registries rather than scattered conditional logic.

Example:
- engine registry;
- export registry;
- theme registry;
- preset registry.

This mirrors the successful registry/resolver architecture used by the user's existing conversion product.
