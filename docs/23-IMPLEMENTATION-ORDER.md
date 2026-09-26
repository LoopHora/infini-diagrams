# Implementation Order

This is an implementation sequence, not a feature-priority ranking.

## Phase 1 — Foundation
- repository audit;
- architecture;
- Mermaid dependency;
- document model;
- security configuration;
- filename service.

## Phase 2 — Core workflow
- source editor;
- validation;
- rendering;
- last-valid-preview recovery;
- local persistence.

## Phase 3 — Viewer
- zoom;
- pan;
- fit;
- fullscreen;
- mobile touch.

## Phase 4 — Presentation
- themes;
- background;
- transparency;
- dimensions;
- padding.

## Phase 5 — Export
- SVG;
- PNG;
- PDF;
- MMD;
- clipboard.

## Phase 6 — Hardening
- edge cases;
- resource limits;
- SVG security;
- mobile;
- accessibility.

## Phase 7 — QA
- unit;
- integration;
- E2E;
- browser matrix;
- export validation;
- download filename regression.

## Phase 8 — Production
- build;
- network audit;
- performance audit;
- deployment;
- production smoke tests.

No phase is complete merely because code compiles. Completion requires the corresponding acceptance tests.
