# Accessibility

## Requirements

- semantic controls;
- keyboard navigation;
- visible focus;
- accessible labels;
- no color-only status communication;
- readable error messages;
- sufficient contrast;
- reduced-motion support.

## Editor

Do not make the editor inaccessible because it is implemented as a custom visual surface.

Provide:
- keyboard operation;
- text selection;
- screen-reader appropriate labels where practical.

## Preview

The preview is visual, but status and errors must have textual equivalents.

## Export

Export controls must expose:
- format;
- current settings;
- working state;
- completion/failure.

## Reduced motion

Respect `prefers-reduced-motion`.

Do not make core functionality depend on animation.
