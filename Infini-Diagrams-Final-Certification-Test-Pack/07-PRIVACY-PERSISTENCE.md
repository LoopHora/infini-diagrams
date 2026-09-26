# Privacy and Persistence Certification

Test:
1. create document;
2. enter source;
3. render;
4. change theme/background;
5. refresh;
6. reopen;
7. restore history;
8. export.

Expected:
- source intact
- settings intact
- no server dependency

Intercept network requests during render/export. Normal operation must not send source through POST/PUT/PATCH or third-party diagram-processing services.

Audit external GET requests and document each.

If offline/PWA is claimed, test after application assets are cached:
- open offline
- create
- render
- configure
- export
- save locally

Do not claim offline certification until it passes.
