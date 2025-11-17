/**
 * Dynamic loader for actual XState machine files
 * DISABLED for SSG compatibility - use machine-loader-safe instead
 */

import type { AnyStateMachine } from 'xstate';

/**
 * Dynamically import an XState machine by ID
 * This function is disabled in favor of metadata-based loading
 */
export async function loadMachine(machineId: string): Promise<AnyStateMachine> {
  throw new Error(
    'Direct machine loading is disabled for SSG compatibility. ' +
    'Use loadMachineMetadata from machine-loader-safe instead.'
  );
}

/**
 * Load multiple machines by IDs
 * DISABLED - use metadata instead
 */
export async function loadMachines(
  machineIds: string[]
): Promise<Map<string, AnyStateMachine>> {
  throw new Error(
    'Direct machine loading is disabled for SSG compatibility. ' +
    'Use metadata-based loading instead.'
  );
}

/**
 * Check if a machine file exists
 * DISABLED - use metadata instead
 */
export function machineExists(machineId: string): boolean {
  // Always return false since direct loading is disabled
  return false;
}