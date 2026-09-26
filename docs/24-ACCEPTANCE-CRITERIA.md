# Acceptance Criteria

## End-to-end user journey

Given valid Mermaid source:

1. User enters source.
2. Product renders diagram.
3. User can inspect it at useful zoom.
4. User changes background/theme/presentation settings.
5. User exports SVG.
6. SVG opens and contains only the diagram.
7. User exports PNG.
8. PNG dimensions match requested output.
9. User exports PDF.
10. PDF contains the complete diagram without clipping.
11. User exports MMD.
12. MMD preserves source.
13. User refreshes.
14. Source is recovered locally.
15. User introduces syntax error.
16. Source remains intact.
17. Last valid preview remains available.
18. User fixes source.
19. Preview updates.
20. User downloads again.
21. Suggested filename is deterministic and contains no UUID.

## Mobile journey

Repeat the entire journey on a phone-sized viewport.

## Security journey

Use untrusted source containing script-like content and unsafe constructs.

Expected:
- no arbitrary script execution;
- no application crash;
- source preserved;
- clear error/restriction;
- safe export behavior.

## Completion definition

All acceptance criteria must pass in a production build.

A demo that passes only the happy path is not certified.
