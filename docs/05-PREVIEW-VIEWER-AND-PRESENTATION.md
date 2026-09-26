# Preview, Viewer and Presentation

## Viewer controls

Required behavior:
- zoom in;
- zoom out;
- fit;
- reset;
- pan;
- fullscreen/expanded view where supported.

## Zoom

Zoom must operate around a useful focal point where possible.

Do not allow:
- infinite zoom causing browser instability;
- zoom values that make the diagram impossible to recover from.

Provide a reset/fit operation.

## Pan

Pan must work with:
- mouse;
- trackpad where available;
- touch.

Do not hijack normal page scrolling unnecessarily.

## Presentation background

The diagram presentation background is independent from the application UI.

Supported V1 backgrounds:
- transparent;
- white;
- black;
- custom solid color.

The setting must apply consistently to export formats where technically supported.

## Dimensions

Support:
- intrinsic diagram dimensions;
- fit-to-width/height behavior where applicable;
- explicit output dimensions;
- aspect-aware scaling.

Do not distort diagram geometry.

## Padding

Allow controlled output padding/margins.

Padding must not accidentally become enormous whitespace in PDF/PNG exports.

## Theme

Theme selection must be deterministic.

If diagram-level configuration overrides a product-level presentation setting, the precedence must be documented and tested.

## Accessibility

Preview must have:
- meaningful status announcements where needed;
- accessible controls;
- keyboard access;
- sufficient focus visibility.

The SVG itself should remain useful for export/embedding where its structure permits it.
