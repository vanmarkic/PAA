/**
 * Dynamic loader for actual XState machine files
 * Uses Vite glob imports to load machines on-demand
 */

import type { AnyStateMachine } from 'xstate';

/**
 * Dynamically import an XState machine by ID
 * Maps machine IDs to their file paths in ../src/workflows/
 */
export async function loadMachine(machineId: string): Promise<AnyStateMachine> {
  // Use Vite's glob import for all machine files
  const machines = import.meta.glob<{ [key: string]: AnyStateMachine }>(
    '../../src/workflows/**/*Machine.ts',
    { eager: false }
  );

  // Find the machine file that matches this ID
  const machinePath = Object.keys(machines).find(path => {
    const filename = path.split('/').pop()?.replace('.ts', '');
    return filename === `${machineId}Machine` || filename === machineId;
  });

  if (!machinePath) {
    throw new Error(`Machine file not found for ID: ${machineId}`);
  }

  // Import the module
  const module = await machines[machinePath]();

  // Find the exported machine
  // Convention: export const xxxMachine = createMachine(...)
  const exportedMachine = Object.values(module).find(
    (value): value is AnyStateMachine =>
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'states' in value
  );

  if (!exportedMachine) {
    throw new Error(`No XState machine exported from ${machinePath}`);
  }

  return exportedMachine;
}

/**
 * Load multiple machines by IDs
 */
export async function loadMachines(
  machineIds: string[]
): Promise<Map<string, AnyStateMachine>> {
  const results = new Map<string, AnyStateMachine>();

  await Promise.all(
    machineIds.map(async id => {
      try {
        const machine = await loadMachine(id);
        results.set(id, machine);
      } catch (error) {
        console.error(`Failed to load machine ${id}:`, error);
      }
    })
  );

  return results;
}

/**
 * Check if a machine file exists
 */
export function machineExists(machineId: string): boolean {
  const machines = import.meta.glob('../../src/workflows/**/*Machine.ts');
  return Object.keys(machines).some(path => {
    const filename = path.split('/').pop()?.replace('.ts', '');
    return filename === `${machineId}Machine` || filename === machineId;
  });
}
