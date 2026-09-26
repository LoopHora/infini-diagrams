import { describe, it, expect } from 'vitest';
import { FilenameService } from '../services/FilenameService';

describe('FilenameService - Anti-UUID Download Contract', () => {
  it('sanitizes standard titles into deterministic filenames', () => {
    expect(FilenameService.sanitizeFilename('system architecture', 'svg')).toBe('system-architecture.svg');
    expect(FilenameService.sanitizeFilename('Order Processing Flow', 'png')).toBe('Order-Processing-Flow.png');
    expect(FilenameService.sanitizeFilename('database schema', 'pdf')).toBe('database-schema.pdf');
    expect(FilenameService.sanitizeFilename('my_diagram', 'mmd')).toBe('my_diagram.mmd');
  });

  it('strips illegal characters from title according to security rules', () => {
    expect(FilenameService.sanitizeFilename('system: architecture / flow? *', 'svg')).toBe('system-architecture-flow.svg');
    expect(FilenameService.sanitizeFilename('path/traversal\\test', 'png')).toBe('path-traversal-test.png');
    expect(FilenameService.sanitizeFilename('<script>alert(1)</script>', 'svg')).toBe('script-alert(1)-script.svg');
  });

  it('falls back to "diagram.<extension>" when input title is empty or stripped', () => {
    expect(FilenameService.sanitizeFilename('', 'svg')).toBe('diagram.svg');
    expect(FilenameService.sanitizeFilename('   ', 'png')).toBe('diagram.png');
    expect(FilenameService.sanitizeFilename('---', 'pdf')).toBe('diagram.pdf');
  });

  it('rejects raw blob URLs or http URLs passed as titles', () => {
    expect(FilenameService.sanitizeFilename('blob:https://localhost:5173/12345', 'svg')).toBe('diagram.svg');
    expect(FilenameService.sanitizeFilename('data:image/svg+xml;base64,....', 'png')).toBe('diagram.png');
  });

  it('caps long filenames to 120 base characters', () => {
    const longName = 'a'.repeat(200);
    const result = FilenameService.sanitizeFilename(longName, 'svg');
    expect(result.length).toBe(124); // 120 + .svg
    expect(result.endsWith('.svg')).toBe(true);
  });

  it('validates anti-UUID compliance', () => {
    expect(FilenameService.isAntiUuidCompliant('system-architecture.svg')).toBe(true);
    expect(FilenameService.isAntiUuidCompliant('flowchart-v1.png')).toBe(true);
    // Should fail for UUIDs
    expect(FilenameService.isAntiUuidCompliant('7d4c2c5b-9c3d-4f8e-9d10-8b0b9736c4ad.png')).toBe(false);
    expect(FilenameService.isAntiUuidCompliant('download-7d4c2c5b-9c3d-4f8e-9d10-8b0b9736c4ad.svg')).toBe(false);
    // Should fail for blob URLs
    expect(FilenameService.isAntiUuidCompliant('blob:http://localhost:5173/test')).toBe(false);
  });
});
