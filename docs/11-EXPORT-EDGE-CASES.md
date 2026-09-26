# Export Edge Cases

Every case below is a release test.

## Geometry
- extremely wide diagram;
- extremely tall diagram;
- very small diagram;
- single-node diagram;
- dense diagram;
- disconnected diagram;
- large whitespace in source;
- long labels;
- long URLs.

## Text
- Unicode;
- Malayalam;
- Hindi;
- CJK;
- emoji where supported;
- mixed scripts;
- RTL text where supported;
- missing font fallback.

## Styling
- dark theme;
- light theme;
- custom background;
- transparent background;
- custom node styles;
- diagram directives;
- theme variables.

## Failure
- syntax error;
- renderer timeout;
- export memory failure;
- unsupported diagram construct;
- browser API unavailable;
- clipboard permission denied;
- download blocked.

## Recovery

An export failure must not:
- delete the source;
- clear the preview;
- corrupt the document;
- leave the UI permanently loading.

## Repeatability

Same source + same configuration should produce materially equivalent output across repeated exports.

Where byte-for-byte determinism is impossible due to metadata, validate semantic/render equivalence instead.
