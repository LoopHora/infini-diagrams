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

// Polyfill URL.createObjectURL and revokeObjectURL in Node.js test environment
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = (blob: any) => `blob:mock-url-${Math.random().toString(36).slice(2)}`;
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}

// Polyfill Canvas 2D and Image in JSDOM for testing export rasterizers
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === '2d') {
      return {
        fillStyle: '',
        fillRect: () => {},
        clearRect: () => {},
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
      };
    }
    return null;
  } as any;

  HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type = 'image/png') {
    const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const binary = Buffer.from(dummyPngBase64, 'base64');
    const blob = new Blob([binary], { type });
    setTimeout(() => callback(blob), 0);
  };

  HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  };
}

// Polyfill Image element to trigger onload when src is set
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 800;
  height = 600;
  naturalWidth = 800;
  naturalHeight = 600;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(val: string) {
    this._src = val;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 5);
  }
}

(globalThis as any).Image = MockImage;
if (typeof window !== 'undefined') {
  (window as any).Image = MockImage;
}


