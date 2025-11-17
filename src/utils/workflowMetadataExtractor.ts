/**
 * Workflow Metadata Extractor
 * Extracts metadata from XState machines for API exposure
 */

import * as fs from 'fs';
import * as path from 'path';

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  plainLanguageDescription?: string;
  initialState: string;
  states: Array<{
    name: string;
    description?: string;
    transitions: Array<{
      event: string;
      target?: string;
      guard?: string;
    }>;
  }>;
  version?: string;
  legalReferences?: Array<{
    type: string;
    name: string;
    url: string;
    articles?: string[];
  }>;
  gherkinFile?: string;
}

// Import all workflow machines dynamically
const workflowsDir = path.join(__dirname, '../workflows');

// Map of workflow IDs to their metadata
const workflowMetadataMap = new Map<string, WorkflowMetadata>();

// Pre-defined metadata for known workflows
const predefinedMetadata: Record<string, Partial<WorkflowMetadata>> = {
  risMachine: {
    name: 'RIS Application Workflow',
    description: 'State machine for RIS (Revenu d\'Intégration Sociale) benefit eligibility and application management',
    plainLanguageDescription: 'Ce workflow détermine si une personne est éligible au Revenu d\'Intégration Sociale (RIS) en vérifiant ses revenus, sa résidence, son âge et son statut d\'emploi.',
    version: '2.1.0',
    legalReferences: [
      {
        type: 'Loi',
        name: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
        url: 'https://www.ejustice.just.fgov.be/eli/loi/2002/05/26/2002022559',
        articles: ['Art. 3', 'Art. 6', 'Art. 14']
      }
    ],
    gherkinFile: 'features/social/ris.feature'
  },
  allocationsFamiliales: {
    name: 'Family Allowances Workflow',
    description: 'Calculates family allowance payments based on household composition',
    plainLanguageDescription: 'Ce workflow calcule les allocations familiales mensuelles en fonction du nombre d\'enfants, de leur âge, et de la situation familiale.',
    version: '2.0.0',
    legalReferences: [
      {
        type: 'Décret',
        name: 'Décret du 8 février 2018 relatif au soutien des familles',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2018/02/08/2018200986',
        articles: ['Art. 5', 'Art. 12']
      }
    ],
    gherkinFile: 'features/family/allowances.feature'
  },
  allocationsChomage: {
    name: 'Unemployment Benefits Workflow',
    description: 'Processes unemployment benefit claims and calculates payment amounts',
    plainLanguageDescription: 'Ce workflow traite les demandes d\'allocations de chômage. Il vérifie l\'historique d\'emploi et calcule le montant des prestations.',
    version: '3.2.1',
    legalReferences: [
      {
        type: 'Arrêté Royal',
        name: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
        url: 'https://www.ejustice.just.fgov.be/eli/arrete/1991/11/25/1991013073',
        articles: ['Art. 30', 'Art. 44', 'Art. 66']
      }
    ],
    gherkinFile: 'features/social/unemployment.feature'
  },
  aideLogement: {
    name: 'Housing Assistance Workflow',
    description: 'Evaluates eligibility for housing subsidies and rent assistance',
    plainLanguageDescription: 'Ce workflow évalue l\'éligibilité aux aides au logement, incluant les primes au loyer et les subventions pour l\'amélioration de l\'habitat.',
    version: '1.5.2',
    legalReferences: [
      {
        type: 'Arrêté',
        name: 'Code wallon du Logement et de l\'Habitat durable',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2016/03/17/2016202135',
        articles: ['Art. 70', 'Art. 88']
      }
    ],
    gherkinFile: 'features/housing/assistance.feature'
  },
  primeNaissance: {
    name: 'Birth Allowance Workflow',
    description: 'Processes birth allowance claims for new parents',
    plainLanguageDescription: 'Ce workflow traite les demandes de prime de naissance. Il vérifie l\'acte de naissance et calcule le montant de l\'allocation.',
    version: '1.2.1',
    legalReferences: [
      {
        type: 'Décret',
        name: 'Décret relatif aux prestations familiales',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2019/04/04/2019041228',
        articles: ['Art. 15']
      }
    ],
    gherkinFile: 'features/family/birth.feature'
  }
};

/**
 * Extract metadata from a workflow machine file
 */
function extractMetadataFromFile(filePath: string): WorkflowMetadata | null {
  try {
    const fileName = path.basename(filePath, '.ts');
    const workflowId = fileName.replace('Machine', '');

    // Create basic metadata
    const metadata: WorkflowMetadata = {
      id: workflowId,
      name: formatWorkflowName(workflowId),
      description: `Workflow for ${formatWorkflowName(workflowId)}`,
      initialState: 'idle',
      states: [],
      ...predefinedMetadata[workflowId]
    };

    // Try to extract states from the file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Extract states using regex patterns
    const statesMatch = fileContent.match(/states:\s*{([^}]+)}/s);
    if (statesMatch) {
      const statesContent = statesMatch[1];
      const stateNames = Array.from(statesContent.matchAll(/(\w+):\s*{/g)).map(m => m[1]);

      metadata.states = stateNames.map(stateName => {
        // Extract state description from meta
        const metaMatch = new RegExp(`${stateName}:[^}]*meta:\\s*{[^}]*description:\\s*['"\`]([^'"\`]+)['"\`]`, 's').exec(fileContent);
        const description = metaMatch ? metaMatch[1] : undefined;

        // Extract transitions for this state
        const stateBlockMatch = new RegExp(`${stateName}:\\s*{([^}]+(?:{[^}]+}[^}]+)*)}`).exec(fileContent);
        const transitions: Array<{ event: string; target?: string; guard?: string }> = [];

        if (stateBlockMatch) {
          const stateContent = stateBlockMatch[1];
          const transitionMatches = Array.from(stateContent.matchAll(/(\w+):\s*(?:{[^}]+target:\s*['"\`](\w+)['"\`]|['"\`](\w+)['"\`])/g));
          transitionMatches.forEach(match => {
            transitions.push({
              event: match[1],
              target: match[2] || match[3]
            });
          });
        }

        return {
          name: stateName,
          description,
          transitions
        };
      });
    }

    // Extract initial state
    const initialMatch = fileContent.match(/initial:\s*['"\`](\w+)['"\`]/);
    if (initialMatch) {
      metadata.initialState = initialMatch[1];
    }

    return metadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return null;
  }
}

/**
 * Format workflow ID to human-readable name
 */
function formatWorkflowName(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Machine', '')
    .trim();
}

/**
 * Load all workflow metadata
 */
async function loadAllWorkflowMetadata() {
  try {
    const files = fs.readdirSync(workflowsDir);
    const workflowFiles = files.filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of workflowFiles) {
      const filePath = path.join(workflowsDir, file);
      const metadata = extractMetadataFromFile(filePath);
      if (metadata) {
        workflowMetadataMap.set(metadata.id, metadata);
      }
    }
  } catch (error) {
    console.error('Error loading workflow metadata:', error);
  }
}

// Load metadata on initialization
loadAllWorkflowMetadata();

/**
 * Get all workflow metadata
 */
export async function getAllWorkflowMetadata(): Promise<WorkflowMetadata[]> {
  if (workflowMetadataMap.size === 0) {
    await loadAllWorkflowMetadata();
  }
  return Array.from(workflowMetadataMap.values());
}

/**
 * Get workflow metadata by ID
 */
export async function getWorkflowMetadataById(id: string): Promise<WorkflowMetadata | null> {
  if (workflowMetadataMap.size === 0) {
    await loadAllWorkflowMetadata();
  }

  // Try exact match first
  if (workflowMetadataMap.has(id)) {
    return workflowMetadataMap.get(id) || null;
  }

  // Try with 'Machine' suffix
  if (workflowMetadataMap.has(id + 'Machine')) {
    return workflowMetadataMap.get(id + 'Machine') || null;
  }

  // Try without 'Workflow' suffix
  const withoutWorkflow = id.replace('Workflow', '');
  if (workflowMetadataMap.has(withoutWorkflow)) {
    return workflowMetadataMap.get(withoutWorkflow) || null;
  }

  return null;
}