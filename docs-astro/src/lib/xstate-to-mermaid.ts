/**
 * Convert XState machine to Mermaid state diagram syntax
 */

import type { AnyStateMachine, StateNode } from 'xstate';

export function xstateToMermaid(machine: AnyStateMachine): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Add machine description if available
  if (machine.description) {
    lines.push(`  note right of [*]: ${machine.description}`);
  }

  // Get all states
  const states = machine.states || {};
  const stateNames = Object.keys(states);

  // Add initial state
  const initialState = machine.initial || stateNames[0];
  if (initialState) {
    lines.push(`  [*] --> ${initialState}`);
  }

  // Process each state
  for (const stateName of stateNames) {
    const state = states[stateName] as any;

    // Add state description as note
    if (state.meta?.description) {
      lines.push(`  note right of ${stateName}: ${state.meta.description}`);
    }

    // Add transitions
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        const target = Array.isArray(transition)
          ? (transition[0] as any).target
          : (transition as any).target || transition;

        if (target) {
          const targetState = Array.isArray(target) ? target[0] : target;
          lines.push(`  ${stateName} --> ${targetState}: ${event}`);
        }
      }
    }

    // Check if this is a final state
    if (state.type === 'final' || stateName === 'termine' || stateName === 'completed' || stateName === 'failed') {
      lines.push(`  ${stateName} --> [*]`);
    }
  }

  return lines.join('\n');
}
