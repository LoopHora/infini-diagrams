import React, { useState, useEffect } from 'react';
import {
  X,
  FilePlus,
  Trash2,
  Copy,
  Clock,
  RotateCcw,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { DiagramDocument, DocumentRevision } from '../../types';
import { documentStore } from '../../engine/storage/DocumentStore';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocId: string;
  onSelectDocument: (doc: DiagramDocument) => void;
  onNewDiagram: () => void;
  onRestoreRevision: (source: string) => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  activeDocId,
  onSelectDocument,
  onNewDiagram,
  onRestoreRevision,
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'docs' | 'revisions'>('docs');
  const [documents, setDocuments] = useState<DiagramDocument[]>([]);
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const allDocs = await documentStore.getAllDocuments();
      setDocuments(allDocs);

      if (activeDocId) {
        const revs = await documentStore.getRevisions(activeDocId);
        setRevisions(revs);
      }
    } catch (err) {
      console.error('Failed to load local document records:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeDocId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this diagram from local storage?')) {
      await documentStore.deleteDocument(id);
      await loadData();
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, doc: DiagramDocument) => {
    e.stopPropagation();
    const newDoc = await documentStore.createDocument(`${doc.title}-copy`, doc.source);
    await loadData();
    onSelectDocument(newDoc);
  };

  const handleRestore = (rev: DocumentRevision) => {
    onRestoreRevision(rev.source);
    setRestoredId(rev.id);
    setTimeout(() => setRestoredId(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
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
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Local Workspace
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              IndexedDB storage · Zero cloud dependencies
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-sub)',
          backgroundColor: 'var(--bg-card)',
        }}>
          <button
            onClick={() => setTab('docs')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8125rem',
              fontWeight: tab === 'docs' ? 700 : 500,
              color: tab === 'docs' ? 'var(--brand-primary)' : 'var(--text-sub)',
              borderBottom: `2px solid ${tab === 'docs' ? 'var(--brand-primary)' : 'transparent'}`,
              backgroundColor: 'transparent',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
            }}
          >
            Diagrams ({documents.length})
          </button>
          <button
            onClick={() => setTab('revisions')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8125rem',
              fontWeight: tab === 'revisions' ? 700 : 500,
              color: tab === 'revisions' ? 'var(--brand-primary)' : 'var(--text-sub)',
              borderBottom: `2px solid ${tab === 'revisions' ? 'var(--brand-primary)' : 'transparent'}`,
              backgroundColor: 'transparent',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
            }}
          >
            Revisions ({revisions.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tab === 'docs' ? (
            <>
              <button
                onClick={() => {
                  onNewDiagram();
                  onClose();
                }}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '8px' }}
              >
                <FilePlus style={{ width: 16, height: 16 }} />
                <span>Create New Diagram</span>
              </button>

              {documents.map((doc) => {
                const isActive = doc.id === activeDocId;
                const dateStr = new Date(doc.updatedAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc);
                      onClose();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isActive ? 'var(--brand-blue)' : 'var(--border-card)'}`,
                      backgroundColor: isActive ? 'var(--bg-nav-active)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Updated {dateStr}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={(e) => handleDuplicate(e, doc)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Duplicate diagram"
                      >
                        <Copy style={{ width: 13, height: 13 }} />
                      </button>
                      {documents.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(e, doc.id)}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', color: 'var(--badge-red-text)' }}
                          title="Delete diagram"
                        >
                          <Trash2 style={{ width: 13, height: 13 }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock style={{ width: 14, height: 14 }} />
                <span>Snapshots saved automatically before major changes (max 30):</span>
              </div>

              {revisions.map((rev) => {
                const dateStr = new Date(rev.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const isRestored = restoredId === rev.id;

                return (
                  <div
                    key={rev.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-card)',
                      backgroundColor: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {dateStr}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {rev.source.split('\n').length} lines · {rev.source.length} chars
                      </p>
                    </div>

                    <button
                      onClick={() => handleRestore(rev)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '4px' }}
                    >
                      {isRestored ? (
                        <>
                          <Check style={{ width: 12, height: 12, color: 'var(--badge-green-text)' }} />
                          <span>Restored</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw style={{ width: 12, height: 12 }} />
                          <span>Restore</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              {revisions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                  No previous revisions yet for this diagram.
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer with Data Lifecycle Controls (docs/09-LOCAL-FIRST-OFFLINE-STORAGE.md) */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-sub)',
          backgroundColor: 'var(--bg-header)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={async () => {
              if (confirm('Delete all diagrams and history from local storage? This cannot be undone.')) {
                await documentStore.clearAllData();
                await loadData();
                onNewDiagram();
              }
            }}
            className="btn-ghost btn-sm"
            style={{ color: 'var(--badge-red-text)', fontSize: '0.75rem', gap: '6px' }}
            title="Wipe local IndexedDB data and reset"
          >
            <Trash2 style={{ width: 13, height: 13 }} />
            <span>Reset Local Storage</span>
          </button>

          <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
            100% On-Device
          </span>
        </div>
      </div>
    </div>
  );
};
