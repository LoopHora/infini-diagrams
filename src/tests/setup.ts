import DOMPurify from 'dompurify';

// Polyfill DOMPurify methods when running in headless Node.js test environment
if (typeof (DOMPurify as any).addHook !== 'function') {
  (DOMPurify as any).addHook = () => {};
}
if (typeof (DOMPurify as any).sanitize !== 'function') {
  (DOMPurify as any).sanitize = (s: string) => s;
}
if (typeof (DOMPurify as any).removeHook !== 'function') {
  (DOMPurify as any).removeHook = () => {};
}
if (typeof (DOMPurify as any).clearAllHooks !== 'function') {
  (DOMPurify as any).clearAllHooks = () => {};
}

// Polyfill localStorage in test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => { store.set(key, String(val)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
