# Mermaid Engine — Complete V1

## Principle

Mermaid is the source-of-truth renderer for Mermaid documents. Do not recreate Mermaid's parser or diagram layout engine.

Pin and explicitly record the Mermaid version used in production. Upgrade only through a tested dependency update.

## Supported workflow

The engine must support:
- Mermaid source parsing;
- rendering to SVG;
- configuration;
- theme configuration;
- safe rendering;
- diagram-specific configuration where Mermaid supports it;
- errors without application crashes.

## Diagram coverage

Do not hard-code support for only flowcharts and sequence diagrams.

The implementation must exercise every diagram type supported by the pinned Mermaid release that is intended to be supported by the product. Maintain a machine-readable compatibility/test matrix.

For every supported type test:
- basic render;
- labels;
- long labels;
- multiline text where supported;
- theme;
- dark/light background;
- export;
- invalid syntax;
- large example.

If a Mermaid type cannot be exported correctly, the product must surface that limitation explicitly rather than silently producing a broken file.

## Rendering lifecycle

1. Receive source.
2. Validate/sanitize according to security policy.
3. Parse.
4. Render in an isolated rendering surface where appropriate.
5. Obtain SVG.
6. Normalize only what is necessary for product operations.
7. Display preview.
8. Keep source unchanged.
9. Store render metadata for export.

## Invalid source

Invalid source must:
- show a useful error;
- preserve source;
- preserve last valid preview;
- avoid application crash;
- avoid corrupted local history.

## Rendering isolation

Treat user-supplied Mermaid as untrusted input.

Mermaid documents explicitly describe security concerns with user-controlled diagram content and provide a sandbox security mode. The product must use the safest practical configuration and never enable arbitrary JavaScript callbacks for untrusted diagrams. citeturn0search9turn0search12

## Resource limits

Implement safeguards for:
- excessive source length;
- excessive text;
- excessive node/edge counts;
- render time;
- export memory.

The limits must fail gracefully and be configurable in code, not hidden magic numbers.

## Mermaid configuration

Separate:
- application configuration;
- user presentation settings;
- diagram directives/front matter;
- security configuration.

Never allow diagram source to override security-critical application configuration.
