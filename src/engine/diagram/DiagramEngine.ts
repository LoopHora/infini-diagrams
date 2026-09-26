import { DiagramEngine } from '../../types';

class DiagramEngineRegistry {
  private engines: Map<string, DiagramEngine> = new Map();

  register(engine: DiagramEngine): void {
    this.engines.set(engine.id, engine);
  }

  get(id: string): DiagramEngine | undefined {
    return this.engines.get(id);
  }

  getForSource(source: string): DiagramEngine | undefined {
    for (const engine of this.engines.values()) {
      if (engine.canHandle(source)) {
        return engine;
      }
    }
    // Default fallback to first registered engine (Mermaid)
    return this.engines.values().next().value;
  }

  getAll(): DiagramEngine[] {
    return Array.from(this.engines.values());
  }
}

export const diagramEngines = new DiagramEngineRegistry();
