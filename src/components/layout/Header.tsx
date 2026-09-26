// ===== HEADER =====
// Styled with Inficy Universal Product Design Standard & Theme Toggle
// Matching Infini-Convert & inficy-gateway

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop, ShieldCheck, Sparkles, FolderOpen, Download, HelpCircle, Shield, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../utils/theme';

interface HeaderProps {
  onOpenTemplates: () => void;
  onOpenDocuments: () => void;
  onOpenExport: () => void;
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTemplates,
  onOpenDocuments,
  onOpenExport,
  onOpenAbout,
  onOpenPrivacy,
  activeTab = 'studio',
}) => {
  const { theme, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-sub)',
        transition: 'background-color var(--transition-base), border-color var(--transition-base)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '58px',
          gap: '12px',
        }}>
          {/* Left: Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="Infini-Diagrams Logo"
              style={{
                width: 34,
                height: 34,
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <div>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                lineHeight: 1,
              }}>
                LoopHora
              </span>
              <span style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                Infini-Diagrams
              </span>
            </div>
          </div>

          {/* Center: Privacy Status Pill (hidden on tablet/mobile via CSS) */}
          <div className="badge badge-protection header-center-badge" style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'default',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--badge-green-text)',
              display: 'inline-block',
            }} />
            <span>Local Engine Active</span>
          </div>

          {/* Right: Navigation & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Desktop Navigation Links */}
            <nav className="desktop-nav">
              <HeaderNavLink
                label="Studio"
                active={activeTab === 'studio'}
                onClick={() => {}}
              />
              <HeaderNavLink
                label="Templates"
                active={false}
                onClick={onOpenTemplates}
              />
              <HeaderNavLink
                label="Documents"
                active={false}
                onClick={onOpenDocuments}
              />
              <HeaderNavLink
                label="Export"
                active={false}
                onClick={onOpenExport}
              />
              <HeaderNavExternalLink
                label="Converter"
                href="https://infini-convert.pages.dev/"
              />
              <HeaderNavLink
                label="About"
                active={false}
                onClick={onOpenAbout}
              />
              <HeaderNavLink
                label="Privacy"
                active={false}
                onClick={onOpenPrivacy}
              />
            </nav>

            <div className="hide-mobile" style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-sub)', margin: '0 4px' }} />

            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className="btn-icon"
              title={`Theme: ${theme.toUpperCase()} (Click to cycle Light / Dark / System)`}
              aria-label="Toggle color theme"
            >
              <ThemeIcon style={{ width: '15px', height: '15px' }} />
            </button>

            {/* Hamburger button (mobile only) */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="Infini-Diagrams"
              style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Infini-Diagrams</span>
          </div>
          <button
            className="btn-icon"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-nav-links">
          <button
            className={`mobile-nav-link ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Studio Workspace
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTemplates();
            }}
          >
            Diagram Templates (18+)
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocuments();
            }}
          >
            Saved Documents & History
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenExport();
            }}
          >
            Export Studio (SVG, PNG, PDF)
          </button>
          <a
            href="https://infini-convert.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: 'var(--text-main)',
            }}
          >
            <span>Converter Tool (Infini-Convert)</span>
            <ArrowUpRight style={{ width: 16, height: 16, color: 'var(--brand-primary)' }} />
          </a>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAbout();
            }}
          >
            About Infini-Diagrams
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPrivacy();
            }}
          >
            Privacy Policy
          </button>
        </div>

        <div className="mobile-nav-footer">
          <div className="badge badge-protection" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>
            <ShieldCheck style={{ width: 14, height: 14 }} />
            <span>Local Engine · Zero Uploads</span>
          </div>
          <button
            onClick={cycleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              background: 'none',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-sub)',
              cursor: 'pointer',
            }}
          >
            <ThemeIcon style={{ width: 16, height: 16 }} />
            <span style={{ textTransform: 'capitalize' }}>{theme} Mode</span>
          </button>
        </div>
      </div>
    </>
  );
};

const HeaderNavLink: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 12px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.8125rem',
      fontWeight: active ? 600 : 500,
      color: active ? 'var(--text-main)' : 'var(--text-sub)',
      backgroundColor: active ? 'var(--bg-nav-active)' : 'transparent',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'var(--bg-nav-hover)';
        e.currentTarget.style.color = 'var(--text-main)';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--text-sub)';
      }
    }}
  >
    {label}
  </button>
);

const HeaderNavExternalLink: React.FC<{ label: string; href: string }> = ({
  label,
  href,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: '6px 12px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: 'var(--text-sub)',
      backgroundColor: 'transparent',
      textDecoration: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all var(--transition-fast)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-nav-hover)';
      e.currentTarget.style.color = 'var(--text-main)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-sub)';
    }}
    title="Open Infini-Convert - Free Local File Converter by LoopHora"
  >
    <span>{label}</span>
    <ArrowUpRight style={{ width: 12, height: 12, opacity: 0.7 }} />
  </a>
);
