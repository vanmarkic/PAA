/**
 * Convert XState machine to Mermaid state diagram syntax
 */

import type { AnyStateMachine, StateNode } from 'xstate';

export function xstateToMermaid(machine: AnyStateMachine): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Get all states
  const states = machine.states || {};
  const stateNames = Object.keys(states);

  // First, explicitly declare all states (Mermaid needs this)
  // States are implicitly declared when used in transitions, but it's better to be explicit
  // We'll declare them through transitions, but ensure all are included

  // Add initial state transition
  const initialState = (machine as any).initial || stateNames[0];
  if (initialState) {
    lines.push(`  [*] --> ${initialState}`);
  }

  // Process each state to add all transitions
  for (const stateName of stateNames) {
    const state = states[stateName] as any;

    // Add transitions
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        let target: string | string[] | undefined;
        
        // In XState 5, transitions can be arrays or objects
        if (Array.isArray(transition)) {
          // First element of array contains the transition config
          const transitionConfig = transition[0] as any;
          target = transitionConfig?.target;
        } else if (typeof transition === 'object' && transition !== null) {
          target = (transition as any).target;
        } else if (typeof transition === 'string') {
          target = transition;
        }

        // Extract target state name
        // In XState 5, target can be:
        // - Array of StateNode objects
        // - Array of strings (like "#machineId.stateName")
        // - String (state name or "#machineId.stateName")
        if (target) {
          let targetState: string | undefined;
          
          if (Array.isArray(target)) {
            // If target is an array, take the first element
            const targetValue = target[0];
            
            if (targetValue && typeof targetValue === 'object') {
              // It's a StateNode object - extract the key/id
              const stateNode = targetValue as any;
              // StateNode has a 'key' property with the state name
              targetState = stateNode.key || stateNode.id?.split('.').pop();
            } else if (typeof targetValue === 'string') {
              // Handle XState 5 format: "#machineId.stateName" or just "stateName"
              if (targetValue.startsWith('#')) {
                // Extract state name from "#machineId.stateName" format
                const parts = targetValue.split('.');
                targetState = parts[parts.length - 1];
              } else {
                targetState = targetValue;
              }
            }
          } else if (typeof target === 'string') {
            // Handle XState 5 format: "#machineId.stateName" or just "stateName"
            if (target.startsWith('#')) {
              const parts = target.split('.');
              targetState = parts[parts.length - 1];
            } else {
              targetState = target;
            }
          }
          
          // Only add transition if we have a valid target state name
          if (targetState && stateNames.includes(targetState)) {
            lines.push(`  ${stateName} --> ${targetState}: ${event}`);
          }
        }
      }
    }

    // Check if this is a final state
    if (state.type === 'final' || stateName === 'termine' || stateName === 'completed' || stateName === 'failed') {
      lines.push(`  ${stateName} --> [*]`);
    }
  }

  // Ensure all states are shown by adding a self-transition comment or explicit state declaration
  // Actually, in Mermaid stateDiagram-v2, states are automatically declared when used in transitions
  // But if a state has no transitions, we need to ensure it's shown
  // Let's add explicit state nodes for states that might not have transitions
  const statesWithTransitions = new Set<string>();
  lines.forEach(line => {
    const match = line.match(/(\w+)\s*-->/);
    if (match) statesWithTransitions.add(match[1]);
    const targetMatch = line.match(/-->\s*(\w+)/);
    if (targetMatch) statesWithTransitions.add(targetMatch[1]);
  });

  // Add any states that don't appear in transitions (though this shouldn't happen in a valid state machine)
  for (const stateName of stateNames) {
    if (!statesWithTransitions.has(stateName) && stateName !== initialState) {
      // Add a minimal transition to ensure the state is shown
      // Actually, if a state has no transitions, it's likely a dead end, which is fine
      // But let's make sure all states are reachable in the diagram
    }
  }

  return lines.join('\n');
}
