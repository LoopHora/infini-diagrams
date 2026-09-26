import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface DiagnosticsBarProps {
  error?: string;
  line?: number;
  column?: number;
  hasLastValidPreview: boolean;
}

export const DiagnosticsBar: React.FC<DiagnosticsBarProps> = ({
  error,
  line,
  column,
  hasLastValidPreview,
}) => {
  if (!error) return null;

  return (
    <div style={{
      backgroundColor: 'var(--badge-red-bg)',
      borderBottom: '1px solid var(--badge-red-border)',
      padding: '8px 14px',
      fontSize: '0.8125rem',
      color: 'var(--badge-red-text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 700 }}>
            {line ? `Line ${line}${column ? `:${column}` : ''}: ` : 'Syntax Error: '}
          </span>
          <span style={{ wordBreak: 'break-word' }}>{error}</span>
        </div>
      </div>

      {hasLastValidPreview && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-sub)',
          backgroundColor: 'var(--bg-app)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-card)',
          flexShrink: 0,
        }}>
          <CheckCircle2 style={{ width: 12, height: 12, color: 'var(--badge-green-text)' }} />
          <span>Last valid preview preserved</span>
        </div>
      )}
    </div>
  );
};
