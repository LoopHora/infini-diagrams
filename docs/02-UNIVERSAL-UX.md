# Universal UX Specification

No visual UI is prescribed here. The supplied UI reference is authoritative for visual composition.

This document defines behavior only.

## Universal principles

### Directness
Every primary action should have one obvious path.

### State visibility
Always distinguish:
- rendering
- rendered
- syntax error
- export preparing
- export ready
- export failed
- saved
- unsaved

### No destructive surprises
Never replace a valid diagram preview with a blank/error state merely because the latest edit is invalid.

### Preserve user work
Source must be recoverable after:
- refresh;
- accidental navigation where browser recovery is possible;
- renderer failure;
- export failure.

### Progressive disclosure
Basic workflows stay simple. Advanced configuration is available without forcing every user through it.

### Mobile parity
Mobile is not a reduced marketing demo. Core creation, editing, preview, configuration and export must remain functional.

### Keyboard parity
Desktop users must be able to:
- focus editor;
- render;
- undo/redo;
- search source;
- save/export;
- navigate important controls.

### Touch parity
Mobile users must be able to:
- scroll source;
- pan preview;
- pinch zoom;
- fit/reset;
- open export controls.

## Error UX

Errors must explain:
1. what failed;
2. where possible, where it failed;
3. what the user can do next.

Do not expose raw stack traces as the primary user message.

## Empty states

Every empty state must provide a useful next action:
- paste code;
- open file;
- start from example.

## Loading

Avoid indefinite spinners. Long-running rendering/export operations need progress or clear working state.

## No fake functionality

Buttons must never exist merely as decoration. If an action is visible, it must either work or be clearly marked unavailable by state.
