/**
 * Safe machine loader that works during SSG build
 * Loads from metadata instead of actual XState files
 */

export async function loadMachineMetadata(machineId: string): Promise<any> {
  try {
    // During SSG build, import the metadata directly
    if (typeof window === 'undefined') {
      try {
        // Import the metadata file directly during build
        const metadata = await import('../../public/machines-metadata.json');
        const machineData = metadata.machines.find((m: any) => m.id === machineId);

        if (machineData) {
          return machineData;
        }
      } catch (err) {
        console.log('Direct import failed, trying alternative...');
      }
    }

    // For client-side, use fetch
    if (typeof window !== 'undefined') {
      const paths = [
        '/PAA/machines-metadata.json',
        '/machines-metadata.json',
        './machines-metadata.json'
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const metadata = await response.json();
            const machineData = metadata.machines.find((m: any) => m.id === machineId);

            if (machineData) {
              return machineData;
            }
          }
        } catch (err) {
          // Try next path
          continue;
        }
      }
    }

    throw new Error(`Machine metadata not found for ID: ${machineId}`);
  } catch (err) {
    throw new Error(`Failed to load machine metadata: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Generate a simple Mermaid diagram from machine metadata
 */
export function generateMermaidFromMetadata(machineData: any): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Add initial state
  if (machineData.initial) {
    lines.push(`  [*] --> ${sanitizeName(machineData.initial)}`);
  }

  // Identify final states
  const finalStates = ['completed', 'failed', 'termine', 'success', 'error', 'done', 'final'];

  // Add states
  if (machineData.states && Array.isArray(machineData.states)) {
    // Create a more realistic flow based on typical state machine patterns
    const states = machineData.states;

    // Common transition patterns
    const transitionPatterns = [
      { from: 'idle', to: 'loading' },
      { from: 'loading', to: 'processing' },
      { from: 'processing', to: 'validating' },
      { from: 'validating', to: 'completed' },
      { from: 'validating', to: 'failed' },
      { from: 'retry', to: 'processing' },
      { from: 'error', to: 'failed' }
    ];

    // Add transitions based on state names and patterns
    for (let i = 0; i < states.length; i++) {
      const currentState = states[i];
      const sanitizedCurrent = sanitizeName(currentState);

      // Check if it's a final state
      if (finalStates.some(fs => currentState.toLowerCase().includes(fs))) {
        lines.push(`  ${sanitizedCurrent} --> [*]`);
      } else {
        // Look for pattern matches
        const pattern = transitionPatterns.find(p =>
          currentState.toLowerCase().includes(p.from.toLowerCase())
        );

        if (pattern) {
          const targetState = states.find((s: string) =>
            s.toLowerCase().includes(pattern.to.toLowerCase())
          );

          if (targetState) {
            lines.push(`  ${sanitizedCurrent} --> ${sanitizeName(targetState)}: process`);
          }
        }

        // Add sequential transitions if no pattern matches
        if (i < states.length - 1) {
          const nextState = states[i + 1];
          const sanitizedNext = sanitizeName(nextState);

          // Avoid duplicate transitions and transitions to final states
          if (!lines.some(l => l.includes(`${sanitizedCurrent} --> ${sanitizedNext}`))) {
            lines.push(`  ${sanitizedCurrent} --> ${sanitizedNext}: next`);
          }
        }
      }
    }

    // Add error handling transitions
    if (states.includes('error') || states.includes('failed')) {
      const errorState = states.find((s: string) =>
        s.toLowerCase().includes('error') || s.toLowerCase().includes('failed')
      );

      if (errorState) {
        // Add error transitions from processing states
        const processingStates = states.filter((s: string) =>
          s.toLowerCase().includes('processing') ||
          s.toLowerCase().includes('validating') ||
          s.toLowerCase().includes('loading')
        );

        processingStates.forEach((state: string) => {
          if (!lines.some(l => l.includes(`${sanitizeName(state)} --> ${sanitizeName(errorState)}`))) {
            lines.push(`  ${sanitizeName(state)} --> ${sanitizeName(errorState)}: error`);
          }
        });
      }
    }
  }

  // Add events if available
  if (machineData.events && Array.isArray(machineData.events)) {
    // Add a note about available events
    lines.push('');
    lines.push(`  note right of ${sanitizeName(machineData.initial || 'idle')}`);
    lines.push(`    Events: ${machineData.events.slice(0, 5).join(', ')}${machineData.events.length > 5 ? '...' : ''}`);
    lines.push(`  end note`);
  }

  return lines.join('\n');
}

/**
 * Sanitize state names for Mermaid compatibility
 */
function sanitizeName(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}