// ===== FOOTER =====
// Styled with Inficy Universal Product Design Standard
// Matching Infini-Convert & inficy-gateway

import React from 'react';
import { Sun, Moon, Laptop, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../utils/theme';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onOpenPrivacy }) => {
  const { theme, cycleTheme } = useTheme();
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-sub)',
      backgroundColor: 'var(--bg-header)',
      padding: '28px 0',
      transition: 'background-color var(--transition-base), border-color var(--transition-base)',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="Infini-Diagrams"
              style={{
                width: 28,
                height: 28,
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Infini-Diagrams by LoopHora
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Paste diagram code. See it instantly. Make it right. Export anywhere. — Free, privacy-first, zero cloud storage.
              </p>
            </div>
          </div>

          {/* Links & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="https://infini-convert.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-sub)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-sub)'; }}
              title="Open Infini-Convert - Free 100% In-Browser File Converter"
            >
              <span>Converter Tool</span>
              <ArrowUpRight style={{ width: '13px', height: '13px', color: 'var(--brand-primary)' }} />
            </a>
            <button
              onClick={onOpenPrivacy}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-sub)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Privacy
            </button>
            <button
              onClick={onOpenAbout}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-sub)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              About
            </button>
            <button
              onClick={cycleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                fontSize: '0.8125rem',
                color: 'var(--text-sub)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ThemeIcon style={{ width: '14px', height: '14px' }} />
              <span style={{ textTransform: 'capitalize' }}>{theme} mode</span>
            </button>
          </div>
        </div>

        {/* Protection Badges & Ecosystem Link & Shortcuts */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="badge badge-protection" style={{ fontSize: '0.6875rem' }}>
              <ShieldCheck style={{ width: '13px', height: '13px' }} />
              Zero Server Uploads — Processed 100% on device
            </div>

            <a
              href="https://infini-convert.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="badge"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-sub)',
                border: '1px solid var(--border-sub)',
                backgroundColor: 'var(--bg-app)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-focus)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-sub)';
                e.currentTarget.style.color = 'var(--text-sub)';
              }}
              title="Need file conversion? Try Infini-Convert by LoopHora"
            >
              <span>Need file conversion? Try <strong>Infini-Convert</strong></span>
              <ArrowUpRight style={{ width: '12px', height: '12px', color: 'var(--brand-primary)' }} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.6875rem', color: 'var(--text-dim)' }} className="desktop-only">
            <span>Shortcuts:</span>
            <span><kbd style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'var(--bg-nav-active)', border: '1px solid var(--border-card)' }}>Ctrl + Enter</kbd> Render</span>
            <span><kbd style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'var(--bg-nav-active)', border: '1px solid var(--border-card)' }}>Ctrl + S</kbd> Export</span>
            <span><kbd style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'var(--bg-nav-active)', border: '1px solid var(--border-card)' }}>Wheel</kbd> Zoom</span>
            <span><kbd style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'var(--bg-nav-active)', border: '1px solid var(--border-card)' }}>Drag</kbd> Pan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
