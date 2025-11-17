/**
 * Interactive State Machine Component
 * Allows users to run and interact with XState machines
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { AnyStateMachine, AnyActorRef } from 'xstate';
import { createActor } from 'xstate';

interface Props {
  machineId: string;
  machineName: string;
}

export default function InteractiveMachine({ machineId, machineName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<AnyActorRef | null>(null); // Track actor for cleanup
  const [isVisible, setIsVisible] = useState(false);
  const [machine, setMachine] = useState<AnyStateMachine | null>(null);
  const [actor, setActor] = useState<AnyActorRef | null>(null);
  const [currentState, setCurrentState] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stateHistory, setStateHistory] = useState<string[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');

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

  // Load machine and render Mermaid diagram
  useEffect(() => {
    if (!isVisible) return;

    let isCancelled = false;

    async function loadAndStartMachine() {
      setIsLoading(true);
      setError(null);

      try {
        // Load the machine
        const { loadMachine } = await import('../lib/machine-loader');
        const loadedMachine = await loadMachine(machineId);
        
        if (isCancelled) return;
        
        setMachine(loadedMachine);

        // Generate Mermaid diagram
        const { xstateToMermaid } = await import('../lib/xstate-to-mermaid');
        const mermaid = xstateToMermaid(loadedMachine);
        setMermaidCode(mermaid);

        // Create and start actor
        const newActor = createActor(loadedMachine);

        // Subscribe to state changes
        newActor.subscribe((snapshot) => {
          if (isCancelled) return;
          
          // Handle both string and object state values
          const stateValue = snapshot.value;
          const stateString = typeof stateValue === 'string' 
            ? stateValue 
            : JSON.stringify(stateValue);
          setCurrentState(stateString);
          setStateHistory(prev => [...prev, stateString].slice(-10)); // Keep last 10 states

          // Get available events for current state
          // Handle hierarchical states (object values)
          const stateKey = typeof stateValue === 'string' 
            ? stateValue 
            : Object.keys(stateValue)[0];
          const stateConfig = (loadedMachine.states as any)[stateKey];
          const events = stateConfig?.on ? Object.keys(stateConfig.on) : [];
          setAvailableEvents(events);
        });

        newActor.start();
        actorRef.current = newActor;
        setActor(newActor);

        console.log('Machine started:', loadedMachine.id);

      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to load machine:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAndStartMachine();

    // Cleanup
    return () => {
      isCancelled = true;
      if (actorRef.current) {
        actorRef.current.stop();
        actorRef.current = null;
        setActor(null);
      }
    };
  }, [isVisible, machineId]);

  // Initialize Mermaid once
  useEffect(() => {
    let isCancelled = false;

    async function initMermaid() {
      try {
        const mermaid = await import('mermaid');
        mermaid.default.initialize({ 
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
      } catch (err) {
        console.error('Failed to initialize Mermaid:', err);
      }
    }

    initMermaid();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Render Mermaid diagram
  useEffect(() => {
    if (!mermaidCode || !mermaidRef.current || !isVisible) return;

    let isCancelled = false;

    async function renderMermaid() {
      try {
        const mermaid = await import('mermaid');

        if (isCancelled || !mermaidRef.current) return;

        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Create a unique ID for this diagram
        const diagramId = `mermaid-${machineId}-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.default.render(diagramId, mermaidCode);
        
        if (isCancelled || !mermaidRef.current) return;
        
        mermaidRef.current.innerHTML = svg;
      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err);
        if (mermaidRef.current && !isCancelled) {
          mermaidRef.current.innerHTML = `<p style="color: #c33; padding: 1rem;">Failed to render diagram: ${err instanceof Error ? err.message : 'Unknown error'}</p>`;
        }
      }
    }

    renderMermaid();

    return () => {
      isCancelled = true;
    };
  }, [mermaidCode, machineId, isVisible]);

  // Send event to actor
  const sendEvent = (eventName: string) => {
    if (actor) {
      try {
        actor.send({ type: eventName });
        console.log(`Sent event: ${eventName}`);
      } catch (err) {
        console.error('Error sending event:', err);
        setError(`Failed to send event ${eventName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  // Reset machine to initial state
  const resetMachine = () => {
    if (machine) {
      // Stop the current actor
      if (actorRef.current) {
        actorRef.current.stop();
        actorRef.current = null;
      }

      // Create a fresh actor
      const newActor = createActor(machine);

      newActor.subscribe((snapshot) => {
        // Handle both string and object state values
        const stateValue = snapshot.value;
        const stateString = typeof stateValue === 'string' 
          ? stateValue 
          : JSON.stringify(stateValue);
        setCurrentState(stateString);
        setStateHistory(prev => [...prev, stateString].slice(-10));
        
        // Handle hierarchical states (object values)
        const stateKey = typeof stateValue === 'string' 
          ? stateValue 
          : Object.keys(stateValue)[0];
        const stateConfig = (machine.states as any)[stateKey];
        const events = stateConfig?.on ? Object.keys(stateConfig.on) : [];
        setAvailableEvents(events);
      });

      newActor.start();
      actorRef.current = newActor;
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
          <button 
            onClick={() => {
            setError(null);
            setIsLoading(false);
            setActor(null);
            actorRef.current = null;
            setMachine(null);
            setMermaidCode('');
            // Trigger re-initialization by toggling visibility
            setIsVisible(false);
            setTimeout(() => setIsVisible(true), 100);
            }}
            className="retry-btn"
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {isVisible && !error && (
        <div className="machine-interactive">
          {/* Mermaid Diagram Visualization */}
          <div className="diagram-panel">
            <h3>State Diagram</h3>
            <div className="mermaid-wrapper">
              {isLoading && (
                <div className="diagram-loading">
                  <p>Loading diagram...</p>
                </div>
              )}
              {!isLoading && mermaidCode && (
                <div ref={mermaidRef} className="mermaid-container" />
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
