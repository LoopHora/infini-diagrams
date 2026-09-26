import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Image,
  FileText,
  Code,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ExportFormat, PngScale, PdfPageSize, PdfOrientation, PresentationSettings } from '../../types';
import { FilenameService } from '../../services/FilenameService';
import { DownloadService } from '../../services/DownloadService';
import { ClipboardService } from '../../services/ClipboardService';
import { svgExporter } from '../../engine/export/SvgExporter';
import { pngExporter } from '../../engine/export/PngExporter';
import { pdfExporter } from '../../engine/export/PdfExporter';
import { mmdExporter } from '../../engine/export/MmdExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  source: string;
  svg: string;
  width: number;
  height: number;
  presentation: PresentationSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  source,
  svg,
  width,
  height,
  presentation,
}) => {
  if (!isOpen) return null;

  const [format, setFormat] = useState<ExportFormat>('svg');
  const [title, setTitle] = useState(documentTitle);
  const [scale, setScale] = useState<PngScale>(2);
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>('fit');
  const [pdfOrientation, setPdfOrientation] = useState<PdfOrientation>('landscape');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccessName, setDownloadSuccessName] = useState<string | null>(null);

  const previewFilename = FilenameService.sanitizeFilename(title, format);

  const handleDownload = async () => {
    setIsExporting(true);
    setDownloadSuccessName(null);

    try {
      const input = { svg, source, width, height };
      const options = {
        format,
        title,
        scale,
        pdfPageSize,
        pdfOrientation,
        backgroundType: presentation.backgroundType,
        customBackgroundColor: presentation.customBackgroundColor,
      };

      let blob: Blob;
      if (format === 'svg') {
        blob = await svgExporter.export(input, options);
      } else if (format === 'png') {
        blob = await pngExporter.export(input, options);
      } else if (format === 'pdf') {
        blob = await pdfExporter.export(input, options);
      } else {
        blob = await mmdExporter.export(input, options);
      }

      const downloadedName = DownloadService.triggerBlobDownload(blob, title, format);
      setDownloadSuccessName(downloadedName);
      setTimeout(() => setDownloadSuccessName(null), 4000);
    } catch (err: any) {
      alert(`Export error: ${err?.message || 'Failed to export diagram'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (format === 'svg') {
      const input = { svg, source, width, height };
      const blob = await svgExporter.export(input, {
        format: 'svg',
        title,
        backgroundType: presentation.backgroundType,
        customBackgroundColor: presentation.customBackgroundColor,
      });
      const text = await blob.text();
      const success = await ClipboardService.copyText(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (format === 'png') {
      const input = { svg, source, width, height };
      const blob = await pngExporter.export(input, {
        format: 'png',
        title,
        scale,
        backgroundType: presentation.backgroundType,
        customBackgroundColor: presentation.customBackgroundColor,
      });
      const success = await ClipboardService.copyImageBlob(blob);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (format === 'mmd') {
      const success = await ClipboardService.copyText(source);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className="card-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: 'min(92vh, 640px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow-hover)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-sub)',
          backgroundColor: 'var(--bg-header)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Export Diagram
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Client-side generation · Zero cloud uploads · Deterministic filename
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', flex: 1 }}>
          {/* Format Selector Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Output Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'svg', label: 'SVG', desc: 'Vector', icon: FileCode },
                { id: 'png', label: 'PNG', desc: 'Raster image', icon: Image },
                { id: 'pdf', label: 'PDF', desc: 'Document', icon: FileText },
                { id: 'mmd', label: 'MMD', desc: 'Source code', icon: Code },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = format === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as ExportFormat)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--brand-blue)' : 'var(--border-card)'}`,
                      backgroundColor: isSelected ? 'var(--bg-nav-active)' : 'var(--bg-btn)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon style={{ width: 20, height: 20, color: isSelected ? 'var(--brand-primary)' : 'var(--text-sub)' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-sub)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filename Input with live Anti-UUID preview */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              File Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g. system-architecture"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <ShieldCheck style={{ width: 13, height: 13, color: 'var(--badge-green-text)' }} />
              <span>Suggested filename:</span>
              <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{previewFilename}</strong>
            </div>
          </div>

          {/* Format-Specific Options */}
          {format === 'png' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Raster Resolution Scale
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {([1, 2, 3, 4] as PngScale[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      borderColor: scale === s ? 'var(--brand-blue)' : undefined,
                      backgroundColor: scale === s ? 'var(--bg-nav-active)' : undefined,
                      fontWeight: scale === s ? 700 : 500,
                    }}
                  >
                    {s}x {s === 2 ? '(Sharp)' : s === 4 ? '(Ultra-HD)' : ''}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Target dimensions: {Math.round(width * scale)} × {Math.round(height * scale)} px
              </p>
            </div>
          )}

          {format === 'pdf' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Page Sizing
                </label>
                <select
                  value={pdfPageSize}
                  onChange={(e) => setPdfPageSize(e.target.value as PdfPageSize)}
                  className="select"
                >
                  <option value="fit">Fit to Diagram (No clip)</option>
                  <option value="a4">A4 Standard</option>
                  <option value="letter">US Letter</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Orientation
                </label>
                <select
                  value={pdfOrientation}
                  onChange={(e) => setPdfOrientation(e.target.value as PdfOrientation)}
                  className="select"
                  disabled={pdfPageSize === 'fit'}
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {downloadSuccessName && (
            <div style={{
              backgroundColor: 'var(--badge-green-bg)',
              border: '1px solid var(--badge-green-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8125rem',
              color: 'var(--badge-green-text)',
            }}>
              <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0 }} />
              <div>
                <strong>Downloaded successfully!</strong>
                <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>File: {downloadSuccessName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderTop: '1px solid var(--border-sub)',
          backgroundColor: 'var(--bg-header)',
          flexShrink: 0,
        }}>
          {/* Clipboard Copy Button (available for SVG, PNG, MMD) */}
          {format !== 'pdf' ? (
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              title="Copy to clipboard"
            >
              {copied ? <Check style={{ width: 14, height: 14, color: 'var(--badge-green-text)' }} /> : <Copy style={{ width: 14, height: 14 }} />}
              <span>{copied ? 'Copied to Clipboard!' : `Copy ${format.toUpperCase()}`}</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting || (!svg && format !== 'mmd')}
              className="btn btn-primary"
            >
              <Download style={{ width: 16, height: 16 }} />
              <span>{isExporting ? 'Generating...' : `Download ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
