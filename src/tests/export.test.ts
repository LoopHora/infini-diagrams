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
});
