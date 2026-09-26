import React from 'react';
import { X, ShieldCheck, Zap, UserX, Cpu, Layers, ArrowUpRight } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
            <img
              src="/logo.png"
              alt="Infini-Diagrams"
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <div>
              <span className="badge badge-protection" style={{ fontSize: '0.6875rem' }}>
                <ShieldCheck style={{ width: 12, height: 12 }} />
                LoopHora Universal Product
              </span>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                About <span className="gradient-text">Infini-Diagrams</span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Our Mission
            </h3>
            <p style={{ color: 'var(--text-sub)' }}>
              Most diagramming tools force users to upload source code to remote servers, sign up for paid subscriptions, or cope with broken exports and blurry screenshots.
            </p>
            <p style={{ color: 'var(--text-sub)', marginTop: '8px' }}>
              <strong>Infini-Diagrams</strong> by LoopHora provides a local-first studio for Mermaid diagrams. Using isolated client-side rendering and native browser APIs, your diagrams are parsed, rendered, styled, and exported strictly within your browser.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '4px', fontWeight: 700 }}>
                <ShieldCheck style={{ width: 16, height: 16 }} />
                <span>Zero Server Uploads</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                Your diagram code never leaves your device. No telemetry, no cloud storage, completely air-gap ready.
              </p>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '4px', fontWeight: 700 }}>
                <Zap style={{ width: 16, height: 16 }} />
                <span>Instant Rendering</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                Hardware-accelerated live preview with smooth pinch-zoom, pan, themes, and non-destructive syntax diagnostics.
              </p>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '4px', fontWeight: 700 }}>
                <Layers style={{ width: 16, height: 16 }} />
                <span>Production Exports</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                Download high-res vector SVG, Ultra-HD 4x PNG, zero-clipping PDF via pdf-lib, or copy images directly to clipboard.
              </p>
            </div>

            <div className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-primary)', marginBottom: '4px', fontWeight: 700 }}>
                <UserX style={{ width: 16, height: 16 }} />
                <span>No Account Required</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                Completely free to use, no login required, with automatic IndexedDB offline persistence and revision snapshots.
              </p>
            </div>
          </div>

          {/* LoopHora Ecosystem Sister Tool: Infini-Convert */}
          <div style={{
            padding: '16px 18px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-sub)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Need to convert files, images, or media?
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Try our sister tool <strong>Infini-Convert</strong> — 100% in-browser, high-speed, privacy-first file conversion.
              </p>
            </div>
            <a
              href="https://infini-convert.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Launch Infini-Convert</span>
              <ArrowUpRight style={{ width: 14, height: 14, color: 'var(--brand-primary)' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
