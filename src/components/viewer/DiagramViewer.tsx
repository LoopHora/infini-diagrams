import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Palette,
  Sparkles,
  Layers,
  Image,
  FileCode,
  AlertCircle,
  Hand,
  MousePointer
} from 'lucide-react';
import { BackgroundType, MermaidTheme, PresentationSettings } from '../../types';
import { ClipboardService } from '../../services/ClipboardService';
import { pngExporter } from '../../engine/export/PngExporter';

interface DiagramViewerProps {
  svg: string;
  width: number;
  height: number;
  isStale: boolean;
  presentation: PresentationSettings;
  onPresentationChange: (settings: Partial<PresentationSettings>) => void;
  onOpenTemplates: () => void;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  svg,
  width,
  height,
  isStale,
  presentation,
  onPresentationChange,
  onOpenTemplates,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [wheelDirectZoom, setWheelDirectZoom] = useState(false);
  const [isWheelZooming, setIsWheelZooming] = useState(false);
  const wheelZoomTimeoutRef = useRef<number | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const scrollHintTimeoutRef = useRef<number | null>(null);

  // Synchronous refs to prevent stale closure drift during rapid wheel/drag interactions
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || '');

  // Touch pinch-to-zoom & two-finger pan tracking
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const touchStartMidRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  /**
   * Mathematically anchored zoom around any focal point (focalX, focalY) relative to canvas.
   * - If focalX/focalY is canvas center (cW / 2, cH / 2), the center of the viewport stays perfectly stationary.
   * - If focalX/focalY is the mouse cursor, the exact diagram point under the cursor stays stationary.
   */
  const zoomAtPoint = useCallback((factor: number, focalX: number, focalY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cW = canvas.clientWidth || 800;
    const cH = canvas.clientHeight || 600;

    const oldScale = scaleRef.current;
    const oldPan = panRef.current;

    const newScale = Math.min(5.0, Math.max(0.1, oldScale * factor));
    if (newScale === oldScale) return;

    const k = newScale / oldScale;

    // Vector from canvas center to the zoom anchor point
    const offsetX = focalX - cW / 2;
    const offsetY = focalY - cH / 2;

    // Shift pan so that the anchor point remains stationary on screen
    const nextX = offsetX - (offsetX - oldPan.x) * k;
    const nextY = offsetY - (offsetY - oldPan.y) * k;

    // Bounded pan limits
    const maxBound = Math.max(3000, (width || 800) * newScale * 2);
    const clampedPan = {
      x: Math.max(-maxBound, Math.min(maxBound, nextX)),
      y: Math.max(-maxBound, Math.min(maxBound, nextY)),
    };

    scaleRef.current = newScale;
    panRef.current = clampedPan;
    setScale(newScale);
    setPan(clampedPan);
  }, [width]);

  // Center-anchored Zoom In (+20%)
  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    const cW = canvas?.clientWidth || 800;
    const cH = canvas?.clientHeight || 600;
    zoomAtPoint(1.2, cW / 2, cH / 2);
  }, [zoomAtPoint]);

  // Center-anchored Zoom Out (-16.7%)
  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    const cW = canvas?.clientWidth || 800;
    const cH = canvas?.clientHeight || 600;
    zoomAtPoint(1 / 1.2, cW / 2, cH / 2);
  }, [zoomAtPoint]);

  // Reset to 100% and centered
  const resetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
  }, []);

  // Reset / Fit diagram to container
  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const { clientWidth, clientHeight } = canvas;
    const pad = 48;
    const availW = Math.max(100, clientWidth - pad);
    const availH = Math.max(100, clientHeight - pad);

    const scaleX = availW / width;
    const scaleY = availH / height;
    const newScale = Math.min(1.5, Math.max(0.1, Math.min(scaleX, scaleY)));

    setScale(newScale);
    setPan({ x: 0, y: 0 });
    scaleRef.current = newScale;
    panRef.current = { x: 0, y: 0 };
  }, [width, height]);

  // Initial fit when diagram dimensions change
  useEffect(() => {
    if (width > 0 && height > 0) {
      fitToView();
    }
  }, [width, height, fitToView]);

  // CRITICAL: Non-passive native wheel listener with cursor-anchored zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      const isZoomIntent = e.ctrlKey || e.metaKey || isFullscreen || wheelDirectZoom;

      if (isZoomIntent) {
        // Prevent default browser-level website zoom
        e.preventDefault();
        e.stopPropagation();

        const rect = canvas.getBoundingClientRect();
        // Exact mouse pointer position inside canvas
        const focalX = e.clientX - rect.left;
        const focalY = e.clientY - rect.top;

        // Smooth zoom factor based on wheel direction
        const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);

        // Mark active wheel zooming to disable CSS transition lag
        setIsWheelZooming(true);
        if (wheelZoomTimeoutRef.current) {
          window.clearTimeout(wheelZoomTimeoutRef.current);
        }
        wheelZoomTimeoutRef.current = window.setTimeout(() => {
          setIsWheelZooming(false);
        }, 150);

        zoomAtPoint(factor, focalX, focalY);
        setShowScrollHint(false);
      } else {
        // Natural page scrolling allowed — show keyboard shortcut hint
        setShowScrollHint(true);
        if (scrollHintTimeoutRef.current) {
          window.clearTimeout(scrollHintTimeoutRef.current);
        }
        scrollHintTimeoutRef.current = window.setTimeout(() => {
          setShowScrollHint(false);
        }, 1500);
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [isFullscreen, wheelDirectZoom, zoomAtPoint]);

  // Secondary safety guard on window: Prevent native browser page zoom if Ctrl+Wheel occurs anywhere over the canvas
  useEffect(() => {
    const onWindowWheel = (e: WheelEvent) => {
      if ((e.ctrlKey || e.metaKey) && canvasRef.current && canvasRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', onWindowWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWindowWheel);
    };
  }, []);

  // Double-click to zoom in centered on click position (Shift+Double-click zooms out)
  const handleDoubleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const focalX = e.clientX - rect.left;
    const focalY = e.clientY - rect.top;
    const factor = e.shiftKey ? (1 / 1.4) : 1.4;
    zoomAtPoint(factor, focalX, focalY);
  };

  // Keyboard zoom shortcuts when viewer is active (+ / - / Ctrl+0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('.cm-editor'))) {
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        fitToView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, fitToView]);

  // Mouse pan handlers (Click & Drag works anytime on desktop mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return; // Left or Middle click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const nextX = e.clientX - dragStart.x;
    const nextY = e.clientY - dragStart.y;
    // Bounded pan limits
    const maxBound = Math.max(3000, (width || 800) * scale * 2);
    const clampedPan = {
      x: Math.max(-maxBound, Math.min(maxBound, nextX)),
      y: Math.max(-maxBound, Math.min(maxBound, nextY)),
    };
    panRef.current = clampedPan;
    setPan(clampedPan);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch handlers: 1-finger pan (when enabled) and 2-finger centered pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && (isPanMode || isFullscreen)) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      touchStartDistRef.current = Math.hypot(dx, dy);
      touchStartScaleRef.current = scaleRef.current;
      touchStartMidRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      touchStartPanRef.current = { ...panRef.current };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && (isPanMode || isFullscreen)) {
      const nextX = e.touches[0].clientX - dragStart.x;
      const nextY = e.touches[0].clientY - dragStart.y;
      const maxBound = Math.max(3000, (width || 800) * scale * 2);
      const clampedPan = {
        x: Math.max(-maxBound, Math.min(maxBound, nextX)),
        y: Math.max(-maxBound, Math.min(maxBound, nextY)),
      };
      panRef.current = clampedPan;
      setPan(clampedPan);
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null && touchStartMidRef.current !== null) {
      e.preventDefault(); // Prevent native mobile browser zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const currentDist = Math.hypot(dx, dy);
      const ratio = currentDist / touchStartDistRef.current;
      const targetScale = Math.min(5.0, Math.max(0.1, touchStartScaleRef.current * ratio));

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cW = canvas.clientWidth || 800;
      const cH = canvas.clientHeight || 600;

      // Current touch midpoint relative to canvas
      const currentMidX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const currentMidY = (t1.clientY + t2.clientY) / 2 - rect.top;

      // Initial touch midpoint relative to canvas
      const initialMidX = touchStartMidRef.current.x - rect.left;
      const initialMidY = touchStartMidRef.current.y - rect.top;

      const panDeltaX = currentMidX - initialMidX;
      const panDeltaY = currentMidY - initialMidY;

      const k = targetScale / touchStartScaleRef.current;
      const offsetX = initialMidX - cW / 2;
      const offsetY = initialMidY - cH / 2;

      const nextPanX = offsetX - (offsetX - touchStartPanRef.current.x) * k + panDeltaX;
      const nextPanY = offsetY - (offsetY - touchStartPanRef.current.y) * k + panDeltaY;

      const maxBound = Math.max(3000, (width || 800) * targetScale * 2);
      const clampedPan = {
        x: Math.max(-maxBound, Math.min(maxBound, nextPanX)),
        y: Math.max(-maxBound, Math.min(maxBound, nextPanY)),
      };

      scaleRef.current = targetScale;
      panRef.current = clampedPan;
      setScale(targetScale);
      setPan(clampedPan);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
    touchStartMidRef.current = null;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Fullscreen change listener to sync state if exited via ESC key
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Quick Copy SVG
  const handleCopySvg = async () => {
    if (!svg) return;
    const success = await ClipboardService.copyText(svg);
    if (success) {
      setCopiedType('svg');
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  // Quick Copy PNG
  const handleCopyPng = async () => {
    if (!svg) return;
    try {
      const blob = await pngExporter.export({ svg, source: '', width, height }, {
        format: 'png',
        title: 'diagram',
        scale: 2,
        backgroundType: presentation.backgroundType,
        customBackgroundColor: presentation.customBackgroundColor,
      });
      const success = await ClipboardService.copyImageBlob(blob);
      if (success) {
        setCopiedType('png');
        setTimeout(() => setCopiedType(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy PNG:', err);
    }
  };

  // Determine presentation canvas background
  const getCanvasBackground = () => {
    if (presentation.backgroundType === 'white') return '#ffffff';
    if (presentation.backgroundType === 'dark') return '#121214';
    if (presentation.backgroundType === 'custom') return presentation.customBackgroundColor;
    return 'transparent';
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Viewer Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-sub)',
        gap: '8px',
        flexWrap: 'wrap',
        zIndex: 20,
      }}>
        {/* Left: View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <button
            onClick={zoomIn}
            className="btn-icon"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={zoomOut}
            className="btn-icon"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={fitToView}
            className="btn btn-secondary btn-sm"
            title="Fit diagram to viewport"
          >
            Fit
          </button>
          <button
            onClick={resetZoom}
            className="btn-icon"
            title="Reset 100% (Centered)"
            aria-label="Reset Zoom"
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
          </button>
          <button
            onClick={() => setIsPanMode(!isPanMode)}
            className={`btn-icon ${isPanMode ? 'btn-active' : ''}`}
            title={isPanMode ? 'Pan Mode Active (1-finger drag)' : 'Enable 1-finger Pan Mode'}
            aria-label="Toggle Pan Tool"
            style={isPanMode ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff', borderColor: 'var(--brand-blue)' } : {}}
          >
            <Hand style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={() => setWheelDirectZoom(!wheelDirectZoom)}
            className={`btn-icon ${wheelDirectZoom ? 'btn-active' : ''}`}
            title={wheelDirectZoom ? 'Direct Wheel Zoom Active (Mouse wheel zooms diagram directly)' : 'Direct Wheel Zoom Off (Scroll wheel scrolls page, Ctrl+Wheel zooms)'}
            aria-label="Toggle Direct Scroll Zoom"
            style={wheelDirectZoom ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff', borderColor: 'var(--brand-blue)' } : {}}
          >
            <MousePointer style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-icon"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 style={{ width: 14, height: 14 }} /> : <Maximize2 style={{ width: 14, height: 14 }} />}
          </button>
        </div>

        {/* Center: Presentation Settings (Theme & Background) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Background selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }} className="desktop-only">
              Backdrop:
            </span>
            <select
              value={presentation.backgroundType}
              onChange={(e) => onPresentationChange({ backgroundType: e.target.value as BackgroundType })}
              className="select"
              style={{ minWidth: '124px', width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.75rem' }}
              aria-label="Diagram Backdrop"
            >
              <option value="transparent">Checkerboard</option>
              <option value="white">White</option>
              <option value="dark">Dark</option>
              <option value="custom">Custom Color</option>
            </select>
            {presentation.backgroundType === 'custom' && (
              <input
                type="color"
                value={presentation.customBackgroundColor}
                onChange={(e) => onPresentationChange({ customBackgroundColor: e.target.value })}
                style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                title="Choose background color"
                aria-label="Custom background color"
              />
            )}
          </div>

          {/* Theme selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600 }} className="desktop-only">
              Theme:
            </span>
            <select
              value={presentation.theme}
              onChange={(e) => onPresentationChange({ theme: e.target.value as MermaidTheme })}
              className="select"
              style={{ minWidth: '96px', width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.75rem' }}
              aria-label="Mermaid Theme"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="neutral">Neutral</option>
              <option value="base">Base</option>
            </select>
          </div>
        </div>

        {/* Right: Quick Clipboard Copies */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-only">
          <button
            onClick={handleCopySvg}
            className="btn btn-secondary btn-sm"
            title="Copy SVG markup to clipboard"
          >
            {copiedType === 'svg' ? <Check style={{ width: 12, height: 12, color: 'var(--badge-green-text)' }} /> : <Copy style={{ width: 12, height: 12 }} />}
            <span>Copy SVG</span>
          </button>
          <button
            onClick={handleCopyPng}
            className="btn btn-secondary btn-sm"
            title="Copy raster PNG image to clipboard"
          >
            {copiedType === 'png' ? <Check style={{ width: 12, height: 12, color: 'var(--badge-green-text)' }} /> : <Image style={{ width: 12, height: 12 }} />}
            <span>Copy PNG</span>
          </button>
        </div>
      </div>

      {/* Out-of-date notice if current source has a syntax error */}
      {isStale && (
        <div style={{
          backgroundColor: 'var(--badge-amber-bg)',
          borderBottom: '1px solid var(--badge-amber-border)',
          color: 'var(--badge-amber-text)',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 15,
        }}>
          <AlertCircle style={{ width: 14, height: 14 }} />
          <span>Showing last valid diagram preview (source currently contains syntax errors).</span>
        </div>
      )}

      {/* Canvas Area with Pan & Zoom */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : (isPanMode || isFullscreen) ? 'grab' : 'default',
          backgroundColor: presentation.backgroundType === 'transparent' ? undefined : getCanvasBackground(),
          touchAction: (isPanMode || isFullscreen) ? 'none' : 'pan-y',
        }}
        className={presentation.backgroundType === 'transparent' ? 'canvas-checkerboard' : ''}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {svg ? (
          <div
            className="diagram-svg-wrapper"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: width > 0 ? `${width}px` : 'auto',
              height: height > 0 ? `${height}px` : 'auto',
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
              transformOrigin: 'center center',
              transition: (isDragging || isWheelZooming) ? 'none' : 'transform 120ms cubic-bezier(0.2, 0, 0, 1)',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-sub)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Layers style={{ width: 44, height: 44, opacity: 0.3 }} />
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                No Diagram Rendered
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', maxWidth: '340px', marginTop: '4px' }}>
                Paste Mermaid code into the editor on the left, import a file, or choose from our pre-built templates.
              </p>
            </div>
            <button onClick={onOpenTemplates} className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>Browse 18+ Templates</span>
            </button>
          </div>
        )}

        {/* Non-intrusive floating hint to guide user on how to zoom without hijacking scroll */}
        {showScrollHint && !isFullscreen && !wheelDirectZoom && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(18, 18, 20, 0.88)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}>
            <MousePointer style={{ width: 14, height: 14, color: 'var(--brand-blue)' }} />
            <span>{isMac ? 'Hold ⌘ + scroll to zoom diagram' : 'Hold Ctrl + scroll to zoom diagram'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
