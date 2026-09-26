# Security and Trust

## Threat model

Treat all Mermaid source as untrusted.

Potential concerns include:
- HTML-like content;
- links;
- diagram directives;
- resource references;
- malicious or pathological input;
- browser resource exhaustion.

Mermaid's own documentation warns that user-controlled diagram content can create security risks and documents `strict` and `sandbox` security levels. citeturn0search9turn0search12

## Mandatory rules

- never enable arbitrary JavaScript callbacks from untrusted diagrams;
- use the safest practical Mermaid security level;
- isolate rendering when needed;
- sanitize exported SVG;
- block unsafe external resource behavior where possible;
- enforce resource limits;
- do not inject raw user HTML into the application DOM;
- use CSP appropriate to the application.

## Links

If diagram syntax supports hyperlinks:
- treat them as external navigation;
- do not silently navigate the application;
- apply safe URL handling;
- never execute a hyperlink as script.

## SVG security

Generated SVG must not become an XSS transport.

Before displaying or exporting generated SVG:
- validate the generated content;
- remove executable script content;
- prevent unsafe external resource behavior where required;
- preserve legitimate diagram visuals.

## Untrusted project/source mode

If the product supports opening arbitrary repository files, consider a trust model:
- source editing can remain available;
- live rendering/export can be gated for explicitly untrusted sources;
- trust must be visible and reversible.

This is especially relevant for files obtained from unknown repositories.

## Security QA

Test:
- script-like labels;
- malicious directives;
- external image URLs if supported;
- huge node counts;
- huge text;
- malformed SVG;
- malformed source;
- repeated render attacks.

The application must remain responsive and must not execute user-provided script code.
