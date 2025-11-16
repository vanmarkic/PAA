/**
 * StatelyInspector Component
 * Lazy-loads XState machine for interactive visualization with Intersection Observer
 * Note: @stately/inspect package not available, so shows machine metadata instead
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { AnyStateMachine } from 'xstate';

interface Props {
  machineId: string;
  machineName: string;
}

export default function StatelyInspector({ machineId, machineName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [machine, setMachine] = useState<AnyStateMachine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // Load machine when visible
  useEffect(() => {
    if (!isVisible) return;

    async function loadInspector() {
      setIsLoading(true);

      try {
        // Dynamic import of machine loader
        const { loadMachine } = await import('../lib/machine-loader');

        // Load the actual XState machine
        const loadedMachine = await loadMachine(machineId);
        setMachine(loadedMachine);

        // Log successful load
        console.log('Machine loaded:', loadedMachine);

      } catch (err) {
        console.error('Failed to load machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadInspector();
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

      {machine && !error && (
        <div className="machine-info">
          <h3>Machine Loaded: {machine.id || machineId}</h3>
          <div className="machine-details">
            <p><strong>Total States:</strong> {Object.keys(machine.states || {}).length}</p>
            {Object.keys(machine.states || {}).length > 0 && (
              <div className="states-preview">
                <strong>State List:</strong>
                <div className="states-list">
                  {Object.keys(machine.states).map(state => (
                    <span key={state} className="state-badge">{state}</span>
                  ))}
                </div>
              </div>
            )}
            <details className="machine-json">
              <summary>View Machine Definition (JSON)</summary>
              <pre>{JSON.stringify(machine, (key, value) => {
                // Exclude functions from JSON output
                if (typeof value === 'function') return '[Function]';
                return value;
              }, 2)}</pre>
            </details>
            <p className="placeholder-note"><em>Full Stately Inspector visualization can be integrated when @stately/inspect becomes available.</em></p>
          </div>
        </div>
      )}
    </div>
  );
}
