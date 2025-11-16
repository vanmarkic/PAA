/**
 * Data loader for machine metadata
 * Loads the generated machines-metadata.json
 */

import metadata from '../../public/machines-metadata.json';

export interface MachineMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
  initial: string;
}

export interface MachinesMetadata {
  generated: string;
  totalMachines: number;
  categories: string[];
  machines: MachineMeta[];
  statistics: {
    totalStates: number;
    totalEvents: number;
    averageStatesPerMachine: string;
    averageEventsPerMachine: string;
  };
}

/**
 * Load machines metadata from JSON
 */
export async function loadMachinesMetadata(): Promise<MachinesMetadata> {
  // Use static import at build time
  return metadata as MachinesMetadata;
}

/**
 * Get a single machine by ID
 */
export function getMachineById(
  metadata: MachinesMetadata,
  id: string
): MachineMeta | undefined {
  return metadata.machines.find(m => m.id === id);
}

/**
 * Get all machines in a category
 */
export function getMachinesByCategory(
  metadata: MachinesMetadata,
  category: string
): MachineMeta[] {
  return metadata.machines.filter(m => m.category === category);
}

/**
 * Get category statistics
 */
export function getCategoryStats(
  metadata: MachinesMetadata,
  category: string
): {
  count: number;
  totalStates: number;
  totalEvents: number;
} {
  const machines = getMachinesByCategory(metadata, category);

  return {
    count: machines.length,
    totalStates: machines.reduce((sum, m) => sum + m.states.length, 0),
    totalEvents: machines.reduce((sum, m) => sum + m.events.length, 0),
  };
}
