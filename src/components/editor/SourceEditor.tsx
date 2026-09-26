import React, { useRef, useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Play, RotateCcw, Upload, Trash2, Check, Copy } from 'lucide-react';
import { useTheme } from '../../utils/theme';
import { ClipboardService } from '../../services/ClipboardService';

interface SourceEditorProps {
  source: string;
  onChange: (value: string) => void;
  onManualRender: () => void;
  autoRender: boolean;
  onToggleAutoRender: (enabled: boolean) => void;
  onImportFile: (content: string, fileName: string) => void;
}

export const SourceEditor: React.FC<SourceEditorProps> = ({
  source,
  onChange,
  onManualRender,
  autoRender,
  onToggleAutoRender,
  onImportFile,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const lineCount = source.split('\n').length;
  const charCount = source.length;

  const handleCopySource = async () => {
    const success = await ClipboardService.copyText(source);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        onImportFile(text, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        onImportFile(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        position: 'relative',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Editor Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-sub)',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {/* Left: Section Label & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Source Code
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }} className="hide-mobile">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount} chars
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Auto-render toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-sub)',
              cursor: 'pointer',
              userSelect: 'none',
              marginRight: '4px',
            }}
            title="Automatically re-renders 600ms after you stop typing"
          >
            <input
              type="checkbox"
              checked={autoRender}
              onChange={(e) => onToggleAutoRender(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
            />
            <span>Auto</span>
          </label>

          {/* Explicit Manual Render Button */}
          <button
            onClick={onManualRender}
            className="btn btn-primary btn-sm"
            title="Render diagram (Ctrl+Enter / Cmd+Enter)"
          >
            <Play style={{ width: 12, height: 12 }} />
            <span>Render</span>
          </button>

          {/* Copy Source */}
          <button
            onClick={handleCopySource}
            className="btn-icon"
            title={copied ? 'Copied!' : 'Copy source to clipboard'}
          >
            {copied ? <Check style={{ width: 14, height: 14, color: 'var(--badge-green-text)' }} /> : <Copy style={{ width: 14, height: 14 }} />}
          </button>

          {/* Import File Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mmd,.mermaid,.txt,.md"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-icon"
            title="Open / Import .mmd or text file"
          >
            <Upload style={{ width: 14, height: 14 }} />
          </button>

          {/* Clear Source */}
          <button
            onClick={() => onChange('')}
            className="btn-icon"
            title="Clear editor"
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* CodeMirror Surface */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }} className="cm-theme-container">
        <CodeMirror
          value={source}
          height="100%"
          theme={isDark ? 'dark' : 'light'}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          style={{ height: '100%', fontSize: '13px' }}
        />
      </div>

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          border: '2px dashed var(--brand-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          pointerEvents: 'none',
        }}>
          <div className="badge badge-protection" style={{ fontSize: '1rem', padding: '8px 16px' }}>
            Drop .mmd or source file here to import
          </div>
        </div>
      )}
    </div>
  );
};
