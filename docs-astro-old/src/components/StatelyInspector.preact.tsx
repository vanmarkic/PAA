/**
 * StatelyInspector Component
 * Lazy-loads XState machine for interactive visualization with Stately Inspector
 * Uses @statelyai/inspect to display interactive state machine diagrams
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { AnyStateMachine } from 'xstate';
import { createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

interface Props {
  machineId: string;
  machineName: string;
}

export default function StatelyInspector({ machineId, machineName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [machine, setMachine] = useState<AnyStateMachine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actor, setActor] = useState<any>(null);

  // Intersection Observer - load when scrolled into view
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load 100px before visible
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Load machine and initialize inspector when visible
  useEffect(() => {
    if (!isVisible || !iframeRef.current) return;

    async function loadInspector() {
      setIsLoading(true);

      try {
        // Dynamic import of machine loader
        const { loadMachine } = await import('../lib/machine-loader');

        // Load the actual XState machine
        const loadedMachine = await loadMachine(machineId);
        setMachine(loadedMachine);

        // Create browser inspector with iframe
        const { inspect } = createBrowserInspector({
          iframe: iframeRef.current!,
          autoStart: true,
        });

        // Create and start actor with inspector
        const newActor = createActor(loadedMachine, {
          inspect,
        });

        newActor.start();
        setActor(newActor);

        console.log('Machine loaded and inspector started:', loadedMachine.id);

      } catch (err) {
        console.error('Failed to load machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadInspector();

    // Cleanup: stop actor when component unmounts
    return () => {
      if (actor) {
        actor.stop();
      }
    };
  }, [isVisible, machineId]);

  return (
    <div ref={containerRef} className="stately-inspector-container">
      {!isVisible && (
        <div className="skeleton">
          <p>Loading {machineName} visualization...</p>
        </div>
      )}

      {isLoading && isVisible && (
        <div className="skeleton">
          <p>Loading machine definition...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p><strong>Failed to load machine:</strong></p>
          <p>{error}</p>
          <details>
            <summary>Troubleshooting</summary>
            <ul>
              <li>Machine ID: {machineId}</li>
              <li>Expected file: src/workflows/**/{machineId}Machine.ts</li>
            </ul>
          </details>
        </div>
      )}

      {isVisible && !error && (
        <div className="inspector-wrapper">
          <iframe
            ref={iframeRef}
            className="stately-inspector-iframe"
            title={`Inspector for ${machineName}`}
            sandbox="allow-scripts allow-same-origin allow-popups"
            allow="accelerometer 'none'; camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'"
          />
          {machine && (
            <div className="machine-meta">
              <small>
                Machine: <strong>{machine.id || machineId}</strong> •
                States: <strong>{Object.keys(machine.states || {}).length}</strong>
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
