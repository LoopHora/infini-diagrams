# LoopHora Infini-Diagrams — Complete Engineering Specification

- **Product:** Infini-Diagrams
- **Parent Brand:** LoopHora
- **Core Promise:** Paste diagram code. See it instantly.
- **Supporting Promise:** Make it right. Export anywhere.
- **Differentiator:** Local Engine Active · 100% Local In-Browser Processing
- **Visual Source of Truth:** Infini-Diagrams Studio UI (Tactile Studio Product Tool)

## Status

This specification defines a **complete production V1 pain-killer**, not an MVP.

The product is built with the same philosophy as Infini-Convert:
- complete core workflow from day one
- 100% local-first/browser-first (no diagram source uploaded)
- predictable, deterministic behavior
- no unnecessary account/server dependency
- production-grade exports (SVG, PNG, PDF, MMD)
- mobile-first usability with natural touch/scroll behavior
- strong automated QA
- no placeholder features presented as finished

The UI is the visual source of truth. The engineering implementation provides the real machinery behind this exact interface:
**UI → real editor → real Mermaid renderer → real local document system → real themes/backgrounds → real exports → real mobile behavior → real privacy/security → production QA.**

## Core Promises

> **Primary:** Paste diagram code. See it instantly.  
> **Supporting:** Make it right. Export anywhere.

The first diagram language is Mermaid. Architecture must be extensible, but V1 must be complete for the supported Mermaid surface rather than intentionally shipping a reduced feature subset.

## Non-goals

Do not turn V1 into:
- a Figma clone
- a collaborative whiteboard
- an AI diagram generator
- a project-management product
- a cloud document platform
- a proprietary hosted diagram database

Those can be future products or integrations.

## Definition of complete

A user must be able to:
1. create or paste Mermaid source;
2. open/import Mermaid source files;
3. edit source with useful diagnostics;
4. render reliably;
5. inspect large diagrams;
6. control presentation/background independently from application chrome;
7. save locally and recover work;
8. export high-quality SVG, PNG and PDF;
9. export the source;
10. copy usable output;
11. perform the workflow on mobile;
12. use the application without uploading diagram source to a backend;
13. recover gracefully from invalid syntax, unsupported constructs, large diagrams and export failures.

Every requirement in this package is an acceptance criterion for the AI coding agent.
