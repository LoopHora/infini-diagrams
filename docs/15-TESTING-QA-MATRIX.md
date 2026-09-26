# Testing and QA Matrix

## Unit tests

Test:
- filename sanitization;
- extension handling;
- background settings;
- dimension calculations;
- document persistence;
- revision history;
- export configuration;
- resource limits.

## Integration tests

Test:
- source → render;
- source → render → SVG;
- source → render → PNG;
- source → render → PDF;
- source → source export;
- settings → render → export.

## E2E

For each export:
1. create document;
2. enter source;
3. render;
4. export;
5. wait for download;
6. assert `download.suggestedFilename()`;
7. save temporary test artifact using test runner APIs;
8. validate bytes;
9. validate dimensions/content.

Never use the Playwright temporary path as the expected user filename. Playwright documents that its temporary download path can be GUID-based. citeturn0search1

## Mandatory filename regression test

```ts
const downloadPromise = page.waitForEvent("download");

await page.getByRole("button", { name: /download svg/i }).click();

const download = await downloadPromise;

expect(download.suggestedFilename()).toBe("system-architecture.svg");
```

## Browser matrix

At minimum test current:
- Chromium;
- Firefox;
- Safari/WebKit where automation is available.

Include mobile viewport tests.

## Export validation

PNG:
- valid PNG signature;
- expected dimensions;
- non-empty pixel content.

SVG:
- valid XML/SVG;
- expected viewBox;
- no application chrome;
- no executable script.

PDF:
- valid PDF;
- expected page count;
- non-empty page;
- diagram within page bounds.

MMD:
- exact or semantically preserved source.

## Regression rule

A failed download filename test is a release blocker.

A temporary GUID in the automation filesystem is not a release blocker if `suggestedFilename()` is correct.
