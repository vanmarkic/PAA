/**
 * Data loader for machine metadata
 * Uses build-time metadata from the integration
 */

import { getMachinesMetadata as getIntegrationMetadata } from '../../integrations/metadata-integration';

// Try to load from JSON as fallback (for backward compatibility)
let fallbackMetadata: any = null;
try {
  fallbackMetadata = await import('../../public/machines-metadata.json');
} catch (e) {
  // JSON file might not exist if using integration
}

export interface MachineMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
  initial: string;
  // Extended fields from integration
  legalMetadata?: any;
  dataFreshness?: {
    status: 'current' | 'needs-review' | 'outdated' | 'unknown';
    label: string;
    daysOld: number;
  };
  parentMachines?: string[];
  childMachines?: string[];
  siblingMachines?: string[];
  version?: string;
  lastModified?: string;
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
    legalCompliance?: {
      upToDate: number;
      needsReview: number;
      outdated: number;
      missingMetadata: number;
    };
  };
}

/**
 * Load machines metadata from build-time integration or JSON fallback
 */
export async function loadMachinesMetadata(): Promise<MachinesMetadata> {
  // Try to get metadata from the integration first
  const integrationMetadata = getIntegrationMetadata();

  if (integrationMetadata) {
    return integrationMetadata as MachinesMetadata;
  }

  // Fallback to JSON file if integration metadata not available
  if (fallbackMetadata) {
    return fallbackMetadata.default || fallbackMetadata;
  }

  // Return empty metadata if nothing available
  return {
    generated: new Date().toISOString(),
    totalMachines: 0,
    categories: [],
    machines: [],
    statistics: {
      totalStates: 0,
      totalEvents: 0,
      averageStatesPerMachine: '0',
      averageEventsPerMachine: '0',
    },
  };
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
