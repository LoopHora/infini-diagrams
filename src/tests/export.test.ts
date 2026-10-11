import { describe, it, expect } from 'vitest';
import { svgExporter } from '../engine/export/SvgExporter';
import { mmdExporter } from '../engine/export/MmdExporter';
import { PDFDocument } from 'pdf-lib';

describe('Export System Suite', () => {
  const sampleSvg = '<svg viewBox="0 0 400 300"><text x="20" y="50">Hello World</text></svg>';
  const sampleSource = 'graph TD\nA-->B';

  it('SvgExporter outputs valid SVG blob with XML header and background rect', async () => {
    const blob = await svgExporter.export(
      { svg: sampleSvg, source: sampleSource, width: 400, height: 300 },
      {
        format: 'svg',
        title: 'test-diagram',
        backgroundType: 'dark',
      }
    );

    expect(blob.type).toBe('image/svg+xml;charset=utf-8');
    const text = await blob.text();
    expect(text.startsWith('<?xml')).toBe(true);
    expect(text.includes('fill="#121214"')).toBe(true);
    expect(text.includes('xmlns="http://www.w3.org/2000/svg"')).toBe(true);
  });

  it('SvgExporter preserves transparent background without rect when requested', async () => {
    const blob = await svgExporter.export(
      { svg: sampleSvg, source: sampleSource, width: 400, height: 300 },
      {
        format: 'svg',
        title: 'test-diagram',
        backgroundType: 'transparent',
      }
    );

    const text = await blob.text();
    expect(text.includes('rect')).toBe(false);
  });

  it('MmdExporter preserves raw source faithfully', async () => {
    const blob = await mmdExporter.export(
      { svg: sampleSvg, source: sampleSource, width: 400, height: 300 },
      {
        format: 'mmd',
        title: 'test-diagram',
        backgroundType: 'transparent',
      }
    );

    expect(blob.type).toBe('text/plain;charset=utf-8');
    const text = await blob.text();
    expect(text).toBe(sampleSource);
  });

  it('PDFDocument from pdf-lib creates valid PDF bytes', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    page.drawText('Infini-Diagrams Test PDF', { x: 50, y: 700 });
    const pdfBytes = await doc.save();
    expect(pdfBytes.length).toBeGreaterThan(100);
    // PDF header magic bytes %PDF-
    const header = String.fromCharCode(...pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('prepareSvgForRasterization fixes void tags, entities, dimensions, and namespaces', async () => {
    const { prepareSvgForRasterization } = await import('../engine/export/PngExporter');

    const problematicSvg = `
      <svg id="mermaid-123" width="100%" style="max-width: 600px;" viewBox="0 0 600 400">
        <foreignObject width="100" height="100">
          <div>Line 1<br>Line 2<hr><img src="test.png">AT&T &nbsp; &copy;</div>
        </foreignObject>
      </svg>
    `;

    const prepared = prepareSvgForRasterization(problematicSvg, 600, 400);

    // Verify unclosed void tags are closed
    expect(prepared.includes('<br/>')).toBe(true);
    expect(prepared.includes('<hr/>')).toBe(true);
    expect(prepared.includes('<img src="test.png"/>')).toBe(true);

    // Verify named entities replaced with numeric XML entities
    expect(prepared.includes('&#160;')).toBe(true);
    expect(prepared.includes('&#169;')).toBe(true);
    expect(prepared.includes('&nbsp;')).toBe(false);
    expect(prepared.includes('&copy;')).toBe(false);

    // Verify stray ampersands escaped
    expect(prepared.includes('AT&amp;T')).toBe(true);

    // Verify explicit pixel width and height on root svg
    expect(prepared.includes('width="600"')).toBe(true);
    expect(prepared.includes('height="400"')).toBe(true);
    expect(prepared.includes('width="100%"')).toBe(false);

    // Verify XML namespaces present
    expect(prepared.includes('xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(prepared.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')).toBe(true);
  });

  it('PngExporter exports valid PNG blob from SVG', async () => {
    const { pngExporter } = await import('../engine/export/PngExporter');

    const blob = await pngExporter.export(
      {
        svg: '<svg viewBox="0 0 400 300"><circle cx="50" cy="50" r="40" fill="red" /></svg>',
        source: 'graph TD\nA-->B',
        width: 400,
        height: 300,
      },
      {
        format: 'png',
        title: 'test-png-diagram',
        scale: 2,
        backgroundType: 'white',
      }
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('PdfExporter exports valid PDF blob containing embedded raster diagram', async () => {
    const { pdfExporter } = await import('../engine/export/PdfExporter');

    const blob = await pdfExporter.export(
      {
        svg: '<svg viewBox="0 0 400 300"><circle cx="50" cy="50" r="40" fill="blue" /></svg>',
        source: 'graph TD\nA-->B',
        width: 400,
        height: 300,
      },
      {
        format: 'pdf',
        title: 'test-pdf-diagram',
        pdfPageSize: 'fit',
        pdfOrientation: 'landscape',
        backgroundType: 'white',
      }
    );

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const header = String.fromCharCode(...bytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });
});
