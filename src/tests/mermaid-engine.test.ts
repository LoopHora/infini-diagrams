import { describe, it, expect } from 'vitest';
import { mermaidEngine } from '../engine/diagram/MermaidEngine';

describe('MermaidEngine Architecture Suite', () => {
  it('correctly identifies valid Mermaid keywords with canHandle()', () => {
    expect(mermaidEngine.canHandle('flowchart TD\nA-->B')).toBe(true);
    expect(mermaidEngine.canHandle('sequenceDiagram\nAlice->>Bob: Hello')).toBe(true);
    expect(mermaidEngine.canHandle('classDiagram\nclass Order')).toBe(true);
    expect(mermaidEngine.canHandle('stateDiagram-v2\n[*] --> Active')).toBe(true);
    expect(mermaidEngine.canHandle('erDiagram\nUSER ||--o{ ORDER : has')).toBe(true);
    expect(mermaidEngine.canHandle('gantt\ntitle Roadmap')).toBe(true);
    expect(mermaidEngine.canHandle('pie title Test\n"A": 50')).toBe(true);
    expect(mermaidEngine.canHandle('gitGraph\ncommit')).toBe(true);
    expect(mermaidEngine.canHandle('mindmap\nroot((Center))')).toBe(true);
    expect(mermaidEngine.canHandle('C4Context\ntitle Context')).toBe(true);
  });

  it('validates syntax correctly using validate()', async () => {
    const validResult = await mermaidEngine.validate('flowchart TD\nA-->B');
    expect(validResult.isValid).toBe(true);
    expect(validResult.diagnostics.length).toBe(0);

    const invalidResult = await mermaidEngine.validate('flowchart TD\nA====>>>??? invalid syntax');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.diagnostics.length).toBeGreaterThan(0);
    expect(invalidResult.diagnostics[0].message).toBeDefined();
  });

  it('rejects sources that exceed the maximum length limit safely', async () => {
    const hugeSource = 'graph TD\n' + 'A-->B\n'.repeat(25000);
    const result = await mermaidEngine.validate(hugeSource);
    expect(result.isValid).toBe(false);
    expect(result.diagnostics[0].message).toContain('exceeds maximum safe length');
  });
});
