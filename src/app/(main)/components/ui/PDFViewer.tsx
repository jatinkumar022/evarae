'use client';

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  file: string | null;
  onError?: (error: Error) => void;
}

interface PDFJSLib {
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PDFDocument> };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

interface PDFDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPage>;
}

interface PDFPage {
  getViewport: (options: { scale: number }) => PDFViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }) => { promise: Promise<void> };
}

interface PDFViewport {
  width: number;
  height: number;
}

declare global {
  interface Window {
    pdfjsLib?: PDFJSLib;
  }
}

export default function PDFViewer({ file, onError }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scale, setScale] = useState(2.0);
  const pdfDocRef = useRef<PDFDocument | null>(null);
  const numPagesRef = useRef<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Load PDF.js from CDN
  useEffect(() => {
    if (typeof window === 'undefined' || scriptLoaded) return;

    if (window.pdfjsLib) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        setScriptLoaded(true);
      }
    };
    script.onerror = () => {
      console.error('[PDFViewer] Failed to load PDF.js script');
      setError('Failed to load PDF viewer');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [scriptLoaded]);

  // Load and render PDF
  useEffect(() => {
    if (!file || !scriptLoaded || !window.pdfjsLib || !containerRef.current) return;

    const loadPDF = async () => {
      if (!window.pdfjsLib) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(file);
        const arrayBuffer = await response.arrayBuffer();

        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdfDoc.numPages;
        pdfDocRef.current = pdfDoc;
        numPagesRef.current = numPages;

        await renderPages(scale);
        setIsLoading(false);
      } catch (err) {
        console.error('[PDFViewer] Error loading PDF:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [file, scriptLoaded, onError, scale]);

  // Calculate container height
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const calculateHeight = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const zoomControls = wrapperRef.current.querySelector('.zoom-controls');
        const zoomControlsHeight = zoomControls ? zoomControls.getBoundingClientRect().height : 0;
        const availableHeight = rect.height - zoomControlsHeight;
        setContainerHeight(availableHeight);
      }
    };

    // Calculate after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateHeight, 0);
    calculateHeight();

    window.addEventListener('resize', calculateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateHeight);
    };
  }, [isLoading, error]);

  // Re-render when scale changes
  useEffect(() => {
    if (pdfDocRef.current && scriptLoaded && containerRef.current) {
      renderPages(scale);
    }
  }, [scale, scriptLoaded]);

  const renderPages = async (currentScale: number) => {
    if (!pdfDocRef.current || !containerRef.current || !window.pdfjsLib) return;

    const container = containerRef.current;
    const pdfDoc = pdfDocRef.current;
    const numPages = numPagesRef.current;

    if (!container) return;

    container.innerHTML = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });

      let finalScale = currentScale;
      const screenWidth = window.innerWidth;
      if (viewport.width > screenWidth * 2) {
        finalScale = ((screenWidth * 1.5) / viewport.width) * currentScale;
        const adjustedViewport = page.getViewport({ scale: finalScale });
        viewport.width = adjustedViewport.width;
        viewport.height = adjustedViewport.height;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      const dpr = window.devicePixelRatio || 1;
      const outputScale = dpr;

      canvas.height = viewport.height * outputScale;
      canvas.width = viewport.width * outputScale;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.maxWidth = 'none';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 1rem auto';
      canvas.style.marginBottom = '1rem';
      canvas.className = 'shadow-lg';

      context.scale(outputScale, outputScale);

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale: finalScale }),
      }).promise;

      container.appendChild(canvas);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(4.0, prev + 0.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.5));
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .pdf-viewer-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .pdf-viewer-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .pdf-viewer-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .pdf-viewer-container::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .dark .pdf-viewer-container::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
        .dark .pdf-viewer-container::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }
        .pdf-viewer-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .dark .pdf-viewer-container {
          scrollbar-color: #475569 transparent;
        }
      `}</style>
      <div ref={wrapperRef} className="w-full h-full flex flex-col overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]" style={{ minHeight: 0 }}>
        {/* Zoom Controls */}
        {!isLoading && !error && (
          <div className="zoom-controls flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-w-[3rem] sm:min-w-[4rem] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 4.0}
                className="p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <button
              onClick={() => setScale(2.0)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              Reset
            </button>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] flex-shrink-0">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={containerRef}
          className="pdf-viewer-container overflow-y-auto overflow-x-auto p-2 sm:p-4 md:p-6"
          style={{
            display: isLoading ? 'none' : 'block',
            height: containerHeight > 0 ? `${containerHeight}px` : 'auto',
            flex: containerHeight > 0 ? 'none' : '1 1 0',
            minHeight: 0,
            overscrollBehavior: 'contain',
            touchAction: 'pan-x pan-y',
            WebkitOverflowScrolling: 'touch',
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        />
      </div>
    </>
  );
}
