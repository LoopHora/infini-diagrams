import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';

export class SvgExporter implements Exporter {
  format: ExportFormat = 'svg';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    const { svg, width, height } = input;
    const padding = options.padding ?? 20;

    let processedSvg = svg;

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

    // Add XML header if absent
    if (!processedSvg.startsWith('<?xml')) {
      processedSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${processedSvg}`;
    }

    return new Blob([processedSvg], { type: 'image/svg+xml;charset=utf-8' });
  }
}

export const svgExporter = new SvgExporter();
exporters.register(svgExporter);
