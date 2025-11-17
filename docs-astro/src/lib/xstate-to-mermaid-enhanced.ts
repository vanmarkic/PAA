/**
 * Enhanced XState to Mermaid converter
 * Includes guards, actions, and metadata in the diagram
 */

import type { AnyStateMachine } from 'xstate';

export function xstateToEnhancedMermaid(machine: AnyStateMachine): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Get all states
  const states = machine.states || {};
  const stateNames = Object.keys(states);

  // Add initial state transition
  const initialState = (machine as any).initial || stateNames[0];
  if (initialState) {
    lines.push(`  [*] --> ${sanitizeStateName(initialState)}`);
  }

  // Track which states have metadata or special properties
  const statesWithMetadata: Map<string, string[]> = new Map();

  // Process each state
  for (const stateName of stateNames) {
    const state = states[stateName] as any;
    const sanitizedName = sanitizeStateName(stateName);

    // Collect state metadata
    const metadata: string[] = [];

    // Check for entry/exit actions
    if (state.entry) {
      const entryActions = Array.isArray(state.entry) ? state.entry : [state.entry];
      metadata.push(`entry: ${entryActions.map((a: any) => getActionName(a)).join(', ')}`);
    }

    if (state.exit) {
      const exitActions = Array.isArray(state.exit) ? state.exit : [state.exit];
      metadata.push(`exit: ${exitActions.map((a: any) => getActionName(a)).join(', ')}`);
    }

    // Check for meta description
    if (state.meta?.description) {
      metadata.push(`desc: ${state.meta.description}`);
    }

    // Store metadata for later
    if (metadata.length > 0) {
      statesWithMetadata.set(sanitizedName, metadata);
    }

    // Process transitions
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        const transitions = normalizeTransitions(transition);

        for (const trans of transitions) {
          const target = extractTargetState(trans);

          if (target && stateNames.includes(target)) {
            const sanitizedTarget = sanitizeStateName(target);
            let transitionLabel = sanitizeEventName(event);

            // Add guard information if present
            const guard = extractGuard(trans);
            if (guard) {
              transitionLabel += ` [${guard}]`;
            }

            // Add action information if present
            const actions = extractActions(trans);
            if (actions.length > 0) {
              transitionLabel += ` / ${actions.join(', ')}`;
            }

            lines.push(`  ${sanitizedName} --> ${sanitizedTarget}: ${transitionLabel}`);
          }
        }
      }
    }

    // Mark final states
    if (state.type === 'final' || isFinalState(stateName)) {
      lines.push(`  ${sanitizedName} --> [*]`);
    }

    // Mark parallel states
    if (state.type === 'parallel') {
      lines.push(`  state ${sanitizedName} {`);
      lines.push(`    --`); // Parallel state separator
      lines.push(`  }`);
    }

    // Mark compound states (states with child states)
    if (state.states && Object.keys(state.states).length > 0) {
      lines.push(`  state ${sanitizedName} {`);

      // Add child states
      for (const childName of Object.keys(state.states)) {
        const childState = state.states[childName];
        const childInitial = state.initial;

        if (childInitial === childName) {
          lines.push(`    [*] --> ${sanitizeStateName(childName)}`);
        }

        // Process child state transitions
        if (childState.on) {
          for (const [event, transition] of Object.entries(childState.on)) {
            const childTransitions = normalizeTransitions(transition);
            for (const trans of childTransitions) {
              const target = extractTargetState(trans);
              if (target) {
                lines.push(`    ${sanitizeStateName(childName)} --> ${sanitizeStateName(target)}: ${sanitizeEventName(event)}`);
              }
            }
          }
        }
      }

      lines.push(`  }`);
    }
  }

  // Add state annotations with metadata
  for (const [stateName, metadata] of statesWithMetadata) {
    if (metadata.length > 0) {
      // Mermaid note syntax
      const noteContent = metadata.join('<br/>');
      lines.push(`  note right of ${stateName}`);
      lines.push(`    ${noteContent}`);
      lines.push(`  end note`);
    }
  }

  return lines.join('\n');
}

/**
 * Normalize transitions to array format
 */
function normalizeTransitions(transition: any): any[] {
  if (Array.isArray(transition)) {
    return transition;
  }
  if (typeof transition === 'object' && transition !== null) {
    return [transition];
  }
  if (typeof transition === 'string') {
    return [{ target: transition }];
  }
  return [];
}

/**
 * Extract target state from transition
 */
function extractTargetState(transition: any): string | undefined {
  if (!transition) return undefined;

  // Handle different target formats
  const target = transition.target;

  if (Array.isArray(target)) {
    const targetValue = target[0];

    if (targetValue && typeof targetValue === 'object') {
      // StateNode object
      const stateNode = targetValue as any;
      return stateNode.key || stateNode.id?.split('.').pop();
    } else if (typeof targetValue === 'string') {
      // Handle "#machineId.stateName" format
      if (targetValue.startsWith('#')) {
        const parts = targetValue.split('.');
        return parts[parts.length - 1];
      }
      return targetValue;
    }
  } else if (typeof target === 'string') {
    if (target.startsWith('#')) {
      const parts = target.split('.');
      return parts[parts.length - 1];
    }
    return target;
  }

  return undefined;
}

/**
 * Extract guard from transition
 */
function extractGuard(transition: any): string | undefined {
  if (!transition || !transition.guard) return undefined;

  const guard = transition.guard;

  // Handle different guard formats
  if (typeof guard === 'string') {
    return guard;
  }

  if (typeof guard === 'object' && guard.type) {
    return guard.type;
  }

  if (typeof guard === 'function') {
    return guard.name || 'guard';
  }

  return undefined;
}

/**
 * Extract actions from transition
 */
function extractActions(transition: any): string[] {
  if (!transition || !transition.actions) return [];

  const actions = Array.isArray(transition.actions) ? transition.actions : [transition.actions];

  return actions
    .map((action: any) => getActionName(action))
    .filter((name: string) => name !== 'unknown');
}

/**
 * Get action name from action definition
 */
function getActionName(action: any): string {
  if (typeof action === 'string') {
    return action;
  }

  if (typeof action === 'object' && action !== null) {
    if (action.type) {
      return action.type;
    }

    if (action.name) {
      return action.name;
    }
  }

  if (typeof action === 'function') {
    return action.name || 'action';
  }

  return 'unknown';
}

/**
 * Check if a state name indicates a final state
 */
function isFinalState(stateName: string): boolean {
  const finalStateNames = ['completed', 'failed', 'termine', 'success', 'error', 'done', 'final'];
  return finalStateNames.includes(stateName.toLowerCase());
}

/**
 * Sanitize state names for Mermaid compatibility
 */
function sanitizeStateName(name: string): string {
  // Replace spaces and special characters
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Sanitize event names for display
 */
function sanitizeEventName(name: string): string {
  // Convert from SCREAMING_SNAKE_CASE to readable format
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate a simpler version without metadata for fallback
 */
export function xstateToSimpleMermaid(machine: AnyStateMachine): string {
  const lines: string[] = ['stateDiagram-v2'];

  const states = machine.states || {};
  const stateNames = Object.keys(states);

  // Add initial state
  const initialState = (machine as any).initial || stateNames[0];
  if (initialState) {
    lines.push(`  [*] --> ${sanitizeStateName(initialState)}`);
  }

  // Process states and transitions
  for (const stateName of stateNames) {
    const state = states[stateName] as any;
    const sanitizedName = sanitizeStateName(stateName);

    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        const transitions = normalizeTransitions(transition);

        for (const trans of transitions) {
          const target = extractTargetState(trans);

          if (target && stateNames.includes(target)) {
            const sanitizedTarget = sanitizeStateName(target);
            lines.push(`  ${sanitizedName} --> ${sanitizedTarget}: ${sanitizeEventName(event)}`);
          }
        }
      }
    }

    // Mark final states
    if (state.type === 'final' || isFinalState(stateName)) {
      lines.push(`  ${sanitizedName} --> [*]`);
    }
  }

  return lines.join('\n');
}