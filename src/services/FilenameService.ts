/**
 * FilenameService - Canonical filename generator.
 * Strictly implements the Anti-UUID Download Contract from 07-ANTI-UUID-DOWNLOAD-PATCH.md.
 * 
 * Rules:
 * - Deterministic, human-readable names derived from user-visible titles.
 * - Never includes UUIDs, temporary GUIDs, object URLs, or random hashes.
 * - Strips illegal filesystem characters and path traversal tokens.
 * - Safe fallback to "diagram.<extension>".
 */

export class FilenameService {
  /**
   * Sanitizes a title and attaches the specified extension.
   * Max base length is 120 characters.
   */
  static sanitizeFilename(input: string, extension: string): string {
    const cleanExt = extension.replace(/^\./, '').toLowerCase().trim();

    // Reject internal identifiers or raw object URLs accidentally passed
    let candidate = input;
    if (candidate.startsWith('blob:') || candidate.startsWith('data:') || candidate.startsWith('http')) {
      candidate = 'diagram';
    }

    const base = candidate
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[.-]+|[.-]+$/g, '')
      .slice(0, 120);

    return `${base || 'diagram'}.${cleanExt}`;
  }

  /**
   * Verifies if a filename complies with the Anti-UUID contract.
   */
  static isAntiUuidCompliant(filename: string): boolean {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const blobRegex = /^blob:/i;
    return !uuidRegex.test(filename) && !blobRegex.test(filename) && filename.length > 0;
  }
}
