# Contributing to Infini-Diagrams

Thank you for your interest in contributing to LoopHora Infini-Diagrams!

## Guiding Principles

1. **Local-First & Zero-Telemetry**: Diagrams and user source must never be transmitted to external servers, APIs, or analytics.
2. **Anti-UUID Filename Contract**: All export routines must generate deterministic, human-readable filenames derived from the document title. Never allow UUIDs, GUIDs, hashes, or blob URLs in user downloads.
3. **Non-Destructive Resilience**: Parser or rendering errors must never destroy user source or blank out working views without recovery.
4. **Universal Design System**: UI changes must adhere to LoopHora styling (`#121214` dark canvas, `#161618` card panels, Inter font, responsive layout).

## Development Workflow

1. Clone repository and install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Run tests before committing:
   ```bash
   npm test
   ```
4. Verify production build:
   ```bash
   npm run build
   ```

## Pull Request Checklist

- [ ] All Vitest unit and integration tests pass (`npm test`).
- [ ] TypeScript check and production build compile cleanly (`npm run build`).
- [ ] No external telemetry or network calls added.
- [ ] Mobile responsiveness verified (320px–768px).
- [ ] Download filename contract preserved.
