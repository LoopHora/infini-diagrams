# AI IDE Runbook

1. Inspect the actual repository and pinned Mermaid version.
2. Copy the fixture corpus into the repository.
3. Build automated fixture discovery.
4. Render every fixture.
5. Export SVG, PNG, PDF and MMD.
6. Validate artifact bytes and dimensions.
7. Repeat themes/backgrounds/layouts where applicable.
8. Run invalid/security corpus.
9. Run stress generation.
10. Run persistence/recovery.
11. Run network interception.
12. Run download filename regression.
13. Run all responsive viewports.
14. Run browser matrix.
15. Produce `CERTIFICATION-REPORT.md` and machine-readable JSON.

Never:
- fake a passing result;
- replace a broken render with a screenshot;
- delete difficult diagram types;
- weaken security to pass a fixture;
- change expected filenames to UUIDs;
- disable failing tests.

If a fixture is invalid for the pinned Mermaid release, verify it against the official syntax for that exact release, classify it as VERSION-INCOMPATIBLE, and replace it with the correct current fixture.

Final statuses:
PASS / FAIL / UNSUPPORTED / VERSION-INCOMPATIBLE / EXPERIMENTAL / NOT-APPLICABLE.
