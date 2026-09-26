import mermaid from 'mermaid';
import { DiagramEngine, RenderOptions, RenderResult, ValidationResult } from '../../types';
import { diagramEngines } from './DiagramEngine';

const MAX_SOURCE_LENGTH = 100000;
let mermaidInitialized = false;

export class MermaidEngine implements DiagramEngine {
  id = 'mermaid';
  name = 'Mermaid.js Core';

  constructor() {
    this.initMermaid('default');
  }

  private initMermaid(theme: string = 'default') {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict', // Strictly isolate diagram content
      theme: theme as any,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      suppressErrorRendering: true,
      logLevel: 'error',
    });
    mermaidInitialized = true;
  }

  canHandle(source: string): boolean {
    const trimmed = source.trim();
    if (!trimmed) return true;

    // Detect common Mermaid keywords
    const keywords = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram',
      'stateDiagram-v2', 'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey',
      'mindmap', 'timeline', 'quadrantChart', 'sankey-beta', 'block-beta',
      'architecture-beta', 'packet-beta', 'requirementDiagram', 'C4Context',
      'C4Container', 'C4Component', 'C4Deployment', 'kanban'
    ];

    return keywords.some(k => trimmed.startsWith(k) || trimmed.startsWith('%%') || trimmed.includes(k));
  }

  async validate(source: string): Promise<ValidationResult> {
    const trimmed = source.trim();
    if (!trimmed) {
      return { isValid: true, diagnostics: [] };
    }

    if (source.length > MAX_SOURCE_LENGTH) {
      return {
        isValid: false,
        diagnostics: [{
          level: 'error',
          message: `Source exceeds maximum safe length limit of ${MAX_SOURCE_LENGTH.toLocaleString()} characters.`,
        }]
      };
    }

    try {
      await mermaid.parse(source);
      return { isValid: true, diagnostics: [] };
    } catch (err: any) {
      const parsed = this.parseErrorDetails(err);
      return {
        isValid: false,
        diagnostics: [{
          level: 'error',
          message: parsed.message,
          line: parsed.line,
          column: parsed.column,
        }]
      };
    }
  }

  async render(source: string, options: RenderOptions = {}): Promise<RenderResult> {
    const trimmed = source.trim();
    if (!trimmed) {
      return { svg: '', width: 0, height: 0, isError: false };
    }

    if (source.length > MAX_SOURCE_LENGTH) {
      return {
        svg: '',
        width: 0,
        height: 0,
        isError: true,
        errorMessage: `Source size (${source.length} chars) exceeds maximum safety limit of ${MAX_SOURCE_LENGTH}.`
      };
    }

    const theme = options.theme || 'default';
    this.initMermaid(theme);

    // Create unique deterministic ID for render container
    const renderId = `mermaid-render-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      // Mermaid render returns { svg, bindFunctions }
      const { svg: rawSvg } = await mermaid.render(renderId, source);

      // Sanitize SVG according to security policy
      const sanitizedSvg = this.sanitizeSvg(rawSvg);

      // Calculate dimensions from viewBox or width/height attributes
      const { width, height } = this.extractSvgDimensions(sanitizedSvg);

      return {
        svg: sanitizedSvg,
        width,
        height,
        isError: false
      };
    } catch (err: any) {
      // Clean up any lingering error element mermaid might have appended to DOM
      const errorEl = document.getElementById(renderId) || document.getElementById(`d${renderId}`);
      if (errorEl) {
        errorEl.remove();
      }

      const parsed = this.parseErrorDetails(err);
      return {
        svg: '',
        width: 0,
        height: 0,
        isError: true,
        errorMessage: parsed.message,
        errorLine: parsed.line,
        errorColumn: parsed.column
      };
    }
  }

  private parseErrorDetails(err: any): { message: string; line?: number; column?: number } {
    const msg = err?.message || String(err) || 'Mermaid syntax error';

    // Parse line and column from Mermaid parser error formats
    // e.g. "Parse error on line 4: ... Expecting 'EOF', got 'IDENTIFIER'"
    let line: number | undefined;
    let column: number | undefined;

    const lineMatch = msg.match(/line\s+(\d+)/i) || msg.match(/:(\d+):(\d+)/);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    }
    const colMatch = msg.match(/column\s+(\d+)/i) || (lineMatch && lineMatch[2] ? lineMatch : null);
    if (colMatch && colMatch[2]) {
      column = parseInt(colMatch[2], 10);
    }

    // Clean up error message to be readable and user friendly
    const cleanMsg = msg
      .replace(/^Error:\s*/i, '')
      .replace(/hash:\s*\{.*\}$/s, '')
      .trim();

    return {
      message: cleanMsg,
      line,
      column
    };
  }

  /**
   * Sanitizes SVG to ensure it contains no executable scripts or malicious attributes.
   */
  private sanitizeSvg(svg: string): string {
    return svg
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+="[^"]*"/gi, '')
      .replace(/\s+on\w+='[^']*'/gi, '')
      .replace(/href="javascript:[^"]*"/gi, 'href="#"')
      .replace(/href='javascript:[^']*'/gi, 'href="#"');
  }

  /**
   * Extracts width and height from SVG viewBox or width/height attributes.
   */
  private extractSvgDimensions(svg: string): { width: number; height: number } {
    let width = 800;
    let height = 600;

    // Check viewBox first
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
      if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
      }
    }

    // Fallback to width and height attributes
    const widthMatch = svg.match(/width="([0-9.]+)(?:px)?"/i);
    const heightMatch = svg.match(/height="([0-9.]+)(?:px)?"/i);
    if (widthMatch) width = Math.round(parseFloat(widthMatch[1]));
    if (heightMatch) height = Math.round(parseFloat(heightMatch[1]));

    return { width, height };
  }
}

export const mermaidEngine = new MermaidEngine();
diagramEngines.register(mermaidEngine);
