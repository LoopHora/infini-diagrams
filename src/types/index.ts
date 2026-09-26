export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base';

export type BackgroundType = 'transparent' | 'white' | 'dark' | 'custom';

export interface PresentationSettings {
  theme: MermaidTheme;
  backgroundType: BackgroundType;
  customBackgroundColor: string;
  padding: number;
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  isError: boolean;
  errorMessage?: string;
  errorLine?: number;
  errorColumn?: number;
}

export interface ValidationDiagnostic {
  message: string;
  line?: number;
  column?: number;
  level: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  diagnostics: ValidationDiagnostic[];
}

export interface RenderOptions {
  theme?: MermaidTheme;
  securityLevel?: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  backgroundColor?: string;
}

export interface DiagramEngine {
  id: string;
  name: string;
  canHandle(source: string): boolean;
  render(source: string, options: RenderOptions): Promise<RenderResult>;
  validate(source: string): Promise<ValidationResult>;
}

export type ExportFormat = 'svg' | 'png' | 'pdf' | 'mmd';

export type PngScale = 1 | 2 | 3 | 4;

export type PdfPageSize = 'fit' | 'a4' | 'letter';

export type PdfOrientation = 'portrait' | 'landscape';

export interface ExportOptions {
  format: ExportFormat;
  title: string;
  scale?: PngScale;
  pdfPageSize?: PdfPageSize;
  pdfOrientation?: PdfOrientation;
  backgroundType: BackgroundType;
  customBackgroundColor?: string;
  padding?: number;
}

export interface DocumentRevision {
  id: string;
  documentId: string;
  timestamp: number;
  source: string;
  title: string;
}

export interface DiagramDocument {
  id: string;
  title: string;
  source: string;
  createdAt: number;
  updatedAt: number;
  presentation: PresentationSettings;
  lastValidSvg?: string;
  lastValidWidth?: number;
  lastValidHeight?: number;
}

export interface DiagramTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  source: string;
}
