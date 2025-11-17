/**
 * Interactive Mermaid Diagram Viewer Component
 * Renders and manages interaction with Mermaid state diagrams
 */

import React, { useEffect, useRef, useState } from 'react';

// Type definition for machine metadata
interface MachineMetadata {
  id: string;
  name: string;
  states: string[];
  events: string[];
  initial: string;
}

interface Props {
  machineId: string;
  machineName?: string;
}

export default function ProcedureDiagramViewer({ machineId, machineName = machineId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showCode, setShowCode] = useState(false);
  const [machine, setMachine] = useState<MachineMetadata | null>(null);

  // Load machine and generate Mermaid diagram
  useEffect(() => {
    let isCancelled = false;

    async function loadMachineAndGenerateDiagram() {
      try {
        setIsLoading(true);
        setError(null);

        // Use safe loader that works during SSG
        const { loadMachineMetadata, generateMermaidFromMetadata } = await import('../lib/machine-loader-safe');

        try {
          const machineData = await loadMachineMetadata(machineId);

          if (!isCancelled && machineData) {
            const mermaid = generateMermaidFromMetadata(machineData);
            setMermaidCode(mermaid);
            setMachine(machineData as any);
            setIsLoading(false);
            return;
          }
        } catch (metadataErr) {
          console.log('Metadata loading failed, trying dynamic import...');

          // Only try dynamic import in dev mode or client-side
          if (typeof window !== 'undefined') {
            try {
              const { loadMachine } = await import('../lib/machine-loader');
              const loadedMachine = await loadMachine(machineId);

              if (isCancelled) return;

              setMachine(loadedMachine);

              // Generate enhanced Mermaid diagram
              const { xstateToEnhancedMermaid } = await import('../lib/xstate-to-mermaid-enhanced');
              const mermaid = xstateToEnhancedMermaid(loadedMachine);
              setMermaidCode(mermaid);
            } catch (dynamicErr) {
              console.error('Dynamic loading failed:', dynamicErr);
              throw metadataErr; // Throw original error
            }
          } else {
            throw metadataErr;
          }
        }

      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to load diagram:', err);
        setError('Unable to load diagram. Please ensure the machine metadata is available.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMachineAndGenerateDiagram();

    return () => {
      isCancelled = true;
    };
  }, [machineId]);

  // Initialize and render Mermaid
  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current) return;

    let isCancelled = false;

    async function renderMermaid() {
      try {
        const mermaid = await import('mermaid');

        // Initialize Mermaid with theme and configuration
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            primaryColor: '#9333ea',
            primaryTextColor: '#fff',
            primaryBorderColor: '#7e22ce',
            lineColor: '#6b7280',
            secondaryColor: '#f3f4f6',
            tertiaryColor: '#fff',
            background: '#ffffff',
            mainBkg: '#9333ea',
            secondBkg: '#f3f4f6',
            tertiaryBkg: '#fff',
            textColor: '#111827',
            errorBkgColor: '#fee2e2',
            errorTextColor: '#b91c1c'
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 50
          },
          securityLevel: 'loose'
        });

        if (isCancelled || !mermaidRef.current) return;

        // Clear previous content
        mermaidRef.current.innerHTML = '';

        // Create unique ID for this diagram
        const diagramId = `mermaid-${machineId}-${Date.now()}`;

        // Render the diagram
        const { svg } = await mermaid.default.render(diagramId, mermaidCode);

        if (isCancelled || !mermaidRef.current) return;

        mermaidRef.current.innerHTML = svg;

        // Make SVG responsive and apply zoom
        const svgElement = mermaidRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          applyZoom(zoomLevel);
        }

      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err);
        if (mermaidRef.current && !isCancelled) {
          mermaidRef.current.innerHTML = `
            <div class="text-red-600 p-4 bg-red-50 rounded-lg">
              <p class="font-semibold">Erreur de rendu du diagramme</p>
              <p class="text-sm mt-1">${err instanceof Error ? err.message : 'Erreur inconnue'}</p>
            </div>
          `;
        }
      }
    }

    renderMermaid();

    return () => {
      isCancelled = true;
    };
  }, [mermaidCode, machineId, zoomLevel]);

  // Apply zoom to the diagram
  const applyZoom = (level: number) => {
    if (mermaidRef.current) {
      const svgElement = mermaidRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.transform = `scale(${level / 100})`;
        svgElement.style.transformOrigin = 'center top';
      }
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoomLevel + 25);
    setZoomLevel(newZoom);
  };

  // Handle zoom out
  const handleZoomOut = () => {
    const newZoom = Math.max(25, zoomLevel - 25);
    setZoomLevel(newZoom);
  };

  // Handle zoom reset
  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Failed to exit fullscreen:', err);
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Export diagram as SVG
  const exportAsSVG = () => {
    if (!mermaidRef.current) return;

    const svgElement = mermaidRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${machineId}-diagram.svg`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Copy Mermaid code to clipboard
  const copyMermaidCode = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);

      // Show temporary success message
      const button = document.querySelector('[data-action="copy-code"]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copié!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if this component is in focus
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey && showCode) {
            e.preventDefault();
            copyMermaidCode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel, showCode]);

  return (
    <div
      ref={containerRef}
      className={`diagram-viewer bg-white rounded-lg border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50 p-8' : ''}`}
      role="img"
      aria-label={`Diagramme d'état pour ${machineName}`}
      tabIndex={0}
    >
      {/* Toolbar */}
      <div className="diagram-toolbar flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Diagramme de Procédure: {machineName}
          </h3>
          {isLoading && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              Chargement...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Zoom arrière (-)"
              aria-label="Zoom arrière"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-2 text-sm font-medium text-gray-700 min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Zoom avant (+)"
              aria-label="Zoom avant"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1 hover:bg-gray-200 rounded transition-colors ml-1"
              title="Réinitialiser zoom (0)"
              aria-label="Réinitialiser zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* View code toggle */}
          <button
            onClick={() => setShowCode(!showCode)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              showCode
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
            }`}
            title="Afficher le code Mermaid"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          {/* Export button */}
          <button
            onClick={exportAsSVG}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title="Exporter en SVG"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title={isFullscreen ? "Quitter plein écran" : "Plein écran (Ctrl+F)"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="diagram-content relative">
        {error && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h4>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Recharger
            </button>
          </div>
        )}

        {isLoading && !error && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 animate-pulse">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">Chargement du diagramme...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Mermaid diagram */}
            <div
              ref={mermaidRef}
              className={`mermaid-container p-8 overflow-auto ${showCode ? 'hidden' : ''}`}
              style={{ maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}
            />

            {/* Mermaid code view */}
            {showCode && (
              <div className="code-container p-8">
                <div className="bg-gray-900 rounded-lg p-6 relative">
                  <button
                    onClick={copyMermaidCode}
                    data-action="copy-code"
                    className="absolute top-4 right-4 px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    Copier le code
                  </button>
                  <pre className="text-gray-300 text-sm overflow-x-auto">
                    <code>{mermaidCode}</code>
                  </pre>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Astuce:</strong> Vous pouvez copier ce code et l'utiliser dans n'importe quel éditeur Mermaid
                    ou documentation Markdown qui supporte les diagrammes Mermaid.
                  </p>
                  <p>
                    Raccourcis clavier: <kbd>Ctrl+C</kbd> pour copier • <kbd>+/-</kbd> pour zoomer •
                    <kbd>0</kbd> pour réinitialiser • <kbd>Ctrl+F</kbd> pour plein écran
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status bar */}
      {!isLoading && !error && machine && (
        <div className="diagram-statusbar px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <div>
              Machine: <strong>{machine.id || machineId}</strong> •
              États: <strong>{machine.states ? machine.states.length : 0}</strong> •
              État initial: <strong>{machine.initial || 'N/A'}</strong>
            </div>
            <div className="text-gray-400">
              Utilisez la molette ou les boutons pour zoomer • Double-clic pour plein écran
            </div>
          </div>
        </div>
      )}
    </div>
  );
}