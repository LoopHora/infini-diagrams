# Export System

## Required V1 outputs

- SVG
- PNG
- PDF
- Mermaid source (`.mmd`)
- copy-to-clipboard where browser support permits

These formats match established Mermaid workflows; SVG is vector/high-resolution, PNG is convenient for documents/presentations, PDF is useful for documents, and MMD preserves source. citeturn0search0

## Export architecture

All exports must originate from a canonical rendered representation.

Do not:
- screenshot the visible browser viewport for normal export;
- depend on current zoom;
- depend on current scroll position;
- export hidden UI;
- include application chrome.

The exported artifact represents the diagram, not the editor.

## SVG

SVG must:
- contain the diagram;
- include required dimensions/viewBox;
- preserve intended styling;
- not contain application UI;
- not accidentally retain internal object URLs;
- not execute arbitrary scripts.

Sanitize/normalize output according to security policy.

## PNG

PNG generation must use the canonical SVG/render representation rather than a low-resolution screenshot.

Support:
- transparent background;
- custom background;
- explicit scale;
- high-resolution output.

Validate that dimensions are correct.

## PDF

PDF must:
- contain the complete diagram;
- avoid clipping;
- avoid unexpected blank pages;
- respect selected page/background settings;
- preserve readability;
- use predictable page dimensions.

Support sensible presets such as A4, Letter and a presentation-oriented landscape option if technically implemented.

## Source export

Source export must contain the user's actual Mermaid source, not a reconstructed approximation.

## Clipboard

Support:
- copy source;
- copy SVG when supported;
- copy raster image where browser support permits.

Failure must be clearly reported rather than silently doing nothing.

## Export filename contract

Filename must be:
`<sanitized-title>.<extension>`

Rules:
- no UUID;
- no object URL;
- no temporary browser identifier;
- no internal document ID;
- no path traversal;
- normalized invalid characters;
- fallback to `diagram.<extension>`.

## Export completion

Only release the underlying object URL after:
1. the download/copy operation has consumed it;
2. the DOM anchor is no longer needed;
3. no pending asynchronous export depends on it.

Do not revoke an object URL immediately after scheduling a browser download.

## Export tests

Every format must be tested with:
- tiny diagram;
- normal diagram;
- large diagram;
- long labels;
- transparent background;
- custom background;
- dark theme;
- light theme;
- Unicode text;
- invalid source;
- mobile viewport;
- repeated downloads.
