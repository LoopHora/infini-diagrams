import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';

const MAX_DIMENSION = 8192;

/**
 * Prepares and sanitizes SVG markup for strict XML image decoders used by HTMLImageElement.
 * Closes void HTML tags, replaces named HTML entities with XML numeric entities,
 * escapes stray ampersands, injects required XML namespaces, and guarantees explicit pixel dimensions.
 */
export function prepareSvgForRasterization(svg: string, width: number, height: number): string {
  if (!svg || !svg.trim()) {
    throw new Error('SVG content is empty.');
  }

  let cleaned = svg.trim();

  // 1. Strip any existing XML declaration or DOCTYPE headers to prevent duplicate/malformed headers
  cleaned = cleaned.replace(/<\?xml[^>]*\?>/gi, '');
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  cleaned = cleaned.trim();

  // 2. Fix unclosed void HTML tags inside foreignObject/HTML labels
  // Common void elements: <br>, <hr>, <img>, <input>
  cleaned = cleaned.replace(/<br(?:\s*|\s+[^>]*?)>/gi, (match) => {
    return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
  });
  cleaned = cleaned.replace(/<hr(?:\s*|\s+[^>]*?)>/gi, (match) => {
    return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
  });
  cleaned = cleaned.replace(/<img(?:\s+[^>]*?)>/gi, (match) => {
    return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
  });
  cleaned = cleaned.replace(/<input(?:\s+[^>]*?)>/gi, (match) => {
    return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
  });

  // 3. Convert named HTML entities to numeric XML character entities
  // XML only natively supports: &amp; &lt; &gt; &quot; &apos;
  const entityMap: Record<string, string> = {
    '&nbsp;': '&#160;',
    '&copy;': '&#169;',
    '&reg;': '&#174;',
    '&trade;': '&#8482;',
    '&ndash;': '&#8211;',
    '&mdash;': '&#8212;',
    '&hellip;': '&#8230;',
    '&bull;': '&#8226;',
    '&ldquo;': '&#8220;',
    '&rdquo;': '&#8221;',
    '&lsquo;': '&#8216;',
    '&rsquo;': '&#8217;',
    '&deg;': '&#176;',
    '&plusmn;': '&#177;',
    '&times;': '&#215;',
    '&divide;': '&#247;',
    '&cent;': '&#162;',
    '&pound;': '&#163;',
    '&euro;': '&#8364;',
    '&yen;': '&#165;',
    '&sect;': '&#167;',
    '&para;': '&#182;',
    '&larr;': '&#8592;',
    '&uarr;': '&#8593;',
    '&rarr;': '&#8594;',
    '&darr;': '&#8595;',
    '&harr;': '&#8596;',
  };

  for (const [entity, replacement] of Object.entries(entityMap)) {
    cleaned = cleaned.split(entity).join(replacement);
  }

  // 4. Escape unescaped ampersands: & that is not part of a valid XML entity
  cleaned = cleaned.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

  // 5. Ensure foreignObject children have xhtml namespace if missing
  cleaned = cleaned.replace(/<foreignObject\b([^>]*)>(\s*)<div(?!\s+xmlns)/gi, '<foreignObject$1>$2<div xmlns="http://www.w3.org/1999/xhtml"');

  // 6. Ensure root <svg> element has proper attributes and explicit pixel dimensions
  const svgTagMatch = cleaned.match(/<svg\b([^>]*)>/i);
  if (svgTagMatch) {
    let attrs = svgTagMatch[1];

    // Remove existing width, height, and style attributes from root <svg>
    attrs = attrs.replace(/\s+width=["'][^"']*["']/gi, '');
    attrs = attrs.replace(/\s+height=["'][^"']*["']/gi, '');
    attrs = attrs.replace(/\s+style=["'][^"']*["']/gi, '');

    // Ensure required XML namespaces
    if (!attrs.includes('xmlns="http://www.w3.org/2000/svg"')) {
      attrs += ' xmlns="http://www.w3.org/2000/svg"';
    }
    if (!attrs.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
      attrs += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    }
    if (!attrs.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) {
      attrs += ' xmlns:xhtml="http://www.w3.org/1999/xhtml"';
    }

    // Ensure viewBox is present; if absent, synthesize from width/height
    if (!/viewBox=["'][^"']*["']/i.test(attrs)) {
      attrs += ` viewBox="0 0 ${width} ${height}"`;
    }

    // Set explicit pixel width, height, and style
    attrs += ` width="${width}" height="${height}" style="max-width: 100%; height: auto;"`;

    cleaned = cleaned.replace(svgTagMatch[0], `<svg ${attrs.trim()}>`);
  } else {
    // If no <svg> tag found, wrap in one
    cleaned = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${cleaned}</svg>`;
  }

  return cleaned;
}

/**
 * Encodes a string to Base64 in a Unicode-safe manner.
 */
function svgToBase64(svgStr: string): string {
  try {
    if (typeof TextEncoder !== 'undefined') {
      const bytes = new TextEncoder().encode(svgStr);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    return btoa(unescape(encodeURIComponent(svgStr)));
  } catch {
    return btoa(unescape(encodeURIComponent(svgStr)));
  }
}

/**
 * Converts a data URL to a Blob.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Loads an SVG string into an HTMLImageElement using a robust multi-tier fallback chain:
 * Tier 1: Blob URL (fastest, direct memory)
 * Tier 2: UTF-8 Data URL (URL-encoded)
 * Tier 3: Unicode-safe Base64 Data URL
 *
 * NOTE: crossOrigin is NEVER set, avoiding CORS security rejections on in-memory URLs.
 */
async function loadSvgToImage(svgString: string): Promise<HTMLImageElement> {
  const tiers: (() => { url: string; cleanup?: () => void })[] = [
    // Tier 1: Blob URL
    () => {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      return { url, cleanup: () => URL.revokeObjectURL(url) };
    },
    // Tier 2: UTF-8 Data URL
    () => {
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      return { url };
    },
    // Tier 3: Unicode-safe Base64 Data URL
    () => {
      const base64 = svgToBase64(svgString);
      const url = `data:image/svg+xml;base64,${base64}`;
      return { url };
    },
  ];

  let lastError: Error | null = null;

  for (const tier of tiers) {
    try {
      const { url, cleanup } = tier();
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        // NEVER set image.crossOrigin on data: or blob: URLs!
        let settled = false;

        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error('Image rasterization timed out.'));
          }
        }, 8000);

        image.onload = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(image);
          }
        };

        image.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(new Error('Image failed to decode SVG.'));
          }
        };

        image.src = url;
      });

      if (cleanup) {
        cleanup();
      }
      return img;
    } catch (err: any) {
      lastError = err;
      // Continue to next tier
    }
  }

  throw new Error(`Failed to load SVG into image element for PNG rasterization: ${lastError?.message || 'unknown decode failure'}`);
}

export class PngExporter implements Exporter {
  format: ExportFormat = 'png';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    const { svg, width: rawWidth, height: rawHeight } = input;
    if (!svg || !svg.trim()) {
      throw new Error('No diagram SVG available to export to PNG.');
    }

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

    // Prepare SVG markup with standard namespaces, tag closure, entity escaping, and dimensions
    const processedSvg = prepareSvgForRasterization(svg, w, h);

    // Load SVG into Image element via multi-tier fallback chain
    const img = await loadSvgToImage(processedSvg);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to obtain 2D canvas context for PNG export.');
    }

    // Fill background if not transparent
    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.clearRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            try {
              // Fallback via toDataURL if toBlob returned null
              const dataUrl = canvas.toDataURL('image/png');
              const fallbackBlob = dataUrlToBlob(dataUrl);
              if (fallbackBlob && fallbackBlob.size > 0) {
                resolve(fallbackBlob);
              } else {
                reject(new Error('Canvas rasterization failed to produce a PNG blob.'));
              }
            } catch (fallbackErr: any) {
              reject(new Error(`Canvas rasterization failed: ${fallbackErr?.message || 'unknown error'}`));
            }
          }
        }, 'image/png');
      } catch (toBlobErr: any) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const fallbackBlob = dataUrlToBlob(dataUrl);
          if (fallbackBlob && fallbackBlob.size > 0) {
            resolve(fallbackBlob);
          } else {
            reject(toBlobErr);
          }
        } catch {
          reject(toBlobErr);
        }
      }
    });
  }
}

export const pngExporter = new PngExporter();
exporters.register(pngExporter);
