import { Exporter, ExportInput, exporters } from './Exporter';
import { ExportFormat, ExportOptions } from '../../types';

export class MmdExporter implements Exporter {
  format: ExportFormat = 'mmd';

  async export(input: ExportInput, options: ExportOptions): Promise<Blob> {
    return new Blob([input.source], { type: 'text/plain;charset=utf-8' });
  }
}

export const mmdExporter = new MmdExporter();
exporters.register(mmdExporter);
