import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';

const MAX_DIMENSION = 8192;

export class PngExporter implements Exporter {
  format: ExportFormat = 'png';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    const { svg, width: rawWidth, height: rawHeight } = input;
    const scale = options.scale || 2; // Default to 2x for sharp retina rendering

    const w = Math.max(1, rawWidth || 800);
    const h = Math.max(1, rawHeight || 600);

    // Apply scale with safety caps
    let targetWidth = Math.round(w * scale);
    let targetHeight = Math.round(h * scale);

    if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      const maxRatio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight);
      targetWidth = Math.floor(targetWidth * maxRatio);
      targetHeight = Math.floor(targetHeight * maxRatio);
    }

    // Determine background color
    let bgColor: string | null = null;
    if (options.backgroundType === 'white') bgColor = '#ffffff';
    else if (options.backgroundType === 'dark') bgColor = '#121214';
    else if (options.backgroundType === 'custom' && options.customBackgroundColor) {
      bgColor = options.customBackgroundColor;
    }

    // Prepare SVG markup with standard namespaces and dimensions
    let processedSvg = svg;
    if (!processedSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      processedSvg = processedSvg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!processedSvg.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
      processedSvg = processedSvg.replace(/<svg\b/i, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Ensure explicit width and height on root svg element for crisp rasterization
    if (!/width="[0-9.]+"/i.test(processedSvg)) {
      processedSvg = processedSvg.replace(/<svg\b/i, `<svg width="${w}"`);
    }
    if (!/height="[0-9.]+"/i.test(processedSvg)) {
      processedSvg = processedSvg.replace(/<svg\b/i, `<svg height="${h}"`);
    }

    // Using Data URL rather than Blob URL avoids canvas tainting in Chromium browsers
    // (Chromium marks canvas tainted when drawing blob: URLs containing XHTML/foreignObject nodes)
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(processedSvg)}`;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to obtain 2D canvas context for PNG export.'));
        return;
      }

      const renderImageToCanvas = (imageSource: HTMLImageElement) => {
        try {
          // Fill background if not transparent
          if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          } else {
            ctx.clearRect(0, 0, targetWidth, targetHeight);
          }

          ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas rasterization failed to produce a PNG blob.'));
            }
          }, 'image/png');
        } catch (drawErr) {
          reject(drawErr);
        }
      };

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        renderImageToCanvas(img);
      };

      img.onerror = () => {
        // Fallback to base64 encoding if UTF-8 URL encoding encountered edge-case characters
        try {
          const base64Url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(processedSvg)))}`;
          const fallbackImg = new Image();
          fallbackImg.crossOrigin = 'anonymous';
          fallbackImg.onload = () => renderImageToCanvas(fallbackImg);
          fallbackImg.onerror = () => {
            reject(new Error('Failed to load SVG into image element for PNG rasterization.'));
          };
          fallbackImg.src = base64Url;
        } catch (fallbackErr) {
          reject(new Error('Failed to load SVG into image element for PNG rasterization.'));
        }
      };

      img.src = dataUrl;
    });
  }
}

export const pngExporter = new PngExporter();
exporters.register(pngExporter);
