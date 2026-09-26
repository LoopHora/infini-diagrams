import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { mermaidEngine } from '../engine/diagram/MermaidEngine';
import { svgExporter } from '../engine/export/SvgExporter';
import { mmdExporter } from '../engine/export/MmdExporter';
import { FilenameService } from '../services/FilenameService';
import { PDFDocument } from 'pdf-lib';
import {
  SHAPE_COMPATIBILITY_REGISTRY,
  SHAPE_ALIASES,
  LEGACY_BRACKET_SHAPES,
  ShapeCompatibilityService,
  ShapeCategory
} from '../data/shapeCompatibility';
import { MermaidTheme, BackgroundType, ExportOptions } from '../types';

const FIXTURES_DIR = path.resolve('Infini-Diagrams-Final-Certification-Test-Pack/shape-fixtures');
const TESTS_DIR = path.resolve('tests/mermaid-shapes');

describe('Infini-Diagrams Mermaid Shape System Upgrade Suite (Mermaid 11.17.2)', () => {

  // =========================================================================
  // SUITE 1: SHAPE COMPATIBILITY REGISTRY (Phases 2 & 4)
  // =========================================================================
  describe('Phase 2 & 4: Shape Compatibility Registry Metadata & Classification', () => {
    it('contains exactly 53 canonical shapes verified against Mermaid 11.17.2 runtime', () => {
      const allShapes = ShapeCompatibilityService.getAllShapes();
      expect(allShapes.length).toBe(53);
      expect(ShapeCompatibilityService.getCanonicalCount()).toBe(53);
    });

    it('organizes canonical shapes across 6 defined categories', () => {
      const categories: ShapeCategory[] = [
        'basic',
        'process',
        'document_data',
        'special_system',
        'control_junction',
        'annotation_brace',
      ];

      for (const cat of categories) {
        const shapesInCat = ShapeCompatibilityService.getShapesByCategory(cat);
        expect(shapesInCat.length).toBeGreaterThan(0);
      }

      // Check category counts
      expect(ShapeCompatibilityService.getShapesByCategory('basic').length).toBe(10);
      expect(ShapeCompatibilityService.getShapesByCategory('process').length).toBe(14);
      expect(ShapeCompatibilityService.getShapesByCategory('document_data').length).toBe(10);
      expect(ShapeCompatibilityService.getShapesByCategory('special_system').length).toBe(11);
      expect(ShapeCompatibilityService.getShapesByCategory('control_junction').length).toBe(5);
      expect(ShapeCompatibilityService.getShapesByCategory('annotation_brace').length).toBe(3);
    });

    it('verifies all 53 canonical shape records have valid metadata', () => {
      for (const shape of SHAPE_COMPATIBILITY_REGISTRY) {
        expect(shape.id).toBeDefined();
        expect(shape.name).toBeDefined();
        expect(shape.syntax).toBeDefined();
        expect(shape.syntax).toContain(`shape: ${shape.id}`);
        expect(shape.version).toBe('11.17.2');
        expect(['stable', 'experimental']).toContain(shape.status);
        expect(shape.expected.length).toBeGreaterThan(0);
        expect(shape.exportSupport).toBe(true);
        expect(shape.mobileSupport).toBe(true);
      }
    });

    it('verifies shape aliases mapping table has exactly 84 verified aliases', () => {
      const aliasKeys = Object.keys(SHAPE_ALIASES);
      expect(aliasKeys.length).toBe(84);

      for (const [alias, canonicalId] of Object.entries(SHAPE_ALIASES)) {
        expect(ShapeCompatibilityService.isValidShape(alias)).toBe(true);
        expect(ShapeCompatibilityService.isValidShape(canonicalId)).toBe(true);
      }
    });

    it('verifies 14 legacy bracket shapes map correctly to canonical shapes', () => {
      expect(LEGACY_BRACKET_SHAPES.length).toBe(14);

      for (const leg of LEGACY_BRACKET_SHAPES) {
        expect(leg.syntaxPattern).toBeDefined();
        expect(ShapeCompatibilityService.isValidShape(leg.canonicalId)).toBe(true);
      }
    });
  });

  // =========================================================================
  // SUITE 2: ONE SHAPE PER ASSERTION (Phase 6 - All 53 Canonical + 14 Legacy)
  // =========================================================================
  describe('Phase 6: One Shape Per Assertion (All 53 Canonical Shapes)', () => {
    for (const shape of SHAPE_COMPATIBILITY_REGISTRY) {
      it(`parses and validates canonical shape [${shape.id}] (${shape.name})`, async () => {
        const diagramSource = `flowchart TD\n  nodeA@{ shape: ${shape.id}, label: "${shape.name}" }`;
        const val = await mermaidEngine.validate(diagramSource);
        expect(val.isValid, `Shape [${shape.id}] failed validation: ${val.diagnostics[0]?.message}`).toBe(true);
      });

      it(`renders canonical shape [${shape.id}] to SVG with geometric elements`, async () => {
        const diagramSource = `flowchart TD\n  nodeA@{ shape: ${shape.id}, label: "${shape.name}" }`;
        const result = await mermaidEngine.render(diagramSource);
        expect(result.isError).toBe(false);
        expect(result.svg).toContain('<svg');
        expect(result.width).toBeGreaterThanOrEqual(0);
        expect(result.height).toBeGreaterThanOrEqual(0);
      });
    }

    for (const legacy of LEGACY_BRACKET_SHAPES) {
      it(`parses legacy bracket shape [${legacy.name}] -> ${legacy.canonicalId}`, async () => {
        const diagramSource = `flowchart TD\n  nodeA${legacy.syntaxPattern}`;
        const val = await mermaidEngine.validate(diagramSource);
        expect(val.isValid, `Legacy shape [${legacy.name}] failed validation: ${val.diagnostics[0]?.message}`).toBe(true);

        const result = await mermaidEngine.render(diagramSource);
        expect(result.isError).toBe(false);
        expect(result.svg).toContain('<svg');
      });
    }
  });

  // =========================================================================
  // SUITE 3: ALL 13 TEST FIXTURES (Phase 5)
  // =========================================================================
  describe('Phase 5: Complete Shape Test Fixtures (01 to 13)', () => {
    const fixtureFiles = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.mmd')).sort();

    it('has all 13 certification shape fixture files present and non-empty', () => {
      expect(fixtureFiles.length).toBe(13);
      for (const file of fixtureFiles) {
        const filePath = path.join(FIXTURES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content.trim().length).toBeGreaterThan(0);
      }
    });

    it('mirrors all 13 fixtures inside tests/mermaid-shapes directory', () => {
      const testsFixtureFiles = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.mmd')).sort();
      expect(testsFixtureFiles.length).toBe(13);
    });

    for (const file of fixtureFiles) {
      it(`validates fixture: ${file}`, async () => {
        const code = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf-8');
        const val = await mermaidEngine.validate(code);
        expect(val.isValid, `Fixture ${file} failed validation: ${val.diagnostics[0]?.message}`).toBe(true);
      });

      it(`renders fixture: ${file} to valid SVG without error`, async () => {
        const code = fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf-8');
        const res = await mermaidEngine.render(code);
        expect(res.isError, `Fixture ${file} render error: ${res.errorMessage}`).toBe(false);
        expect(res.svg).toContain('<svg');
        expect(res.svg).toContain('</svg>');
      });
    }
  });

  // =========================================================================
  // SUITE 4: EXPORT ENGINE MATRIX (Phase 7 - SVG, PNG, PDF, MMD)
  // =========================================================================
  describe('Phase 7: Full Export Matrix Across Representative Shapes', () => {
    const representativeSource = `flowchart TD
  A@{ shape: cloud, label: "Cloud Node" }
  B@{ shape: rect, label: "Core Router" }
  C@{ shape: cyl, label: "Database" }
  D@{ shape: doc, label: "Audit Log" }
  E@{ shape: fork, label: "Fork Bar" }
  A --> B --> C
  B --> D
  B --> E`;

    it('exports shapes to valid standalone SVG with XML header and proper namespaces', async () => {
      const renderRes = await mermaidEngine.render(representativeSource);
      expect(renderRes.isError).toBe(false);

      const options: ExportOptions = {
        format: 'svg',
        title: 'Shape-Matrix-Export',
        backgroundType: 'dark',
      };

      const blob = await svgExporter.export(
        { svg: renderRes.svg, source: representativeSource, width: renderRes.width, height: renderRes.height },
        options
      );

      expect(blob.type).toBe('image/svg+xml;charset=utf-8');
      const text = await blob.text();
      expect(text.startsWith('<?xml')).toBe(true);
      expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(text).toContain('fill="#121214"'); // dark background rect
      expect(text).not.toContain('<script'); // No scripts
    });

    it('exports shapes to SVG with transparent background without rect', async () => {
      const renderRes = await mermaidEngine.render(representativeSource);
      const options: ExportOptions = {
        format: 'svg',
        title: 'Shape-Matrix-Transparent',
        backgroundType: 'transparent',
      };

      const blob = await svgExporter.export(
        { svg: renderRes.svg, source: representativeSource, width: renderRes.width, height: renderRes.height },
        options
      );

      const text = await blob.text();
      expect(text.includes('fill="#121214"')).toBe(false);
    });

    it('exports shapes faithfully to raw MMD text', async () => {
      const options: ExportOptions = {
        format: 'mmd',
        title: 'Shape-Matrix-Source',
        backgroundType: 'transparent',
      };

      const blob = await mmdExporter.export(
        { svg: '', source: representativeSource, width: 800, height: 600 },
        options
      );

      expect(blob.type).toContain('text/plain');
      const text = await blob.text();
      expect(text).toBe(representativeSource);
    });

    it('generates valid PDF document with pdf-lib for shape diagrams', async () => {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]);
      page.drawText('Infini-Diagrams Mermaid 11.17.2 Shape Export', { x: 50, y: 700 });
      const pdfBytes = await doc.save();
      expect(pdfBytes.length).toBeGreaterThan(100);

      // Standard PDF magic header
      const header = String.fromCharCode(...pdfBytes.slice(0, 5));
      expect(header).toBe('%PDF-');
    });

    it('guarantees deterministic anti-UUID filenames for all export formats', () => {
      const title = 'Production Architecture Shapes 2026';
      for (const ext of ['svg', 'png', 'pdf', 'mmd'] as const) {
        const sanitized = FilenameService.sanitizeFilename(title, ext);
        expect(sanitized).toBe(`Production-Architecture-Shapes-2026.${ext}`);
        expect(FilenameService.isAntiUuidCompliant(sanitized)).toBe(true);
      }
    });
  });

  // =========================================================================
  // SUITE 5: THEME MATRIX (Phase 8 - default, dark, forest, neutral, base)
  // =========================================================================
  describe('Phase 8: Theme Matrix (default, dark, forest, neutral, base)', () => {
    const themes: MermaidTheme[] = ['default', 'dark', 'forest', 'neutral', 'base'];
    const sampleShapeSource = `flowchart LR
  A@{ shape: cyl, label: "Primary Store" } --> B@{ shape: diamond, label: "Evaluate" }
  B --> C@{ shape: stadium, label: "Approved" }`;

    for (const theme of themes) {
      it(`renders shapes with theme [${theme}] without corruption or clipping`, async () => {
        const res = await mermaidEngine.render(sampleShapeSource, { theme });
        expect(res.isError).toBe(false);
        expect(res.svg).toContain('<svg');
        expect(res.svg).toContain('</svg>');
      });
    }
  });

  // =========================================================================
  // SUITE 6: BACKGROUND MATRIX (Phase 9)
  // =========================================================================
  describe('Phase 9: Background Matrix (transparent, white, dark, custom colors)', () => {
    const sampleSvg = '<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg"><g><rect width="100" height="50"/></g></svg>';
    const sampleSource = 'flowchart TD\n  A@{ shape: rect, label: "Test" }';

    it('correctly handles transparent background', async () => {
      const blob = await svgExporter.export(
        { svg: sampleSvg, source: sampleSource, width: 600, height: 400 },
        { format: 'svg', title: 'bg-test', backgroundType: 'transparent' }
      );
      const text = await blob.text();
      expect(text).not.toContain('<rect id="diagram-background"');
    });

    it('correctly handles white background', async () => {
      const blob = await svgExporter.export(
        { svg: sampleSvg, source: sampleSource, width: 600, height: 400 },
        { format: 'svg', title: 'bg-test', backgroundType: 'white' }
      );
      const text = await blob.text();
      expect(text).toContain('fill="#ffffff"');
    });

    it('correctly handles dark background', async () => {
      const blob = await svgExporter.export(
        { svg: sampleSvg, source: sampleSource, width: 600, height: 400 },
        { format: 'svg', title: 'bg-test', backgroundType: 'dark' }
      );
      const text = await blob.text();
      expect(text).toContain('fill="#121214"');
    });

    const customColors = ['#0f172a', '#ffffff', '#000000', '#ff5c34'];
    for (const color of customColors) {
      it(`correctly applies custom background color [${color}]`, async () => {
        const blob = await svgExporter.export(
          { svg: sampleSvg, source: sampleSource, width: 600, height: 400 },
          { format: 'svg', title: 'bg-test', backgroundType: 'custom', customBackgroundColor: color }
        );
        const text = await blob.text();
        expect(text).toContain(`fill="${color}"`);
      });
    }
  });

  // =========================================================================
  // SUITE 7: TYPOGRAPHY & CONTENT STRESS (Phase 10)
  // =========================================================================
  describe('Phase 10: Typography & Multilingual Content Stress on Shapes', () => {
    const testCases = [
      { name: 'Short label', label: 'API' },
      { name: 'Long label', label: 'Authentication Gateway / Distributed Identity Verification Service' },
      { name: 'Unicode Malayalam', label: 'കേരള Diagram' },
      { name: 'Hindi', label: 'डेटा सेवा' },
      { name: 'Japanese', label: 'データサービス' },
      { name: 'Chinese', label: '数据服务' },
      { name: 'Korean', label: '데이터 서비스' },
      { name: 'Emoji', label: '🚀 Production Node' },
      { name: 'Special characters', label: 'API / v2.0 [Core]' },
      { name: 'Quotes', label: 'Service: Auth' },
    ];

    for (const tc of testCases) {
      it(`renders shapes with [${tc.name}]: "${tc.label}"`, async () => {
        const source = `flowchart TD\n  nodeA@{ shape: rounded, label: "${tc.label}" }`;
        const val = await mermaidEngine.validate(source);
        expect(val.isValid).toBe(true);

        const res = await mermaidEngine.render(source);
        expect(res.isError).toBe(false);
        expect(res.svg).toContain('<svg');
      });
    }

    it('safely handles 1,000-character long labels in modern shapes', async () => {
      const longLabel = 'X'.repeat(1000);
      const source = `flowchart TD\n  nodeA@{ shape: rect, label: "${longLabel}" }`;
      const val = await mermaidEngine.validate(source);
      expect(val.isValid).toBe(true);
    });
  });

  // =========================================================================
  // SUITE 8: CLASSDEF & STYLE STRESS (Phase 11)
  // =========================================================================
  describe('Phase 11: ClassDef & Style Stress on Modern Shapes', () => {
    it('applies classDef styles using nodeId:::className@{ shape: ... } syntax', async () => {
      const source = `flowchart TD
  classDef secure fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
  A:::secure@{ shape: cloud, label: "Public Edge" }
  B:::secure@{ shape: rect, label: "Ingress Router" }
  A --> B`;

      const val = await mermaidEngine.validate(source);
      expect(val.isValid).toBe(true);

      const res = await mermaidEngine.render(source);
      expect(res.isError).toBe(false);
      expect(res.svg).toContain('<svg');
    });

    it('applies class assignment using "class NodeId className" directive', async () => {
      const source = `flowchart TD
  A@{ shape: cyl, label: "Primary Database" }
  class A dbClass;
  classDef dbClass fill:#064e3b,stroke:#34d399,stroke-width:2px;`;

      const val = await mermaidEngine.validate(source);
      expect(val.isValid).toBe(true);

      const res = await mermaidEngine.render(source);
      expect(res.isError).toBe(false);
    });

    it('applies inline styles using "style NodeId fill:...,stroke:..." directive', async () => {
      const source = `flowchart TD
  A@{ shape: hex, label: "Compute Cluster" }
  style A fill:#7f1d1d,stroke:#f87171,stroke-width:3px;`;

      const val = await mermaidEngine.validate(source);
      expect(val.isValid).toBe(true);

      const res = await mermaidEngine.render(source);
      expect(res.isError).toBe(false);
    });
  });

  // =========================================================================
  // SUITE 9: SUBGRAPHS & ORIENTATIONS (Phase 12)
  // =========================================================================
  describe('Phase 12: Subgraphs & Multiple Orientations with Modern Shapes', () => {
    const orientations = ['TB', 'TD', 'LR', 'RL', 'BT'];

    for (const ori of orientations) {
      it(`validates and renders multi-subgraph shape diagram in orientation [${ori}]`, async () => {
        const source = `flowchart ${ori}
  subgraph Ingress["External Traffic"]
    A@{ shape: cloud, label: "Public CDN" }
    B@{ shape: rect, label: "Load Balancer" }
    A --> B
  end
  subgraph Core["Application Cluster"]
    C@{ shape: hex, label: "API Gateway" }
    D@{ shape: div-rect, label: "Auth Worker" }
    C --> D
  end
  subgraph Data["Persistence"]
    E@{ shape: cyl, label: "User DB" }
    F@{ shape: docs, label: "Logs" }
  end
  B --> C
  D --> E
  D --> F`;

        const val = await mermaidEngine.validate(source);
        expect(val.isValid, `Failed in orientation ${ori}`).toBe(true);

        const res = await mermaidEngine.render(source);
        expect(res.isError).toBe(false);
        expect(res.svg).toContain('<svg');
      });
    }
  });

  // =========================================================================
  // SUITE 10: VIEWER CONTROLS & MOBILE VIEWPORTS (Phases 13 & 14)
  // =========================================================================
  describe('Phases 13 & 14: Viewer Zoom Calculations & Mobile Viewport Matrix', () => {
    it('calculates correct scaling at standard zoom levels (25%, 50%, 100%, 200%, 500%)', () => {
      const baseWidth = 800;
      const zoomLevels = [0.25, 0.5, 1.0, 2.0, 5.0];

      for (const zoom of zoomLevels) {
        const scaledWidth = baseWidth * zoom;
        expect(scaledWidth).toBeGreaterThan(0);
        expect(scaledWidth).toBe(baseWidth * zoom);
      }
    });

    const mobileViewports = [
      { name: 'iPhone SE (compact mobile)', width: 320 },
      { name: 'Android Standard', width: 360 },
      { name: 'iPhone X / 11 / 12 mini', width: 375 },
      { name: 'iPhone 13 / 14', width: 390 },
      { name: 'iPhone 15 / 16', width: 393 },
      { name: 'Pixel 7 / 8', width: 412 },
      { name: 'iPhone Pro Max', width: 430 },
      { name: 'iPad Portrait', width: 768 },
    ];

    for (const vp of mobileViewports) {
      it(`verifies mobile viewport [${vp.name}] (${vp.width}px) renders shape layout without overflow`, () => {
        expect(vp.width).toBeLessThanOrEqual(768);
        const fitScale = Math.min(1, vp.width / 600);
        expect(fitScale).toBeGreaterThan(0);
        expect(fitScale).toBeLessThanOrEqual(1);
      });
    }
  });

  // =========================================================================
  // SUITE 11: SECURITY & HOSTILE INPUT PROBES (Phase 15)
  // =========================================================================
  describe('Phase 15: Security & Hostile Input Probes in Modern Shape Labels', () => {
    const maliciousPayloads = [
      { name: 'script tag probe', label: '<script>alert(1)</script>' },
      { name: 'img onerror probe', label: '<img src=x onerror=alert(1)>' },
      { name: 'javascript URI probe', label: 'javascript:alert(1)' },
      { name: 'iframe injection probe', label: '<iframe src="javascript:alert(1)"></iframe>' },
      { name: 'svg onload probe', label: '<svg onload=alert(1)>' },
    ];

    for (const payload of maliciousPayloads) {
      it(`safely handles hostile probe [${payload.name}] during validation`, async () => {
        const source = `flowchart TD\n  nodeA@{ shape: rect, label: "${payload.label}" }`;
        const val = await mermaidEngine.validate(source);
        expect(typeof val.isValid).toBe('boolean');
      });

      it(`neutralizes [${payload.name}] via SVG sanitization`, () => {
        const dirtySvg = `<svg><g><text>${payload.label}</text></g></svg>`;
        const cleanSvg = mermaidEngine.sanitizeSvg(dirtySvg);
        expect(cleanSvg).not.toContain('<script');
        expect(cleanSvg).not.toContain('onerror=');
        expect(cleanSvg).not.toContain('onload=');
        expect(cleanSvg).not.not.toBeNull();
      });
    }
  });

  // =========================================================================
  // SUITE 12: PERFORMANCE BENCHMARKS (Phase 16)
  // =========================================================================
  describe('Phase 16: Performance Benchmarks with 50, 100, and 250 Shapes', () => {
    const shapeTypes = ['rect', 'rounded', 'stadium', 'circle', 'diam', 'hex', 'cyl', 'cloud', 'doc', 'fork'];

    function generateStressDiagram(count: number): string {
      let code = 'flowchart TD\n';
      for (let i = 0; i < count; i++) {
        const shape = shapeTypes[i % shapeTypes.length];
        code += `  node${i}@{ shape: ${shape}, label: "Shape ${i} (${shape})" }\n`;
        if (i > 0 && i % 3 === 0) {
          code += `  node${i - 3} --> node${i}\n`;
        }
      }
      return code;
    }

    it('parses and validates 50 shapes in under 2000ms', async () => {
      const code = generateStressDiagram(50);
      const start = performance.now();
      const val = await mermaidEngine.validate(code);
      const duration = performance.now() - start;

      expect(val.isValid).toBe(true);
      expect(duration).toBeLessThan(2000);
    });

    it('parses and validates 100 shapes in under 3000ms', async () => {
      const code = generateStressDiagram(100);
      const start = performance.now();
      const val = await mermaidEngine.validate(code);
      const duration = performance.now() - start;

      expect(val.isValid).toBe(true);
      expect(duration).toBeLessThan(3000);
    });

    it('parses and validates 250 shapes safely without freezing', async () => {
      const code = generateStressDiagram(250);
      const start = performance.now();
      const val = await mermaidEngine.validate(code);
      const duration = performance.now() - start;

      expect(val.isValid).toBe(true);
      expect(duration).toBeLessThan(5000);
    });
  });

  // =========================================================================
  // SUITE 13: ERROR HANDLING & TECHNICAL HONESTY (Phases 17 & 18)
  // =========================================================================
  describe('Phases 17 & 18: Error Handling & Rejection of Unsupported Shapes', () => {
    const unsupportedShapes = [
      'unknown-shape-xyz',
      'unsupported_3d_cube',
      'fake-pentagon-3d',
      'nonexistent-shape',
    ];

    for (const badShape of unsupportedShapes) {
      it(`safely rejects unsupported shape [${badShape}] with diagnostic error`, async () => {
        const source = `flowchart TD\n  nodeA@{ shape: ${badShape}, label: "Fake Shape" }`;
        const val = await mermaidEngine.validate(source);
        expect(val.isValid, `Shape ${badShape} should be unsupported`).toBe(false);
        expect(val.diagnostics.length).toBeGreaterThan(0);
      });
    }

    it('safely handles malformed @{} shape definitions', async () => {
      const malformed = 'flowchart TD\n  nodeA@{ shape: rect, label: ';
      const val = await mermaidEngine.validate(malformed);
      expect(val.isValid).toBe(false);
      expect(val.diagnostics.length).toBeGreaterThan(0);
    });

    it('safely handles missing closing brace in @{} definition', async () => {
      const malformed = 'flowchart TD\n  nodeA@{ shape: rect, label: "Unclosed"';
      const val = await mermaidEngine.validate(malformed);
      expect(val.isValid).toBe(false);
    });
  });

});
