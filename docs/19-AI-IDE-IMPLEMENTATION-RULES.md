# AI IDE Implementation Rules

This file is the primary instruction contract for an AI coding agent.

## Rule 1 — inspect before changing

Before writing code:
- inspect repository;
- inspect package manager;
- inspect current architecture;
- inspect existing UI implementation;
- inspect existing tests;
- identify actual files;
- do not assume paths.

## Rule 2 — preserve supplied UI

The user provides the visual UI.

Do not invent:
- a new layout;
- new navigation;
- a different visual language;
- decorative UI;
- unnecessary dashboards.

Implement behavior behind the supplied UI.

## Rule 3 — no MVP shortcuts

Do not respond with:
- “implement this later”;
- fake export buttons;
- placeholder PDF;
- screenshot-as-export;
- hard-coded demo-only diagrams;
- only two Mermaid types;
- mock local storage;
- fake offline support.

If a required dependency is technically difficult, solve the engineering problem rather than deleting the requirement.

## Rule 4 — source is sacred

Never destroy user source because rendering failed.

## Rule 5 — downloads are contractual

Every export must use the canonical filename service.

Never use UUIDs as user-visible filenames.

Always test `download.suggestedFilename()`.

## Rule 6 — local-first

Do not introduce a backend merely because it is convenient.

## Rule 7 — no secret network behavior

No source telemetry.

No silent uploads.

No third-party processing of diagram contents.

## Rule 8 — test after every meaningful change

Run:
- typecheck;
- unit tests;
- build;
- relevant E2E;
- production preview for export changes.

## Rule 9 — no false completion

Only claim a feature is complete after:
- implementation;
- tests;
- real browser verification.

## Rule 10 — keep a technical decision record

When choosing:
- Mermaid version;
- PDF engine;
- rasterizer;
- storage strategy;
- security configuration;

record the reason in the repository.

## Rule 11 — fix root causes

Do not patch tests by:
- changing expected filenames to UUIDs;
- increasing arbitrary timeouts;
- swallowing errors;
- disabling tests.

## Rule 12 — production cleanliness

Before release:
- zero TypeScript errors;
- zero build errors;
- no console errors;
- no localhost references;
- no accidental secrets;
- no source uploads;
- no broken SPA routes;
- no horizontal overflow;
- export suite passes.
