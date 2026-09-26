/**
 * ClipboardService - Handles copying source, SVG markup, and raster PNG blobs to clipboard.
 */

export class ClipboardService {
  /**
   * Copies plain text to clipboard (Mermaid source or SVG code).
   */
  static async copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for older environments
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
      return false;
    }
  }

  /**
   * Copies a PNG image Blob to the clipboard.
   */
  static async copyImageBlob(blob: Blob): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && 'ClipboardItem' in window && navigator.clipboard?.write) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      return false;
    }
  }
}
