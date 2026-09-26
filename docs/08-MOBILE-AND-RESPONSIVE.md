# Mobile and Responsive Requirements

## Supported classes

Test at minimum:
- 320px;
- 360px;
- 375px;
- 390/393px;
- 412px;
- 768px;
- desktop widths.

## Mobile core workflow

A user must be able to:
1. paste/type source;
2. render;
3. inspect;
4. zoom/pan;
5. change presentation settings;
6. export;
7. recover work.

## Touch

Required:
- pinch zoom;
- one-finger pan where it does not conflict with page scrolling;
- touch-friendly controls;
- no accidental horizontal overflow.

## Keyboard

When the virtual keyboard opens:
- editor remains usable;
- preview remains reachable;
- controls are not permanently hidden.

## Performance

Do not load every heavy export engine on first paint.

Lazy-load:
- PDF engine;
- rasterization engine;
- optional format-specific heavy modules.

Keep core editor/render experience lightweight.

## Mobile download QA

Verify actual browser download behavior where supported. If a browser cannot provide a conventional download experience, provide a browser-compatible fallback such as opening/copying the generated artifact where appropriate.
