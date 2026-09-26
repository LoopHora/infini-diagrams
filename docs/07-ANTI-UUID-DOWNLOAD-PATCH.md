# Anti-UUID Download Patch — Mandatory

## Why this exists

Browser automation can expose a temporary downloaded-file path containing a random GUID/UUID. That temporary filesystem path is **not the same thing as the filename presented to the user**.

Playwright explicitly documents that its temporary download path may use a random GUID and that tests should use `download.suggestedFilename()` for the browser-suggested filename. citeturn0search1turn0search4

Therefore:

> **A UUID appearing in Playwright's temporary download path is not, by itself, a product bug.**

However, the product must never intentionally create a UUID filename.

## Mandatory product implementation

For browser downloads generated from a Blob/object URL, use a native anchor:

```ts
const objectUrl = URL.createObjectURL(blob);

const anchor = document.createElement("a");
anchor.href = objectUrl;
anchor.download = canonicalFilename;
anchor.rel = "noopener";

document.body.appendChild(anchor);
anchor.click();
anchor.remove();

// Revoke only after the browser has had an opportunity to consume the URL.
// Use a controlled cleanup strategy; do not revoke synchronously before click.
setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
```

Preferred architecture when React rendering already provides a stable anchor:

```tsx
<a
  href={objectUrl}
  download={canonicalFilename}
  aria-label={`Download ${canonicalFilename}`}
>
  Download
</a>
```

The canonical filename must be generated independently:

```ts
function sanitizeFilename(input: string, extension: string) {
  const base = input
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);

  return `${base || "diagram"}.${extension}`;
}
```

## Forbidden implementation patterns

Do not use:
- `crypto.randomUUID()` as the download filename;
- internal document UUID as filename;
- object URL as filename;
- temporary path as filename;
- `file.name` from a generated blob when it is unavailable;
- random hash as visible filename;
- synthetic filenames such as `download-<uuid>.png`;
- a temporary server URL whose Content-Disposition is uncontrolled;
- immediate `URL.revokeObjectURL()` before the browser has consumed the download;
- FileSaver solely to hide an incorrectly designed download flow;
- dynamic anchor creation as a workaround for an underlying filename contract problem.

Dynamic anchors themselves are not inherently forbidden by browsers; the requirement is that the implementation have a deterministic filename contract and safe object-URL lifecycle.

## Test contract

Every download test must assert TWO separate things:

### 1. Product filename

```ts
const download = await page.waitForEvent("download");
await triggerDownload();

expect(download.suggestedFilename()).toBe("my-diagram.svg");
```

### 2. Temporary filesystem path

Never assert that `download.path()` ends with the user-visible filename.

Playwright documents that `download.path()` may point to a temporary GUID-named file while `suggestedFilename()` represents the browser-suggested filename. citeturn0search1turn0search4

## Regression matrix

For every export type:
- first download;
- second download;
- repeated download of same file;
- download after editing title;
- download after changing theme;
- download after changing background;
- download on mobile browser;
- download of Unicode title;
- download of title containing illegal filesystem characters.

Expected:
- user-visible suggested filename is deterministic;
- extension is correct;
- no UUID is intentionally used;
- downloaded bytes are valid;
- no broken/empty file;
- object URLs are eventually released.

## Filename examples

Correct:
- `system-architecture.svg`
- `system-architecture.png`
- `system-architecture.pdf`
- `system-architecture.mmd`

Incorrect:
- `7d4c2c5b-9c3d-4f8e-9d10-....png`
- `blob:https://...`
- `download.png` when a meaningful title exists
- `/tmp/<uuid>` treated as the user filename

## Critical distinction

Do not “fix” a test by renaming the Playwright temporary path.

Fix the **application's suggested filename**, then assert `suggestedFilename()`.

The test runner's temporary GUID is an implementation detail of the automation environment, not the product filename.
