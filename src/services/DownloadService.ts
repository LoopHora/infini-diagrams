/**
 * DownloadService - Native anchor download executor.
 * Follows the safe object-URL lifecycle defined in 07-ANTI-UUID-DOWNLOAD-PATCH.md.
 */

import { FilenameService } from './FilenameService';

export class DownloadService {
  /**
   * Triggers a browser download for a Blob with a canonical filename.
   */
  static triggerBlobDownload(blob: Blob, rawTitle: string, extension: string): string {
    const canonicalFilename = FilenameService.sanitizeFilename(rawTitle, extension);
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = canonicalFilename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Revoke object URL after browser has consumed it (1000ms delay to prevent premature cancellation)
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);

    return canonicalFilename;
  }

  /**
   * Triggers a browser download for raw text/source.
   */
  static triggerTextDownload(text: string, rawTitle: string, extension: string): string {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    return this.triggerBlobDownload(blob, rawTitle, extension);
  }
}
