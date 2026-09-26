# Production Release Certification

A release is certified only when all sections pass.

## Build
- [ ] production build passes
- [ ] TypeScript passes
- [ ] lint passes
- [ ] tests pass
- [ ] no development endpoints
- [ ] no secrets

## Core
- [ ] paste source
- [ ] edit source
- [ ] render
- [ ] recover invalid source
- [ ] local autosave
- [ ] history
- [ ] import source
- [ ] export source

## Viewer
- [ ] zoom
- [ ] pan
- [ ] fit
- [ ] reset
- [ ] mobile touch

## Presentation
- [ ] themes
- [ ] transparent background
- [ ] white background
- [ ] black background
- [ ] custom background
- [ ] dimensions
- [ ] padding

## Exports
- [ ] SVG
- [ ] PNG
- [ ] PDF
- [ ] MMD
- [ ] clipboard where supported
- [ ] deterministic filenames
- [ ] no UUID filenames

## Security
- [ ] malicious input tests
- [ ] safe Mermaid security configuration
- [ ] SVG sanitation
- [ ] resource limits
- [ ] no source telemetry

## Privacy/network
- [ ] network audit
- [ ] no source POST/PUT/PATCH
- [ ] no hidden upload service

## Mobile
- [ ] 320px
- [ ] 360px
- [ ] 393px
- [ ] 412px
- [ ] tablet
- [ ] desktop
- [ ] no horizontal overflow

## Download certification

The following must pass for every format:

```text
Application filename:
<sanitized-title>.<extension>

Playwright suggestedFilename:
same expected filename

Playwright temporary path:
may be GUID/random and must NOT be asserted as the product filename.
```

Playwright's documentation explicitly distinguishes the random temporary path from `suggestedFilename()`. citeturn0search1

## Final principle

The product is not “done” because the diagram renders.

It is done when the entire journey works:

**code → render → adjust → inspect → export → real file → real device**

without data loss, broken downloads, unsafe rendering, or unnecessary cloud dependency.
