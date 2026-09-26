# Export Certification

For every valid fixture:

## SVG
- valid SVG
- complete diagram
- no application chrome
- correct viewBox
- no executable script

## PNG
- valid PNG
- non-empty
- expected dimensions
- no clipping
- correct background
- transparency works
- high-resolution output works

## PDF
- valid PDF
- correct page count
- diagram visible
- no clipping
- no unexpected blank page
- selected page size respected

## MMD
- source preserved

## Downloads
Expected filename:
`<sanitized-title>.<extension>`

Never intentionally generate a UUID filename.

Playwright tests must assert `download.suggestedFilename()`. Do not compare the temporary filesystem path to the user-facing filename; the runner may use a random temporary path.

Test first download, repeated download, title changes, theme changes, background changes and mobile download.
