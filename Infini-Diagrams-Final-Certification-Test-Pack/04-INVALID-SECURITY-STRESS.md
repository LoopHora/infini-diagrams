# Invalid and Security Stress

Test:
- empty source
- whitespace only
- missing declaration
- misspelled declaration
- incomplete node
- incomplete relationship
- unmatched quote
- unmatched bracket
- malformed frontmatter
- malformed directive
- invalid config
- unsupported syntax
- truncated source

Security probes:
- `<script>alert(1)</script>`
- HTML-looking labels
- unsafe URL-like labels
- malformed SVG-like content
- huge repeated text

Expected:
- no script execution
- no application crash
- source preserved
- last valid preview preserved
- clear error/restriction

Mermaid documents `strict` as the default security level and provides sandbox mode. Do not weaken security just to make a hostile fixture render.
