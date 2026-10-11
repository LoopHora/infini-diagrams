import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';
import { convertForeignObjectsToSvgText } from './PngExporter';

export class SvgExporter implements Exporter {
  format: ExportFormat = 'svg';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    const { svg, width, height } = input;
    const padding = options.padding ?? 20;

    let processedSvg = svg.trim();

    // Fix unclosed void HTML tags inside foreignObject/HTML labels
    processedSvg = processedSvg.replace(/<br(?:\s*|\s+[^>]*?)>/gi, (match) => {
      return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
    });
    processedSvg = processedSvg.replace(/<hr(?:\s*|\s+[^>]*?)>/gi, (match) => {
      return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
    });
    processedSvg = processedSvg.replace(/<img(?:\s+[^>]*?)>/gi, (match) => {
      return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
    });
    processedSvg = processedSvg.replace(/<input(?:\s+[^>]*?)>/gi, (match) => {
      return match.endsWith('/>') ? match : match.replace(/>$/, '/>');
    });

    // Replace named HTML entities with numeric XML entities
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
      processedSvg = processedSvg.split(entity).join(replacement);
    }

    // Escape stray unescaped ampersands
    processedSvg = processedSvg.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

    // Convert foreignObject to native SVG text for universal vector editor (Figma, Illustrator) compatibility
    const defaultTextColor = options.backgroundType === 'white' ? '#1f2328' : '#e6edf3';
    processedSvg = convertForeignObjectsToSvgText(processedSvg, defaultTextColor);

    // Determine background color
    let bgColor: string | null = null;
    if (options.backgroundType === 'white') bgColor = '#ffffff';
    else if (options.backgroundType === 'dark') bgColor = '#121214';
    else if (options.backgroundType === 'custom' && options.customBackgroundColor) {
      bgColor = options.customBackgroundColor;
    }

    // Embed background rect if specified
    if (bgColor) {
      const bgRect = `<rect width="100%" height="100%" fill="${bgColor}" />`;
      processedSvg = processedSvg.replace(/<svg\b([^>]*)>/i, `<svg $1>${bgRect}`);
    }

    // Ensure standard XML declaration & namespace
    if (!processedSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      processedSvg = processedSvg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!processedSvg.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
      processedSvg = processedSvg.replace(/<svg\b/i, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add XML header if absent
    if (!processedSvg.startsWith('<?xml')) {
      processedSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${processedSvg}`;
    }

    return new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
  }
}

export const svgExporter = new SvgExporter();
exporters.register(svgExporter);
