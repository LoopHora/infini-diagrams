import { ExportFormat, ExportOptions } from '../../types';

export interface ExportInput {
  svg: string;
  source: string;
  width: number;
  height: number;
}

export interface Exporter {
  format: ExportFormat;
  export(input: ExportInput, options: ExportOptions): Promise<Blob>;
}

class ExporterRegistry {
  private exporters: Map<ExportFormat, Exporter> = new Map();

  register(exporter: Exporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  get(format: ExportFormat): Exporter | undefined {
    return this.exporters.get(format);
  }
}

export const exporters = new ExporterRegistry();
