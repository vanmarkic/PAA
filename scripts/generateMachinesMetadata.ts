/**
 * Génère un fichier JSON avec les métadonnées de toutes les machines
 * Pour génération dynamique côté client
 * Inclut les métadonnées légales depuis legalMetadata.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Import legal metadata functions
// Using ts-node, we can import TypeScript files directly
let getMachineLegalMetadata: ((id: string) => any) | null = null;
let getDataFreshnessBadge: ((id: string) => any) | null = null;

try {
  // Import from TypeScript source (works with ts-node)
  // Use relative path from compiled location (scripts/compiled/) or source
  const legalMetadataModule = path.join(__dirname, '..', 'src', 'domain', 'legalMetadata');
  const helperModule = path.join(__dirname, '..', 'src', 'utils', 'machineMetadataHelper');
  
  // Try to require (ts-node will handle .ts files)
  try {
    const legalMetadata = require(legalMetadataModule);
    getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
  } catch (e) {
    // Try without extension
    try {
      const legalMetadata = require(legalMetadataModule + '.ts');
      getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
    } catch (e2) {
      // Skip if not available
    }
  }
  
  try {
    const helper = require(helperModule);
    getDataFreshnessBadge = helper.getDataFreshnessBadge;
  } catch (e) {
    // Try without extension
    try {
      const helper = require(helperModule + '.ts');
      getDataFreshnessBadge = helper.getDataFreshnessBadge;
    } catch (e2) {
      // Skip if not available
    }
  }
} catch (error) {
  console.warn('⚠️  Legal metadata not available:', (error as Error).message);
  console.warn('   This is normal if legalMetadata.ts is not accessible');
}

interface MachineMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
  initial: string;
  // Legal metadata fields (optional)
  legalMetadata?: {
    extractionDate?: string;
    lastLegislativeUpdate?: string;
    sources?: Array<{
      authority: string;
      authorityType?: string;
      region?: string;
      title: string;
      publicationDate?: string;
      effectiveDate?: string;
      officialUrl?: string;
      language?: string;
    }>;
    status?: string;
    version?: string;
  };
  versionHistory?: any[];
  dataFreshness?: {
    status: string;
    label: string;
    daysOld: number;
  };
  parentMachines?: string[];
  childMachines?: string[];
  siblingMachines?: string[];
  version?: string;
  lastModified?: string;
}

/**
 * Parse un fichier de machine pour extraire les métadonnées
 */
function parseMachineFile(filePath: string): MachineMeta | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extraction par regex
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const initialMatch = content.match(/initial:\s*['"]([^'"]+)['"]/);

  if (!idMatch || !initialMatch) return null;

  const id = idMatch[1];
  const initial = initialMatch[1];

  // Extraire les états using brace counting
  const states: string[] = [];
  const statesStart = content.indexOf('states:');
  if (statesStart !== -1) {
    const openBraceIdx = content.indexOf('{', statesStart);
    if (openBraceIdx !== -1) {
      let braceCount = 0;
      let endIdx = openBraceIdx;
      for (let i = openBraceIdx; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
      const statesContent = content.substring(openBraceIdx + 1, endIdx);
      // Extract top-level state names
      const lines = statesContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s+(\w+):\s*\{/);
        if (match && match[1] !== 'on' && match[1] !== 'meta' && match[1] !== 'entry' && match[1] !== 'exit') {
          if (!states.includes(match[1])) {
            states.push(match[1]);
          }
        }
      }
    }
  }

  // Extraire les événements
  const events: string[] = [];
  const eventMatches = content.matchAll(/type:\s*['"]([A-Z_]+)['"]/g);
  for (const match of eventMatches) {
    if (!events.includes(match[1])) {
      events.push(match[1]);
    }
  }

  // Extraction nom et description
  const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
  let name = id;
  let description = '';

  if (commentMatch) {
    const comment = commentMatch[1];
    const nameMatch = comment.match(/\*\s*(.+)/);
    if (nameMatch) {
      name = nameMatch[1].replace(/^(Machine XState pour|XState machine for)\s+/i, '').trim();
    }
    const descMatch = comment.match(/\*\s*\n\s*\*\s*(.+)/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
  }

  const category = path.basename(path.dirname(filePath));

  return {
    id,
    name,
    category: category === 'workflows' ? 'general' : category,
    description,
    states,
    events,
    initial,
  };
}

/**
 * Trouve récursivement tous les fichiers *Machine.ts
 */
function findMachineFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__tests__') {
      findMachineFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('Machine.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Exécution
async function main() {
  const machinesPath = path.join(__dirname, '..', 'src', 'workflows');
  const machineFiles = findMachineFiles(machinesPath);

  console.log(`📊 Trouvé ${machineFiles.length} machines`);

  const machines: MachineMeta[] = [];

  for (const file of machineFiles) {
    const meta = parseMachineFile(file);
    if (meta) {
      machines.push(meta);
      console.log(`  ✓ ${meta.id} (${meta.states.length} états, ${meta.events.length} événements)`);
    }
  }

  // Trier par catégorie puis par nom
  machines.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Statistiques
  const categories = new Set(machines.map(m => m.category));
  const totalStates = machines.reduce((sum, m) => sum + m.states.length, 0);
  const totalEvents = machines.reduce((sum, m) => sum + m.events.length, 0);

  console.log(`\n✅ Parsé ${machines.length} machines avec succès`);
  console.log(`📁 ${categories.size} catégories: ${Array.from(categories).join(', ')}`);
  console.log(`📊 Total: ${totalStates} états, ${totalEvents} événements`);

  // Keep machines minimal - legal sources are in separate file
  // This keeps machines-metadata.json small and fast to load
  const enrichedMachines = machines.map((machine) => {
    return {
      ...machine,
      // Only include minimal metadata needed for listing/browsing
      // Legal sources are loaded separately from legal-sources.json
    };
  });

  // Générer le JSON
  const output = {
    generated: new Date().toISOString(),
    totalMachines: machines.length,
    categories: Array.from(categories).sort(),
    machines: enrichedMachines,
    statistics: {
      totalStates,
      totalEvents,
      averageStatesPerMachine: (totalStates / machines.length).toFixed(1),
      averageEventsPerMachine: (totalEvents / machines.length).toFixed(1),
    },
  };

  // Write to both locations
  const docsPath = path.join(__dirname, '..', 'docs', 'machines-metadata.json');
  const astroPath = path.join(__dirname, '..', 'docs-astro', 'public', 'machines-metadata.json');
  
  fs.writeFileSync(docsPath, JSON.stringify(output, null, 2), 'utf-8');
  fs.writeFileSync(astroPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✨ Généré: ${docsPath}`);
  console.log(`✨ Généré: ${astroPath}`);
  console.log(`📦 Taille: ${(fs.statSync(docsPath).size / 1024).toFixed(2)} KB`);
  console.log(`\n💡 Note: Legal sources are in separate legal-sources.json file`);
  console.log(`   Run: npm run docs:legal-sources to generate it`);
}

main().catch(console.error);
