# Local-First and Offline

## Privacy model

Normal diagram creation, rendering and export should require no backend upload.

Mermaid itself renders diagrams into SVG in the browser when integrated as a web library. citeturn0search7

## Storage

Use IndexedDB for:
- documents;
- bounded revision history;
- settings.

Use localStorage only for small preferences where appropriate.

Never store:
- unnecessary telemetry;
- source code in analytics;
- secrets.

## Offline

The product should continue to work offline after the application shell and required engines are cached, subject to browser capabilities and font availability.

Do not claim offline support until it is tested.

## Data lifecycle

Provide a clear way to:
- delete local documents;
- clear local history;
- reset settings.

Deleting local data must not call a server.

## No server dependency

The normal path must not require:
- authentication;
- cloud database;
- server-side rendering;
- paid API;
- external AI service.

## External resources

Minimize external runtime requests.

Prefer bundled/local assets and fonts where licensing permits.

Production QA must inspect network activity and verify that diagram source is never transmitted as telemetry.
