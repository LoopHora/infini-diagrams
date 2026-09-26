# Infini-Diagrams

> **Parent:** LoopHora  
> **Core Promise:** Paste diagram code. See it instantly.  
> **Supporting Promise:** Make it right. Export anywhere.  
> **Differentiator:** Local Engine Active · 100% Local In-Browser Processing

A private, client-side diagram studio and export engine built with modern React 19, TypeScript, and Mermaid.js v11.4.1.

---

## Brand Architecture

Infini-Diagrams sits within the unified LoopHora product family:
- **LoopHora**: Orange continuous geometric DNA (parent ecosystem)
- **Infini-Convert**: Orange geometric transformation mark (universal file conversion)
- **Inficy**: Blue independent product identity (cloud gateway & services)
- **Infini-Diagrams**: Orange structured-flow / folded-path mark (local-first diagram studio)

The UI established in this project serves as the **visual source of truth**: a tactile, studio/product-tool interface with zero cloud dependency and uncompromising privacy.

---

## Key Features

- **100% Local In-Browser Processing**: Diagrams are parsed, rendered, and exported entirely within your browser. No diagrams, source code snippets, or user data are ever uploaded to a server or external API.
- **Local Engine Active**: Instant client-side feedback powered by pinned Mermaid.js v11.4.1 running in strict security isolation (`securityLevel: 'strict'`).
- **Resilient Non-Destructive Editing**: Syntax errors trigger immediate inline diagnostic badges while preserving the last valid diagram preview on the canvas.
- **Strict Anti-UUID Download Contract**: All exports (SVG, PNG, PDF, MMD) derive deterministic, human-readable filenames from your diagram title (`<sanitized-title>.<extension>`). Zero random GUIDs, hashes, or blob URLs.
- **Pro-Grade Multi-Format Exporters**:
  - **SVG**: Clean, standalone vector graphic with standard XML namespaces and explicit dimension tags.
  - **PNG**: High-DPI rasterization across all scales (1x Standard, 2x Retina HD, 3x High-Res, 4x Ultra HD) using non-tainting Data URIs.
  - **PDF**: Direct vector embedding via `pdf-lib` supporting Fit, A4, and Letter presets in Portrait/Landscape orientations with true aspect ratio preservation.
  - **MMD**: Raw Mermaid source preservation with complete comment and directive fidelity.
- **Multi-Document IndexedDB Workspace**: Create, switch, rename, duplicate, and delete multiple diagram sheets with automatic debounced local autosave and bounded revision recovery.
- **Universal LoopHora Design System**: Dark `#121214` canvas, `#161618` card panels, glassmorphism header, tactile dual-pane desktop studio, and segmented mobile viewport switcher.
- **100% Responsive & Touch-Ready**: Seamless pan and pinch-to-zoom on mobile (320px–412px), tablets (768px), and desktop with natural page scrolling and zero horizontal overflow.

---

## Reproducible Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```
Starts Vite dev server at `http://localhost:5173`.

### Automated Testing

```bash
npm test
```
Runs the full Vitest suite covering filename sanitization, mermaid engine validation, export pipelines, and the 15+ diagram compatibility matrix.

### Production Build

```bash
npm run build
```
Executes TypeScript type checking (`tsc`) and Vite code-splitting production bundle into `dist/`.

### Production Preview

```bash
npm run preview
```
Previews the built production artifacts locally.

---

## Architecture Overview

```
src/
├── components/          # UI Components
│   ├── editor/          # CodeMirror Source Editor
│   ├── layout/          # Header, Hero, Category Cards, Universal Footer
│   ├── modals/          # Export Modal, Document Drawer, About Modal
│   ├── studio/          # Studio Shell, Split Panes, Segmented Switcher
│   └── viewer/          # SVG Diagram Viewer (Pan/Zoom/Pinch)
├── data/                # Templates and Compatibility Matrix
├── engine/              # Core Engine Layer
│   ├── diagram/         # MermaidEngine implementation
│   ├── export/          # SvgExporter, PngExporter, PdfExporter, MmdExporter
│   └── storage/         # IndexedDB DocumentStore & Revision History
├── services/            # FilenameService & DownloadService (Anti-UUID)
├── tests/               # Vitest Automated Test Suites
└── types/               # TypeScript Domain Interfaces
```

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
