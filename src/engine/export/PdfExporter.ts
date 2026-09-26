import { PDFDocument, rgb } from 'pdf-lib';
import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';
import { pngExporter } from './PngExporter';

// Standard paper dimensions in points (72 points per inch)
const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.00, height: 792.00 }
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16) / 255,
      g: parseInt(clean.substring(2, 4), 16) / 255,
      b: parseInt(clean.substring(4, 6), 16) / 255,
    };
  }
  return { r: 1, g: 1, b: 1 };
}

export class PdfExporter implements Exporter {
  format: ExportFormat = 'pdf';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    if (!input.svg) {
      throw new Error('No diagram SVG available to export to PDF.');
    }

    const pdfPageSize = options.pdfPageSize || 'fit';
    const orientation = options.pdfOrientation || 'landscape';
    const margin = 24; // 24pt margin

    // Generate high-resolution 3x PNG raster for crisp embedding inside PDF
    const pngBlob = await pngExporter.export(input, {
      ...options,
      scale: 3, // 3x scale for ultra-crisp PDF rendering
      backgroundType: options.backgroundType === 'transparent' ? 'white' : options.backgroundType,
    });

    const pngArrayBuffer = await pngBlob.arrayBuffer();

    const pdfDoc = await PDFDocument.create();
    const pngImage = await pdfDoc.embedPng(new Uint8Array(pngArrayBuffer));
    const imgWidth = pngImage.width;
    const imgHeight = pngImage.height;
    const aspectRatio = imgWidth / imgHeight;

    let targetPageWidth = 0;
    let targetPageHeight = 0;
    let drawWidth = 0;
    let drawHeight = 0;
    let drawX = 0;
    let drawY = 0;

    const baseW = Math.max(100, input.width || 800);
    const baseH = Math.max(100, input.height || 600);

    if (pdfPageSize === 'fit') {
      // Fit mode: page fits diagram dimensions exactly with margin while preserving aspect ratio
      if (baseW / baseH > aspectRatio) {
        drawHeight = baseH;
        drawWidth = baseH * aspectRatio;
      } else {
        drawWidth = baseW;
        drawHeight = baseW / aspectRatio;
      }

      targetPageWidth = drawWidth + margin * 2;
      targetPageHeight = drawHeight + margin * 2;
      drawX = margin;
      drawY = margin;
    } else {
      // Standard A4 or Letter
      const standardSize = PAGE_SIZES[pdfPageSize] || PAGE_SIZES.a4;
      if (orientation === 'landscape') {
        targetPageWidth = Math.max(standardSize.width, standardSize.height);
        targetPageHeight = Math.min(standardSize.width, standardSize.height);
      } else {
        targetPageWidth = Math.min(standardSize.width, standardSize.height);
        targetPageHeight = Math.max(standardSize.width, standardSize.height);
      }

      const availableWidth = targetPageWidth - margin * 2;
      const availableHeight = targetPageHeight - margin * 2;

      // Fit inside printable area while strictly preserving aspect ratio (no distortion or clipping)
      if (availableWidth / availableHeight > aspectRatio) {
        drawHeight = availableHeight;
        drawWidth = availableHeight * aspectRatio;
      } else {
        drawWidth = availableWidth;
        drawHeight = availableWidth / aspectRatio;
      }

      // Center diagram on the page
      drawX = margin + (availableWidth - drawWidth) / 2;
      drawY = margin + (availableHeight - drawHeight) / 2;
    }

    const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);

    // Draw background if specified
    if (options.backgroundType === 'dark') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: targetPageWidth,
        height: targetPageHeight,
        color: rgb(0.07, 0.07, 0.08), // #121214
      });
    } else if (options.backgroundType === 'custom' && options.customBackgroundColor) {
      const c = hexToRgb(options.customBackgroundColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: targetPageWidth,
        height: targetPageHeight,
        color: rgb(c.r, c.g, c.b),
      });
    } else if (options.backgroundType === 'white' || options.backgroundType === 'transparent') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: targetPageWidth,
        height: targetPageHeight,
        color: rgb(1, 1, 1),
      });
    }

    // Draw diagram image
    page.drawImage(pngImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  }
}

export const pdfExporter = new PdfExporter();
exporters.register(pdfExporter);
