# Pain Map and Product Charter

## Research basis

Reddit/community research identified recurring pain around:
- editor/preview friction
- mobile usability
- export quality
- transparency/background control
- dark/light rendering differences
- theming
- SVG/PNG/PDF output
- clipboard workflows
- zoom/fit for large diagrams
- local/private workflows
- source-file handling

These are discovery signals, not statistical market measurements. Treat them as product hypotheses that must be covered by the implementation and tested.

## Pain-killer map

### 1. Source-to-preview friction
Requirement:
- source editor and preview must operate as one workflow;
- render must be fast enough for normal typing;
- user can trigger manual render;
- invalid source never destroys the last valid preview.

### 2. Mobile friction
Requirement:
- complete workflow at phone widths;
- touch pan and pinch zoom;
- controls remain reachable;
- keyboard does not permanently obscure editor or output;
- export works from mobile browsers.

### 3. Export pain
Requirement:
- SVG, PNG, PDF and source export;
- deterministic filenames;
- predictable dimensions;
- high-resolution PNG;
- no accidental low-resolution screenshot export;
- transparency where format supports it.

### 4. Background pain
Requirement:
- transparent;
- white;
- black;
- custom solid color;
- preview background and export background are separate concerns.

### 5. Theme/readability pain
Requirement:
- theme presets;
- readable text/lines across light and dark backgrounds;
- diagram configuration is preserved for export where applicable.

### 6. Large-diagram pain
Requirement:
- fit-to-view;
- zoom;
- pan;
- reset;
- fullscreen/expanded viewing;
- rendering must not freeze the main UI unnecessarily.

### 7. Privacy pain
Requirement:
- diagram source is processed locally by default;
- no upload endpoint is required for normal rendering/export;
- no source telemetry;
- network behavior must be auditable.

### 8. Recovery pain
Requirement:
- autosave local source;
- local history;
- recover after refresh;
- preserve last valid render when a new edit fails.

## Product principle

Do not solve one pain while creating another.

Example:
A high-quality export that requires uploading the diagram to a server is not an acceptable default because it breaks the local-first promise.

## Product success condition

A user should be able to go from raw Mermaid code to a finished exported artifact without needing to understand the internals of Mermaid, SVG, canvas, PDF generation, browser object URLs or file APIs.
