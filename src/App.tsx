import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SourceEditor } from './components/editor/SourceEditor';
import { DiagnosticsBar } from './components/editor/DiagnosticsBar';
import { DiagramViewer } from './components/viewer/DiagramViewer';
import { ExportModal } from './components/modals/ExportModal';
import { TemplateModal } from './components/modals/TemplateModal';
import { DocumentDrawer } from './components/modals/DocumentDrawer';
import { AboutModal } from './components/modals/AboutModal';
import { PrivacyModal } from './components/modals/PrivacyModal';
import { documentStore, DEFAULT_PRESENTATION } from './engine/storage/DocumentStore';
import { mermaidEngine } from './engine/diagram/MermaidEngine';
import { DIAGRAM_TEMPLATES } from './data/templates';
import { DiagramDocument, DiagramTemplate, PresentationSettings } from './types';
import {
  ShieldCheck,
  Play,
  FilePlus,
  LayoutTemplate,
  FolderOpen,
  Download,
  Edit2,
  Check,
  Code,
  Eye,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  GitBranch,
  Network
} from 'lucide-react';

export const App: React.FC = () => {
  // Document state
  const [currentDoc, setCurrentDoc] = useState<DiagramDocument | null>(null);
  const [source, setSource] = useState<string>('');
  const [title, setTitle] = useState<string>('microservices-architecture');
  const [presentation, setPresentation] = useState<PresentationSettings>(DEFAULT_PRESENTATION);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  // Render & Preview state
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [svgWidth, setSvgWidth] = useState<number>(800);
  const [svgHeight, setSvgHeight] = useState<number>(600);
  const [status, setStatus] = useState<'saved' | 'rendering' | 'ready' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  const [errorCol, setErrorCol] = useState<number | undefined>(undefined);
  const [isStalePreview, setIsStalePreview] = useState<boolean>(false);
  const [autoRender, setAutoRender] = useState<boolean>(true);

  // Mobile layout view switcher ('editor' | 'preview')
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'preview'>('editor');

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Timers
  const renderTimeoutRef = useRef<number | null>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  // Load initial document from IndexedDB
  useEffect(() => {
    const initApp = async () => {
      try {
        const allDocs = await documentStore.getAllDocuments();
        const activeId = documentStore.getActiveDocumentId();
        let targetDoc = allDocs.find((d) => d.id === activeId) || allDocs[0];

        if (targetDoc) {
          setCurrentDoc(targetDoc);
          setSource(targetDoc.source);
          setTitle(targetDoc.title);
          setTempTitle(targetDoc.title);
          setPresentation(targetDoc.presentation || DEFAULT_PRESENTATION);

          if (targetDoc.lastValidSvg) {
            setRenderedSvg(targetDoc.lastValidSvg);
            setSvgWidth(targetDoc.lastValidWidth || 800);
            setSvgHeight(targetDoc.lastValidHeight || 600);
          }
        }
      } catch (err) {
        console.error('Failed to initialize document store:', err);
      }
    };

    initApp();
  }, []);

  // Execute diagram rendering
  const executeRender = useCallback(async (codeToRender: string, currentTheme: string) => {
    if (!codeToRender.trim()) {
      setRenderedSvg('');
      setErrorMessage(undefined);
      setStatus('ready');
      setIsStalePreview(false);
      return;
    }

    setStatus('rendering');

    try {
      const result = await mermaidEngine.render(codeToRender, {
        theme: currentTheme as any,
      });

      if (result.isError) {
        // NON-DESTRUCTIVE ERROR UX: Keep existing preview, show error diagnostics!
        setStatus('error');
        setErrorMessage(result.errorMessage);
        setErrorLine(result.errorLine);
        setErrorCol(result.errorColumn);
        setIsStalePreview(true);
      } else {
        // Render successful
        setRenderedSvg(result.svg);
        setSvgWidth(result.width);
        setSvgHeight(result.height);
        setStatus('ready');
        setErrorMessage(undefined);
        setErrorLine(undefined);
        setErrorCol(undefined);
        setIsStalePreview(false);

        // Update current doc's last valid SVG
        if (currentDoc) {
          currentDoc.lastValidSvg = result.svg;
          currentDoc.lastValidWidth = result.width;
          currentDoc.lastValidHeight = result.height;
        }
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Unexpected rendering failure.');
      setIsStalePreview(true);
    }
  }, [currentDoc]);

  // Initial render when doc is loaded
  useEffect(() => {
    if (source) {
      executeRender(source, presentation.theme);
    }
  }, [source ? true : false, presentation.theme]);

  // Auto-render on typing with 600ms debounce
  const handleSourceChange = (newSource: string) => {
    setSource(newSource);

    if (autoRender) {
      if (renderTimeoutRef.current) {
        window.clearTimeout(renderTimeoutRef.current);
      }
      renderTimeoutRef.current = window.setTimeout(() => {
        executeRender(newSource, presentation.theme);
      }, 600);
    }

    // Schedule debounced autosave (1200ms)
    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = window.setTimeout(() => {
      if (currentDoc) {
        const updated: DiagramDocument = {
          ...currentDoc,
          source: newSource,
          title,
          presentation,
          updatedAt: Date.now(),
        };
        documentStore.saveDocument(updated);
        setStatus('saved');
        setTimeout(() => setStatus('ready'), 2000);
      }
    }, 1200);
  };

  // Title change handler
  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const cleanTitle = tempTitle.trim() || 'diagram';
    setTitle(cleanTitle);
    if (currentDoc) {
      const updated: DiagramDocument = {
        ...currentDoc,
        title: cleanTitle,
        updatedAt: Date.now(),
      };
      setCurrentDoc(updated);
      documentStore.saveDocument(updated);
    }
  };

  // Presentation settings change handler
  const handlePresentationChange = (updates: Partial<PresentationSettings>) => {
    const updated = { ...presentation, ...updates };
    setPresentation(updated);

    if (updates.theme && updates.theme !== presentation.theme) {
      executeRender(source, updates.theme);
    }

    if (currentDoc) {
      const docUpdates: DiagramDocument = {
        ...currentDoc,
        presentation: updated,
        updatedAt: Date.now(),
      };
      documentStore.saveDocument(docUpdates);
    }
  };

  // Manual render trigger
  const handleManualRender = () => {
    if (renderTimeoutRef.current) {
      window.clearTimeout(renderTimeoutRef.current);
    }
    executeRender(source, presentation.theme);
  };

  // Import file handler
  const handleImportFile = (content: string, fileName: string) => {
    const sanitizedTitle = fileName.replace(/\.[^/.]+$/, '');
    setTitle(sanitizedTitle);
    setTempTitle(sanitizedTitle);
    setSource(content);
    executeRender(content, presentation.theme);
  };

  // Load template handler
  const handleSelectTemplate = (template: DiagramTemplate) => {
    setTitle(template.id);
    setTempTitle(template.id);
    setSource(template.source);
    executeRender(template.source, presentation.theme);
    // Smooth scroll to studio workspace
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create new diagram handler
  const handleNewDiagram = async () => {
    const newDoc = await documentStore.createDocument('new-architecture');
    setCurrentDoc(newDoc);
    setSource(newDoc.source);
    setTitle(newDoc.title);
    setTempTitle(newDoc.title);
    setPresentation(newDoc.presentation || DEFAULT_PRESENTATION);
    executeRender(newDoc.source, DEFAULT_PRESENTATION.theme);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Select document from drawer
  const handleSelectDocument = (doc: DiagramDocument) => {
    setCurrentDoc(doc);
    setSource(doc.source);
    setTitle(doc.title);
    setTempTitle(doc.title);
    setPresentation(doc.presentation || DEFAULT_PRESENTATION);
    documentStore.setActiveDocumentId(doc.id);
    executeRender(doc.source, (doc.presentation || DEFAULT_PRESENTATION).theme);
  };

  // Restore previous revision
  const handleRestoreRevision = (revisedSource: string) => {
    setSource(revisedSource);
    executeRender(revisedSource, presentation.theme);
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to render
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleManualRender();
      }
      // Ctrl+S or Cmd+S to export
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setIsExportOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualRender]);

  // Categories matching Infini-Convert explorer shelf
  const explorerCategories = [
    {
      title: 'Architecture & Flows',
      description: 'Distributed systems, microservices & authentication flows',
      icon: Network,
      color: '#38bdf8',
      tools: [
        { id: 'flowchart-architecture', label: 'Microservices Architecture' },
        { id: 'sequence-auth', label: 'OAuth 2.0 PKCE Flow' },
        { id: 'c4-context', label: 'C4 Context Architecture' },
        { id: 'block-system', label: 'Engine Stack Block Diagram' },
      ],
    },
    {
      title: 'Database & Systems',
      description: 'Relational schemas, domain entities & release roadmaps',
      icon: Layers,
      color: '#10b981',
      tools: [
        { id: 'er-database', label: 'Multi-Tenant SaaS Schema (ER)' },
        { id: 'class-domain', label: 'E-Commerce Domain Model (Class)' },
        { id: 'state-order', label: 'Order Lifecycle Engine (State)' },
        { id: 'gantt-release', label: 'Product Release Roadmap (Gantt)' },
      ],
    },
    {
      title: 'Strategy & Visuals',
      description: 'Mindmaps, user journeys, gitflows & matrix charts',
      icon: GitBranch,
      color: '#818cf8',
      tools: [
        { id: 'mindmap-product', label: 'Product Strategy Mindmap' },
        { id: 'gitgraph-gitflow', label: 'Gitflow Branching Strategy' },
        { id: 'user-journey', label: 'Customer Experience Journey' },
        { id: 'timeline-milestones', label: 'Product Milestones Timeline' },
      ],
    },
    {
      title: 'Exports & Analytics',
      description: 'Workload charts, flow metrics & multi-format exports',
      icon: Download,
      color: '#f59e0b',
      tools: [
        { id: 'pie-analytics', label: 'Resource Distribution (Pie)' },
        { id: 'quadrant-matrix', label: 'Feature Priority Matrix' },
        { id: 'sankey-flow', label: 'Data & Traffic Flow (Sankey)' },
        { id: 'export-trigger', label: 'Open Export Studio (SVG, PNG, PDF)', isAction: true },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Universal Top Header Matching Infini-Convert */}
      <Header
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenDocuments={() => setIsDocumentsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '36px 0 64px' }}>
        <div className="container">
          {/* Default Home Hero matching Infini-Convert */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px', position: 'relative' }}>
            <div className="animate-fade-in">
              <span className="badge badge-protection" style={{ marginBottom: '14px' }}>
                <ShieldCheck style={{ width: 14, height: 14 }} />
                100% Local In-Browser Processing
              </span>
            </div>

            <h1 className="animate-fade-in" style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--text-main)',
              marginBottom: '12px',
            }}>
              Paste diagram code. <span className="gradient-text">See it instantly.</span>
            </h1>

            <p className="animate-fade-in" style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              color: 'var(--text-sub)',
              fontWeight: 400,
              marginBottom: '28px',
            }}>
              <strong>Make it right. Export anywhere.</strong> Private, local-first diagram studio to edit Mermaid code, customize themes, and export high-res SVG, PNG, and PDF directly on your device.
            </p>
          </div>

          {/* Central Studio Workspace Card-Panel */}
          <div
            ref={studioRef}
            className="card-panel animate-slide-up"
            style={{
              maxWidth: '1080px',
              margin: '0 auto 48px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Studio Header Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-header)',
              borderBottom: '1px solid var(--border-sub)',
              gap: '10px',
            }}>
              {/* Row 1: Title, Status, and Studio Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
                flexWrap: 'wrap',
              }}>
                {/* Left: Diagram Title & State */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
                  {isEditingTitle ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTitleSubmit();
                          if (e.key === 'Escape') {
                            setTempTitle(title);
                            setIsEditingTitle(false);
                          }
                        }}
                        autoFocus
                        className="input"
                        style={{ width: '160px', padding: '4px 8px', fontSize: '0.8125rem' }}
                      />
                      <button onClick={handleTitleSubmit} className="btn-icon" style={{ width: '28px', height: '28px' }}>
                        <Check style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempTitle(title);
                        setIsEditingTitle(true);
                      }}
                      className="btn-ghost"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-card)',
                        backgroundColor: 'var(--bg-btn)',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title="Click to rename diagram"
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                      <Edit2 style={{ width: 12, height: 12, opacity: 0.6, flexShrink: 0 }} />
                    </button>
                  )}

                  {status === 'rendering' && (
                    <div className="badge badge-amber" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                      <span>Rendering...</span>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="badge badge-error" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                      <span>Syntax Error</span>
                    </div>
                  )}
                  {status === 'saved' && (
                    <div className="badge badge-idle hide-mobile" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>
                      <span>Saved</span>
                    </div>
                  )}
                </div>

                {/* Right: Studio Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={handleNewDiagram}
                    className="btn btn-secondary btn-sm"
                    title="Create new diagram"
                  >
                    <FilePlus style={{ width: 14, height: 14 }} />
                    <span className="desktop-only">New</span>
                  </button>

                  <button
                    onClick={() => setIsTemplatesOpen(true)}
                    className="btn btn-secondary btn-sm"
                    title="Browse 18+ diagram templates"
                  >
                    <LayoutTemplate style={{ width: 14, height: 14 }} />
                    <span className="desktop-only">Templates</span>
                  </button>

                  <button
                    onClick={() => setIsDocumentsOpen(true)}
                    className="btn btn-secondary btn-sm"
                    title="Open saved diagrams & history"
                  >
                    <FolderOpen style={{ width: 14, height: 14 }} />
                    <span className="desktop-only">Docs</span>
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="btn btn-primary btn-sm"
                    title="Export Studio (SVG, PNG, PDF, MMD)"
                  >
                    <Download style={{ width: 14, height: 14 }} />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Full-Width Mobile Segmented View Switcher (Only visible on screens <= 768px) */}
              <div className="mobile-only" style={{
                width: '100%',
                display: 'flex',
                backgroundColor: 'var(--bg-input)',
                padding: '3px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)',
              }}>
                <button
                  onClick={() => setMobileActiveView('editor')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: mobileActiveView === 'editor' ? 'var(--brand-primary)' : 'transparent',
                    color: mobileActiveView === 'editor' ? '#ffffff' : 'var(--text-sub)',
                    boxShadow: mobileActiveView === 'editor' ? '0 1px 4px rgba(0, 0, 0, 0.25)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Code style={{ width: 14, height: 14 }} />
                  <span>Code Editor</span>
                </button>
                <button
                  onClick={() => setMobileActiveView('preview')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: mobileActiveView === 'preview' ? 'var(--brand-primary)' : 'transparent',
                    color: mobileActiveView === 'preview' ? '#ffffff' : 'var(--text-sub)',
                    boxShadow: mobileActiveView === 'preview' ? '0 1px 4px rgba(0, 0, 0, 0.25)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Eye style={{ width: 14, height: 14 }} />
                  <span>Diagram Preview</span>
                </button>
              </div>
            </div>

            {/* Diagnostics / Syntax Error Bar */}
            <DiagnosticsBar
              error={errorMessage}
              line={errorLine}
              column={errorCol}
              hasLastValidPreview={renderedSvg.length > 0 && isStalePreview}
            />

            {/* Split Studio Workspace Body */}
            <div className="studio-workspace-split">
              {/* Left Pane: Source Editor */}
              <div className={`studio-pane-editor ${mobileActiveView === 'preview' ? 'mobile-hidden' : ''}`}>
                <SourceEditor
                  source={source}
                  onChange={handleSourceChange}
                  onManualRender={handleManualRender}
                  autoRender={autoRender}
                  onToggleAutoRender={setAutoRender}
                  onImportFile={handleImportFile}
                />
              </div>

              {/* Right Pane: Diagram Viewer */}
              <div className={`studio-pane-viewer ${mobileActiveView === 'editor' ? 'mobile-hidden' : ''}`}>
                <DiagramViewer
                  svg={renderedSvg}
                  width={svgWidth}
                  height={svgHeight}
                  isStale={isStalePreview}
                  presentation={presentation}
                  onPresentationChange={handlePresentationChange}
                  onOpenTemplates={() => setIsTemplatesOpen(true)}
                />
              </div>
            </div>
          </div>

          {/* Task-First Tool Explorer: Always accessible below matching Infini-Convert */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Explore All Diagram Types & Studio Capabilities
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Choose a dedicated diagram archetype or customize above
              </p>
            </div>

            <div className="stagger-children responsive-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              maxWidth: '1080px',
              margin: '0 auto',
            }}>
              {explorerCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.title} className="card-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: cat.color,
                      }}>
                        <Icon style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>{cat.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{cat.description}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '12px' }}>
                      {cat.tools.map((tool) => {
                        const targetTemplate = DIAGRAM_TEMPLATES.find((t) => t.id === tool.id);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === 'export-trigger') {
                                setIsExportOpen(true);
                              } else if (targetTemplate) {
                                handleSelectTemplate(targetTemplate);
                              } else {
                                setIsTemplatesOpen(true);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              color: 'var(--text-sub)',
                              textDecoration: 'none',
                              transition: 'all var(--transition-fast)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-nav-hover)';
                              e.currentTarget.style.color = 'var(--text-main)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-sub)';
                            }}
                          >
                            <span>{tool.label}</span>
                            <ArrowRight style={{ width: 13, height: 13, opacity: 0.6 }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust & Architecture Banner matching Infini-Convert */}
          <div style={{
            maxWidth: '720px',
            margin: '40px auto 0',
            textAlign: 'center',
          }}>
            <div className="card-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck style={{ width: 18, height: 18, color: 'var(--badge-green-text)' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  100% Client-Side Privacy
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                Every diagram is parsed, rendered, and exported directly in your browser.
                No source code or telemetry ever leaves your computer or phone.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Footer Matching Infini-Convert */}
      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documentTitle={title}
        source={source}
        svg={renderedSvg}
        width={svgWidth}
        height={svgHeight}
        presentation={presentation}
      />

      <TemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <DocumentDrawer
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        activeDocId={currentDoc?.id || ''}
        onSelectDocument={handleSelectDocument}
        onNewDiagram={handleNewDiagram}
        onRestoreRevision={handleRestoreRevision}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
};
