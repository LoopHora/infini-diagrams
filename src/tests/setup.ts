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

(globalThis as any).DOMPurify = DOMPurify;
(globalThis as any).window.DOMPurify = DOMPurify;

// Polyfill SVGElement layout methods in JSDOM environment
const polyfillBBox = () => ({
  x: 0,
  y: 0,
  width: 100,
  height: 40,
  top: 0,
  right: 100,
  bottom: 40,
  left: 0,
});

const polyfillCTM = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });

if (typeof SVGElement !== 'undefined') {
  if (!(SVGElement.prototype as any).getBBox) {
    (SVGElement.prototype as any).getBBox = polyfillBBox;
  }
  if (!(SVGElement.prototype as any).getScreenCTM) {
    (SVGElement.prototype as any).getScreenCTM = polyfillCTM;
  }
}

if (typeof window !== 'undefined' && (window as any).SVGElement) {
  if (!(window as any).SVGElement.prototype.getBBox) {
    (window as any).SVGElement.prototype.getBBox = polyfillBBox;
  }
  if (!(window as any).SVGElement.prototype.getScreenCTM) {
    (window as any).SVGElement.prototype.getScreenCTM = polyfillCTM;
  }
}

// Polyfill btoa to handle UTF-8 strings in Node.js test environment
globalThis.btoa = (str: string) => Buffer.from(str, 'utf-8').toString('base64');
if (typeof window !== 'undefined') {
  (window as any).btoa = globalThis.btoa;
}


