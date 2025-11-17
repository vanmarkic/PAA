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
  // Note: src/workflows is a symlink to ../../src/workflows
  const machines = import.meta.glob<{ [key: string]: AnyStateMachine }>(
    '../workflows/**/*Machine.ts',
    { eager: false }
  );

  // Debug: log available paths
  const availablePaths = Object.keys(machines);
  console.log(`[machine-loader] Looking for machine: ${machineId}`);
  console.log(`[machine-loader] Available paths (${availablePaths.length}):`, availablePaths.slice(0, 5));

  // Find the machine file that matches this ID
  // Try multiple matching strategies
  const machinePath = availablePaths.find(path => {
    const filename = path.split('/').pop()?.replace('.ts', '');
    const normalizedPath = path.toLowerCase();
    const normalizedId = machineId.toLowerCase();

    // Match: declarationTVAMachine.ts or declarationTVA.ts
    return filename === `${machineId}Machine` ||
           filename === machineId ||
           filename?.toLowerCase() === `${normalizedId}machine` ||
           normalizedPath.includes(`/${normalizedId}machine.ts`);
  });

  if (!machinePath) {
    throw new Error(
      `Machine file not found for ID: ${machineId}\n` +
      `Expected: src/workflows/**/${machineId}Machine.ts\n` +
      `Available paths: ${availablePaths.length} total\n` +
      `Sample: ${availablePaths.slice(0, 3).join(', ')}`
    );
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
  const machines = import.meta.glob('../workflows/**/*Machine.ts');
  return Object.keys(machines).some(path => {
    const filename = path.split('/').pop()?.replace('.ts', '');
    return filename === `${machineId}Machine` || filename === machineId;
  });
}
