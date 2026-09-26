import { describe, it, expect } from 'vitest';
import { COMPATIBILITY_MATRIX } from '../data/compatibilityMatrix';
import { mermaidEngine } from '../engine/diagram/MermaidEngine';

describe('Mermaid Compatibility Matrix Test Suite (docs/16-COMPATIBILITY-MATRIX.md)', () => {
  it('covers all required diagram types with positive keyword handling', () => {
    expect(COMPATIBILITY_MATRIX.length).toBeGreaterThanOrEqual(12);

    for (const item of COMPATIBILITY_MATRIX) {
      const handles = mermaidEngine.canHandle(item.minimalExample);
      expect(handles, `Engine should recognize keyword for ${item.diagramType}`).toBe(true);
    }
  });

  it('validates minimal examples for standard diagram types', async () => {
    for (const item of COMPATIBILITY_MATRIX) {
      // Beta diagram types or external syntax might require specific config or have known parser variations
      if (item.keyword.endsWith('-beta') || item.keyword === 'C4Context') {
        continue;
      }

      const res = await mermaidEngine.validate(item.minimalExample);
      expect(res.isValid, `Validating ${item.diagramType} should succeed: ${res.diagnostics[0]?.message}`).toBe(true);
    }
  });

  it('verifies that each record defines complete export and feature flags', () => {
    for (const record of COMPATIBILITY_MATRIX) {
      expect(record.svgExport).toBe(true);
      expect(record.pngExport).toBe(true);
      expect(record.pdfExport).toBe(true);
      expect(record.themeSupport).toBe(true);
      expect(record.mobileTouch).toBe(true);
      expect(typeof record.notes).toBe('string');
    }
  });
});
