# PWA, Offline and Deployment

## Production build

Required:
- production build;
- no development endpoints;
- no secrets;
- no localhost references;
- no debug logging containing source;
- correct SPA fallback.

## PWA

If implemented:
- installable;
- cached shell;
- versioned service worker;
- safe cache invalidation;
- offline verification.

Never claim PWA/offline capability without an E2E test.

## Cloud deployment

Deployment must support static hosting such as Cloudflare Pages.

The product should not require a backend for normal use.

## Runtime network audit

Production QA must inspect:
- GET requests;
- POST/PUT/PATCH requests;
- external fonts;
- external assets;
- analytics.

The audit must confirm:
- no diagram source sent to analytics;
- no export content uploaded;
- no hidden API dependency.

## Error boundary

A renderer/export failure must be contained. A single bad diagram cannot take down the entire application.
