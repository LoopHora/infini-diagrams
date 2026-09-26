import React, { useState } from 'react';
import { X, Search, Sparkles, LayoutTemplate, ArrowRight } from 'lucide-react';
import { DIAGRAM_TEMPLATES } from '../../data/templates';
import { DiagramTemplate } from '../../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DiagramTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(DIAGRAM_TEMPLATES.map((t) => t.category)))];

  const filteredTemplates = DIAGRAM_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        maxWidth: '820px',
        maxHeight: '85vh',
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
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutTemplate style={{ width: 18, height: 18, color: 'var(--brand-primary)' }} />
              <span>Diagram Templates Gallery</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Over 18+ verified Mermaid diagram architectures and diagrams
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close dialog">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-sub)', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{ width: 16, height: 16, color: 'var(--text-dim)', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates (e.g. sequence, microservices, cloud, git, er)..."
              className="input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  backgroundColor: selectedCategory === cat ? 'var(--brand-primary)' : 'var(--bg-btn)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-sub)',
                  border: `1px solid ${selectedCategory === cat ? 'transparent' : 'var(--border-card)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-idle" style={{ fontSize: '0.6875rem' }}>
                    {template.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {template.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)', marginTop: '6px', lineHeight: 1.4 }}>
                  {template.description}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-sub)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <span>Load Template</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
              No templates found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
