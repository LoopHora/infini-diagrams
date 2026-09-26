# Performance

## Goals

Normal typing must remain responsive.

Rendering must not freeze the entire application.

Large exports must move expensive work away from the main thread where technically possible.

## Debouncing

Do not render on every individual keystroke without a controlled debounce.

Allow explicit manual render.

## Web Workers

Use workers for CPU-heavy:
- rasterization;
- PDF generation;
- image conversion;
- expensive serialization.

Do not force workers where library/browser constraints make them harmful.

## Code splitting

Heavy engines must be lazy loaded.

The initial bundle should contain:
- application shell;
- editor;
- Mermaid core needed for normal rendering;
- minimal utilities.

## Resource limits

Implement:
- source length limit;
- render timeout;
- export timeout;
- memory-conscious raster dimensions.

Do not allow arbitrary user input to request a 100,000 × 100,000 PNG.

## Performance tests

Measure:
- initial load;
- first render;
- repeated render;
- large diagram render;
- PNG export;
- PDF export;
- mobile rendering;
- memory after repeated exports.
