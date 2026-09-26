import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, ServerOff, Database } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 150,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div className="card-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--badge-green-bg)',
              color: 'var(--badge-green-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Privacy Policy & Security Charter
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                LoopHora Infini-Diagrams · 100% Client-Side Architecture
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <div className="card" style={{ padding: '16px', backgroundColor: 'var(--badge-green-bg)', borderColor: 'var(--badge-green-border)' }}>
            <p style={{ color: 'var(--badge-green-text)', fontWeight: 600 }}>
              The Core Guarantee: Your diagram code, data, labels, and export artifacts are processed entirely on your computer. None of your data is ever transmitted to LoopHora or any remote server.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ServerOff style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
              <span>1. Zero Server Processing</span>
            </h3>
            <p style={{ color: 'var(--text-sub)' }}>
              All parsing, layout calculations, rendering, rasterization, and PDF generation occur in-memory via client-side Web Workers, HTML5 Canvas, and WebAssembly within your browser tab.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Database style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
              <span>2. Local Storage & Revisions</span>
            </h3>
            <p style={{ color: 'var(--text-sub)' }}>
              Autosaved diagrams and revision snapshots reside strictly in your browser's private IndexedDB database. You can clear or delete your documents at any time with a single click.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <EyeOff style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
              <span>3. No Analytics or Source Telemetry</span>
            </h3>
            <p style={{ color: 'var(--text-sub)' }}>
              We do not track diagram contents, text, node labels, or export choices. Network traffic can be audited anytime in browser DevTools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
