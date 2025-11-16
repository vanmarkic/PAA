/**
 * Interactive State Machine Component
 * Allows users to run and interact with XState machines
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { AnyStateMachine, AnyActorRef } from 'xstate';
import { createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

interface Props {
  machineId: string;
  machineName: string;
}

export default function InteractiveMachine({ machineId, machineName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [machine, setMachine] = useState<AnyStateMachine | null>(null);
  const [actor, setActor] = useState<AnyActorRef | null>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stateHistory, setStateHistory] = useState<string[]>([]);
  const [inspectorReady, setInspectorReady] = useState(false);

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
      { rootMargin: '100px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load machine and start actor when visible
  useEffect(() => {
    if (!isVisible) return;

    // Wait for iframe to be ready
    if (!iframeRef.current) {
      console.log('[InteractiveMachine] Waiting for iframe...');
      return;
    }

    async function loadAndStartMachine() {
      setIsLoading(true);

      try {
        // Load the machine
        const { loadMachine } = await import('../lib/machine-loader');
        const loadedMachine = await loadMachine(machineId);
        setMachine(loadedMachine);

        // Create browser inspector with iframe
        const { inspect } = createBrowserInspector({
          iframe: iframeRef.current!,
          autoStart: true,
        });

        setInspectorReady(true);

        // Create and start actor with inspector
        const newActor = createActor(loadedMachine, {
          inspect, // This sends all state changes to the Stately Inspector!
        });

        // Subscribe to state changes
        newActor.subscribe((snapshot) => {
          const state = snapshot.value as string;
          setCurrentState(state);
          setStateHistory(prev => [...prev, state].slice(-10)); // Keep last 10 states

          // Get available events for current state
          const events = Object.keys((loadedMachine.states as any)[state]?.on || {});
          setAvailableEvents(events);
        });

        newActor.start();
        setActor(newActor);

        console.log('Machine started with inspector:', loadedMachine.id);

      } catch (err) {
        console.error('Failed to load machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadAndStartMachine();

    // Cleanup
    return () => {
      if (actor) {
        actor.stop();
      }
    };
  }, [isVisible, machineId]);

  // Send event to actor
  const sendEvent = (eventName: string) => {
    if (actor) {
      actor.send({ type: eventName });
      console.log(`Sent event: ${eventName}`);
    }
  };

  // Reset machine to initial state
  const resetMachine = () => {
    if (machine && iframeRef.current) {
      actor?.stop();

      // Recreate inspector
      const { inspect } = createBrowserInspector({
        iframe: iframeRef.current!,
        autoStart: true,
      });

      const newActor = createActor(machine, {
        inspect,
      });

      newActor.subscribe((snapshot) => {
        const state = snapshot.value as string;
        setCurrentState(state);
        setStateHistory(prev => [...prev, state].slice(-10));
        const events = Object.keys((machine.states as any)[state]?.on || {});
        setAvailableEvents(events);
      });

      newActor.start();
      setActor(newActor);
      setStateHistory([]);
    }
  };

  // Export machine as Mermaid diagram
  const exportMermaid = async () => {
    if (!machine) return;

    const { xstateToMermaid } = await import('../lib/xstate-to-mermaid');
    const mermaidCode = xstateToMermaid(machine);

    // Copy to clipboard
    await navigator.clipboard.writeText(mermaidCode);
    alert('Mermaid diagram copied to clipboard!');
  };

  return (
    <div ref={containerRef} className="interactive-machine-container">
      {!isVisible && (
        <div className="skeleton">
          <p>Loading {machineName} interactive machine...</p>
          <p><small>Scroll to activate</small></p>
        </div>
      )}

      {error && (
        <div className="error">
          <p><strong>Failed to load machine:</strong></p>
          <p>{error}</p>
        </div>
      )}

      {isVisible && !error && (
        <div className="machine-interactive">
          {/* Stately Inspector Visualization - Always render iframe */}
          <div className="inspector-panel">
            <h3>State Diagram (Live)</h3>
            <div className="inspector-wrapper">
              <iframe
                ref={iframeRef}
                className="stately-inspector-iframe"
                title={`Inspector for ${machineName}`}
                sandbox="allow-scripts allow-same-origin allow-popups"
                allow="accelerometer 'none'; camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'"
              />
              {(isLoading || !inspectorReady) && (
                <div className="inspector-loading">
                  <p>
                    {isLoading ? 'Loading machine...' : 'Starting Stately Inspector...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Only show controls when machine is loaded */}
          {!actor && !isLoading && !machine && (
            <div className="skeleton">
              <p>Initializing...</p>
            </div>
          )}

          {/* Current State Display - Only when actor exists */}
          {actor && machine && (
            <>
          <div className="current-state-panel">
            <h3>Current State</h3>
            <div className="state-display">
              <span className="state-badge active">{currentState}</span>
            </div>
            <div className="control-buttons">
              <button onClick={resetMachine} className="reset-btn">
                🔄 Reset Machine
              </button>
              <button onClick={exportMermaid} className="export-btn">
                📊 Export Mermaid
              </button>
            </div>
          </div>

          {/* Available Events */}
          <div className="events-panel">
            <h3>Available Events</h3>
            {availableEvents.length > 0 ? (
              <div className="event-buttons">
                {availableEvents.map(event => (
                  <button
                    key={event}
                    onClick={() => sendEvent(event)}
                    className="event-btn"
                  >
                    {event}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-events">No events available (final state)</p>
            )}
          </div>

          {/* All States Overview */}
          <div className="states-panel">
            <h3>All States</h3>
            <div className="states-grid">
              {Object.keys(machine.states || {}).map(state => (
                <span
                  key={state}
                  className={`state-badge ${state === currentState ? 'active' : ''}`}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>

          {/* State History */}
          {stateHistory.length > 0 && (
            <div className="history-panel">
              <h3>State History</h3>
              <div className="history-list">
                {stateHistory.map((state, idx) => (
                  <span key={idx} className="history-item">
                    {idx + 1}. {state}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Machine Metadata */}
          <div className="machine-meta">
            <small>
              Machine: <strong>{machine.id || machineId}</strong> •
              States: <strong>{Object.keys(machine.states || {}).length}</strong> •
              Current: <strong>{currentState}</strong>
            </small>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
